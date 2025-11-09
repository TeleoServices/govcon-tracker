import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Mark opportunity as won and create contract
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { contractNumber, awardAmount, startDate, endDate } = body

    if (!contractNumber) {
      return NextResponse.json({ error: 'Contract number is required' }, { status: 400 })
    }

    // Get the opportunity
    const opp = await prisma.opportunity.findUnique({
      where: { id: params.id },
    })

    if (!opp) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // Check if already won
    if (opp.status === 'Won') {
      return NextResponse.json({ error: 'This opportunity has already been marked as won' }, { status: 400 })
    }

    // Update opportunity to Won status
    const updatedOpp = await prisma.opportunity.update({
      where: { id: params.id },
      data: {
        status: 'Won',
        wonDate: new Date(),
        contractNumber,
        stage: 'Submitted', // Ensure it's in final stage
      },
    })

    // Create contract record
    const contractValue = awardAmount || opp.estimatedValue || 0
    const contract = await prisma.contract.create({
      data: {
        contractNumber,
        title: opp.title,
        opportunityId: opp.id,
        organizationId: opp.organizationId,
        agencyName: opp.agencyName || 'Unknown',
        contractType: opp.noticeType || 'Unknown',
        baseValue: contractValue,
        totalValue: contractValue,
        currentValue: contractValue,
        awardDate: new Date(),
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        status: 'Active',
      },
    })

    return NextResponse.json({ opportunity: updatedOpp, contract }, { status: 200 })
  } catch (error: any) {
    console.error('Mark won error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A contract with this number already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to mark opportunity as won' }, { status: 500 })
  }
}
