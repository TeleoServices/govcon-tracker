import { NextRequest, NextResponse } from 'next/server'
import { samSyncService } from '@/lib/sam-sync'
import { z } from 'zod'

const syncRequestSchema = z.object({
  dateFrom: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be in MM/dd/yyyy format'),
  dateTo: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be in MM/dd/yyyy format'),
  naicsCode: z.string().optional(),
  procurementTypes: z.string().optional(), // comma-separated
  state: z.string().optional(),
  setAsideType: z.string().optional(),
  activeOnly: z.boolean().optional().default(true),
  responseDueDateFrom: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be in MM/dd/yyyy format').optional(),
  responseDueDateTo: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be in MM/dd/yyyy format').optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = syncRequestSchema.parse(body)
    
    // Check if sync is already running
    const isRunning = await samSyncService.isSyncRunning()
    if (isRunning) {
      return NextResponse.json(
        { error: 'A sync operation is already running' },
        { status: 409 }
      )
    }
    
    console.log('Starting manual SAM.gov sync with parameters:', data)
    
    // Start sync (this will run in background)
    const syncPromise = samSyncService.manualSync(data)
    
    // Don't await - let it run in background
    syncPromise.catch(error => {
      console.error('Background sync error:', error)
    })
    
    return NextResponse.json({
      success: true,
      message: 'Sync operation started',
      parameters: data
    })
  } catch (error) {
    console.error('Error starting sync:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    
    return NextResponse.json(
      { error: 'Failed to start sync' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const status = await samSyncService.getSyncStatus()
    
    return NextResponse.json({
      success: true,
      data: status
    })
  } catch (error) {
    console.error('Error fetching sync status:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch sync status' },
      { status: 500 }
    )
  }
}