import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Add SAM.gov opportunity to pipeline
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { organizationId } = body

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    // Get the SAM.gov opportunity
    const samGovOpp = await prisma.samGovOpportunity.findUnique({
      where: { id: params.id },
    })

    if (!samGovOpp) {
      return NextResponse.json({ error: 'SAM.gov opportunity not found' }, { status: 404 })
    }

    // Check if already added to pipeline
    if (samGovOpp.addedToPipeline) {
      return NextResponse.json({ error: 'This opportunity has already been added to the pipeline' }, { status: 400 })
    }

    // Create opportunity in pipeline
    const opportunity = await prisma.opportunity.create({
      data: {
        samGovOpportunityId: samGovOpp.id,
        solicitationNumber: samGovOpp.solicitationNumber || samGovOpp.noticeId,
        title: samGovOpp.title,
        description: samGovOpp.description,
        organizationId,
        agencyName: samGovOpp.agencyName || 'Unknown',
        departmentName: samGovOpp.departmentName,
        officeName: samGovOpp.officeName,
        noticeType: samGovOpp.noticeType,
        baseType: samGovOpp.baseType,
        naicsCode: samGovOpp.naicsCode,
        setAsideType: samGovOpp.setAsideType,
        postedDate: samGovOpp.postedDate,
        responseDeadline: samGovOpp.responseDeadline,
        archiveDate: samGovOpp.archiveDate,
        estimatedValue: samGovOpp.estimatedValue,
        descriptionLink: samGovOpp.descriptionLink,
        additionalInfoLink: samGovOpp.additionalInfoLink,
        stage: 'Identified',
        status: 'Active',
        probability: 50, // Default probability
      },
    })

    // Mark SAM.gov opportunity as added to pipeline
    await prisma.samGovOpportunity.update({
      where: { id: params.id },
      data: {
        addedToPipeline: true,
        addedToPipelineAt: new Date(),
      },
    })

    return NextResponse.json(opportunity, { status: 201 })
  } catch (error: any) {
    console.error('Add to pipeline error:', error)

    // Return more descriptive error message
    let errorMessage = 'Failed to add opportunity to pipeline'
    if (error.code === 'P2003') {
      errorMessage = 'Invalid organization ID. Please refresh the page and try again.'
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
