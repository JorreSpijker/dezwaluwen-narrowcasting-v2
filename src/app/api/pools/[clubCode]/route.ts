import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clubCode: string }> }
) {
  try {
    const { clubCode } = await params
    
    if (!clubCode) {
      return NextResponse.json(
        { error: 'Club code is required' },
        { status: 400 }
      )
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_KORFBAL_API_BASE_URL || 'https://api-mijn.korfbal.nl/api/v2'}/pools/club/${clubCode}`
    
    const response = await fetch(apiUrl, {
      next: { 
        revalidate: 3600, // Cache for 1 hour
        tags: ['pools', `pools-${clubCode}`]
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
        // ETag for conditional requests
        'ETag': `"pools-${clubCode}-v1"`,
        // Vary header for proper caching
        'Vary': 'Accept-Encoding',
        // Last modified for better cache validation  
        'Last-Modified': new Date().toUTCString()
      }
    })
  } catch (error) {
    console.error('Error fetching pools:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pools data' },
      { status: 500 }
    )
  }
}
