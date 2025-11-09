import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, fetching all activities of type Contact
    const searchParams = request.nextUrl.searchParams
    const subcontractorId = searchParams.get('subcontractorId')
    const opportunityId = searchParams.get('opportunityId')

    const activities = await prisma.activity.findMany({
      where: {
        activityType: 'Contact',
        ...(subcontractorId && { subcontractorId }),
        ...(opportunityId && { opportunityId }),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        subcontractor: {
          select: {
            companyName: true,
          },
        },
        opportunity: {
          select: {
            title: true,
            solicitationNumber: true,
          },
        },
      },
      orderBy: {
        activityDate: 'desc',
      },
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching contact log:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact log' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      subcontractorId,
      opportunityId,
      contactType,
      description,
      status,
      organizationId = 'demo-org-id',
      userId = 'demo-user-id',
    } = body

    // Validate required fields
    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      )
    }

    const activity = await prisma.activity.create({
      data: {
        organizationId,
        entityType: 'Subcontractor',
        entityId: subcontractorId || 'unknown',
        activityType: 'Contact',
        description,
        userId,
        subcontractorId,
        opportunityId,
        metadata: JSON.stringify({
          contactType,
          status,
        }),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        subcontractor: {
          select: {
            companyName: true,
          },
        },
        opportunity: {
          select: {
            title: true,
            solicitationNumber: true,
          },
        },
      },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Error creating contact log:', error)
    return NextResponse.json(
      { error: 'Failed to create contact log' },
      { status: 500 }
    )
  }
}
