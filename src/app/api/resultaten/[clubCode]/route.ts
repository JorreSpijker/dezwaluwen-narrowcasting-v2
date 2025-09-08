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

    // Default date logic: dateFrom = 7 dagen geleden, dateTo = vandaag
    const today = new Date()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 7)

    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0] // YYYY-MM-DD format
    }

    const dateFrom = searchParams.get('dateFrom') || formatDate(sevenDaysAgo)
    const dateTo = searchParams.get('dateTo') || formatDate(today)

    const params_string = new URLSearchParams()
    params_string.append('dateFrom', dateFrom)
    params_string.append('dateTo', dateTo)

    const apiUrl = `${process.env.NEXT_PUBLIC_KORFBAL_API_BASE_URL || 'https://api-mijn.korfbal.nl/api/v2'}/clubs/${clubCode}/results?${params_string.toString()}`
    
    const response = await fetch(apiUrl, {
      next: { 
        revalidate: 1800, // Cache for 30 minutes (results change less frequently than program)
        tags: ['resultaten', `resultaten-${clubCode}`]
      }
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data, {
      headers: {
        // Browser caching (15 min) + Server caching (30 min) + Stale-while-revalidate (12 hours)
        'Cache-Control': 'public, max-age=900, s-maxage=1800, stale-while-revalidate=43200, must-revalidate',
        // ETag for conditional requests
        'ETag': `"resultaten-${clubCode}-v1"`,
        // Vary header for proper caching
        'Vary': 'Accept-Encoding',
        // Last modified for better cache validation  
        'Last-Modified': new Date().toUTCString()
      }
    })
  } catch (error) {
    console.error('Error fetching resultaten:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resultaten data' },
      { status: 500 }
    )
  }
}
