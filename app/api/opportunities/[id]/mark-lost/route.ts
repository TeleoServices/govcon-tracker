import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Mark opportunity as lost with feedback
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { lostReason, lostFeedback } = body

    if (!lostReason) {
      return NextResponse.json({ error: 'Lost reason is required' }, { status: 400 })
    }

    // Get the opportunity
    const opp = await prisma.opportunity.findUnique({
      where: { id: params.id },
    })

    if (!opp) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // Check if already lost or won
    if (opp.status === 'Lost') {
      return NextResponse.json({ error: 'This opportunity has already been marked as lost' }, { status: 400 })
    }
    if (opp.status === 'Won') {
      return NextResponse.json({ error: 'This opportunity has been won and cannot be marked as lost' }, { status: 400 })
    }

    // Update opportunity to Lost status
    const updatedOpp = await prisma.opportunity.update({
      where: { id: params.id },
      data: {
        status: 'Lost',
        lostDate: new Date(),
        lostReason,
        lostFeedback: lostFeedback || null,
      },
    })

    return NextResponse.json(updatedOpp, { status: 200 })
  } catch (error: any) {
    console.error('Mark lost error:', error)
    return NextResponse.json({ error: 'Failed to mark opportunity as lost' }, { status: 500 })
  }
}
