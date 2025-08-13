import { NextRequest, NextResponse } from 'next/server'
import { samDatabaseOps } from '@/lib/sam-database'
import { requireAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { noticeId: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    await requireAuth(token)
    
    const opportunity = await samDatabaseOps.getOpportunityByNoticeId(params.noticeId)
    
    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: opportunity
    })
  } catch (error) {
    console.error('Error fetching SAM opportunity:', error)
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch opportunity' },
      { status: 500 }
    )
  }
}