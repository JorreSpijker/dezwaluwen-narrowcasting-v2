import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tags, clubCode } = body

    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'Tags array is required' },
        { status: 400 }
      )
    }

    // Revalidate general tags
    for (const tag of tags) {
      revalidateTag(tag)
    }

    // If clubCode is provided, also revalidate club-specific tags
    if (clubCode) {
      revalidateTag(`pools-${clubCode}`)
      revalidateTag(`program-${clubCode}`)
    }

    return NextResponse.json({ 
      success: true, 
      revalidated: tags,
      clubCode: clubCode || null
    })
  } catch (error) {
    console.error('Error revalidating cache:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate cache' },
      { status: 500 }
    )
  }
}
