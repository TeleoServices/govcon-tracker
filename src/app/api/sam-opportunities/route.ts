import { NextRequest, NextResponse } from 'next/server'
import { samDatabaseOps } from '@/lib/sam-database'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '25'), 100) // Max 100 per page
    const naicsCode = searchParams.get('naicsCode') || undefined
    const activeOnly = searchParams.get('activeOnly') !== 'false'
    const postedAfter = searchParams.get('postedAfter') || undefined
    const searchTerm = searchParams.get('search') || undefined
    const state = searchParams.get('state') || undefined
    const setAsideType = searchParams.get('setAsideType') || undefined
    const postedDateFrom = searchParams.get('postedDateFrom') || undefined
    const postedDateTo = searchParams.get('postedDateTo') || undefined
    const responseDueFrom = searchParams.get('responseDueFrom') || undefined
    const responseDueTo = searchParams.get('responseDueTo') || undefined
    
    const filters = {
      naicsCode,
      activeOnly,
      postedAfter: postedDateFrom || postedAfter, // Use new posted date from filter if available
      searchTerm,
      state,
      setAsideType,
      postedDateTo,
      responseDueFrom,
      responseDueTo
    }
    
    const results = await samDatabaseOps.getOpportunities(filters, page, pageSize)
    
    return NextResponse.json({
      success: true,
      data: results.data,
      pagination: {
        page: results.page,
        pageSize: results.pageSize,
        totalCount: results.totalCount,
        totalPages: results.totalPages,
        hasNext: results.page < results.totalPages,
        hasPrev: results.page > 1
      }
    })
  } catch (error) {
    console.error('Error fetching SAM opportunities:', error)
    
    
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    )
  }
}