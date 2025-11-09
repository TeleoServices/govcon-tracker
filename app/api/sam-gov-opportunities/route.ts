import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List all SAM.gov opportunities (review queue)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Filters
    const addedToPipeline = searchParams.get('addedToPipeline')
    const agency = searchParams.get('agency')
    const noticeType = searchParams.get('noticeType')
    const setAsideType = searchParams.get('setAsideType')
    const search = searchParams.get('search')

    const where: any = {}

    // Filter by pipeline status
    if (addedToPipeline !== null) {
      where.addedToPipeline = addedToPipeline === 'true'
    }

    // Filter by agency
    if (agency) {
      where.agencyName = { contains: agency, mode: 'insensitive' }
    }

    // Filter by notice type
    if (noticeType) {
      where.noticeType = noticeType
    }

    // Filter by set aside type
    if (setAsideType) {
      where.setAsideType = setAsideType
    }

    // Search across title and description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { solicitationNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    const samGovOpportunities = await prisma.samGovOpportunity.findMany({
      where,
      orderBy: {
        postedDate: 'desc',
      },
    })

    return NextResponse.json(samGovOpportunities)
  } catch (error) {
    console.error('SAM.gov opportunities API error:', error)
    return NextResponse.json({ error: 'Failed to fetch SAM.gov opportunities' }, { status: 500 })
  }
}
