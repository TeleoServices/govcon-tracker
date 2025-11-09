import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Update opportunity stage
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { stage } = body

    if (!stage) {
      return NextResponse.json({ error: 'Stage is required' }, { status: 400 })
    }

    // Valid stages
    const validStages = ['Identified', 'Pursuit', 'Capture', 'Proposal Dev', 'Submitted']
    if (!validStages.includes(stage)) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
    }

    const opportunity = await prisma.opportunity.update({
      where: { id: params.id },
      data: { stage },
    })

    return NextResponse.json(opportunity)
  } catch (error: any) {
    console.error('Stage update error:', error)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update stage' }, { status: 500 })
  }
}
