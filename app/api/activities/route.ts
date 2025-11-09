import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const opportunityId = searchParams.get('opportunityId')
    const contractId = searchParams.get('contractId')
    const subcontractorId = searchParams.get('subcontractorId')
    const entityType = searchParams.get('entityType')
    const activityType = searchParams.get('activityType')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const activities = await prisma.activity.findMany({
      where: {
        ...(opportunityId && { opportunityId }),
        ...(contractId && { contractId }),
        ...(subcontractorId && { subcontractorId }),
        ...(entityType && { entityType }),
        ...(activityType && { activityType }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        subcontractor: {
          select: {
            id: true,
            companyName: true,
          },
        },
        opportunity: {
          select: {
            id: true,
            title: true,
            solicitationNumber: true,
          },
        },
        contract: {
          select: {
            id: true,
            contractNumber: true,
            title: true,
          },
        },
      },
      orderBy: {
        activityDate: 'desc',
      },
      take: limit,
      skip: offset,
    })

    // Get total count for pagination
    const total = await prisma.activity.count({
      where: {
        ...(opportunityId && { opportunityId }),
        ...(contractId && { contractId }),
        ...(subcontractorId && { subcontractorId }),
        ...(entityType && { entityType }),
        ...(activityType && { activityType }),
      },
    })

    return NextResponse.json({
      activities,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      organizationId = 'demo-org-id',
      entityType,
      entityId,
      activityType,
      description,
      userId = 'demo-user-id',
      opportunityId,
      contractId,
      subcontractorId,
      metadata,
    } = body

    // Validate required fields
    if (!entityType || !entityId || !activityType || !description) {
      return NextResponse.json(
        { error: 'entityType, entityId, activityType, and description are required' },
        { status: 400 }
      )
    }

    const activity = await prisma.activity.create({
      data: {
        organizationId,
        entityType,
        entityId,
        activityType,
        description,
        userId,
        opportunityId,
        contractId,
        subcontractorId,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        subcontractor: {
          select: {
            id: true,
            companyName: true,
          },
        },
        opportunity: {
          select: {
            id: true,
            title: true,
            solicitationNumber: true,
          },
        },
        contract: {
          select: {
            id: true,
            contractNumber: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Error creating activity:', error)
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    )
  }
}
