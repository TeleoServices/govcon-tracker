import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List pipeline opportunities (NOT SAM.gov review queue)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Filters
    const stage = searchParams.get('stage')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const agency = searchParams.get('agency')

    const where: any = {
      // organizationId is now required in schema for all pipeline opportunities
    }

    // Filter by stage
    if (stage) {
      where.stage = stage
    }

    // Filter by status (Active, Won, Lost) - default to Active only
    if (status) {
      where.status = status
    } else {
      // Default: only show Active opportunities (exclude Won/Lost)
      where.status = 'Active'
    }

    // Filter by agency
    if (agency) {
      where.agencyName = { contains: agency, mode: 'insensitive' }
    }

    // Search across title, solicitation number, description
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { solicitationNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        samGovOpportunity: true, // Include source SAM.gov data if available
      },
      orderBy: [
        { responseDeadline: 'asc' }, // Soonest deadlines first
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(opportunities)
  } catch (error) {
    console.error('Opportunities API error:', error)
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
  }
}
