import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubCode: string }> }
) {
  try {
    const { clubCode } = await params
    const { searchParams } = new URL(request.url)
    
    if (!clubCode) {
      return NextResponse.json(
        { error: 'Club code is required' },
        { status: 400 }
      )
    }

    const dateFrom = searchParams.get('dateFrom') || '2025-08-27'
    const dateTo = searchParams.get('dateTo') || '2026-09-10'

    const params_string = new URLSearchParams()
    params_string.append('dateFrom', dateFrom)
    params_string.append('dateTo', dateTo)

    const apiUrl = `${process.env.NEXT_PUBLIC_KORFBAL_API_BASE_URL || 'https://api-mijn.korfbal.nl/api/v2'}/clubs/${clubCode}/program?${params_string.toString()}`
    
    const response = await fetch(apiUrl, {
      next: { 
        revalidate: 3600, // Cache for 1 hour
        tags: ['wedstrijden', `wedstrijden-${clubCode}`]
      }
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data, {
      headers: {
        // Browser caching (30 min) + Server caching (1 hour) + Stale-while-revalidate (24 hours)
        'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400, must-revalidate',
        // ETag for conditional requests (simplified static value since data changes predictably)
        'ETag': `"wedstrijden-${clubCode}-v1"`,
        // Vary header for proper caching
        'Vary': 'Accept-Encoding',
        // Last modified for better cache validation  
        'Last-Modified': new Date().toUTCString()
      }
    })
  } catch (error) {
    console.error('Error fetching wedstrijden:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wedstrijden data' },
      { status: 500 }
    )
  }
}
