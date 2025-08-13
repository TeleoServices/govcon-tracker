import { NextRequest, NextResponse } from 'next/server'
import { samSyncService } from '@/lib/sam-sync'

export async function GET(request: NextRequest) {
  try {
    const stats = await samSyncService.getStats()
    
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Error fetching SAM sync stats:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch stats',
        data: {
          lastSyncAt: null,
          totalOpportunities: 0,
          activeOpportunities: 0,
          isRunning: false,
          lastError: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    )
  }
}