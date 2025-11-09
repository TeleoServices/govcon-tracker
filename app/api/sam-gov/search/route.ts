import { NextRequest, NextResponse } from 'next/server'
import { samGovApi } from '@/lib/services/samGovApi'

// Mark this route as dynamic
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const params = {
      keyword: searchParams.get('keyword') || undefined,
      naicsCode: searchParams.get('naicsCode') || undefined,
      state: searchParams.get('state') || undefined,
      setAside: searchParams.get('setAside') || undefined,
      postedFrom: searchParams.get('postedFrom') || undefined,
      postedTo: searchParams.get('postedTo') || undefined,
      responseFrom: searchParams.get('responseFrom') || undefined,
      responseTo: searchParams.get('responseTo') || undefined,
      limit: parseInt(searchParams.get('limit') || '25'),
      offset: parseInt(searchParams.get('offset') || '0'),
    }

    const result = await samGovApi.searchOpportunities(params)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', details: error.message },
      { status: 500 }
    )
  }
}
