import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Remove opportunity from pipeline
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the opportunity
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
    })

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }

    // If this opportunity came from SAM.gov, mark it as no longer in pipeline
    if (opportunity.samGovOpportunityId) {
      await prisma.samGovOpportunity.update({
        where: { id: opportunity.samGovOpportunityId },
        data: {
          addedToPipeline: false,
          addedToPipelineAt: null,
        },
      })
    }

    // Delete the opportunity from the pipeline
    await prisma.opportunity.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Opportunity removed from pipeline' })
  } catch (error: any) {
    console.error('Remove from pipeline error:', error)
    return NextResponse.json({ error: 'Failed to remove opportunity from pipeline' }, { status: 500 })
  }
}
