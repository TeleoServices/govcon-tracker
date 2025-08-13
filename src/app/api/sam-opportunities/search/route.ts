import { NextRequest, NextResponse } from 'next/server'
import { samDatabaseOps } from '@/lib/sam-database'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    await requireAuth(token)
    
    const url = new URL(request.url)
    const searchParams = url.searchParams
    
    const searchTerm = searchParams.get('q')
    if (!searchTerm) {
      return NextResponse.json(
        { error: 'Search term (q) is required' },
        { status: 400 }
      )
    }
    
    const naicsCode = searchParams.get('naicsCode') || undefined
    const activeOnly = searchParams.get('activeOnly') !== 'false'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    
    const filters = {
      naicsCode,
      activeOnly,
      limit
    }
    
    const results = await samDatabaseOps.searchOpportunities(searchTerm, filters)
    
    return NextResponse.json({
      success: true,
      data: results,
      searchTerm,
      count: results.length
    })
  } catch (error) {
    console.error('Error searching SAM opportunities:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Failed to search opportunities' },
      { status: 500 }
    )
  }
}