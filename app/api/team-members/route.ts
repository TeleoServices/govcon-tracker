import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const opportunityId = searchParams.get('opportunityId')

    if (!opportunityId) {
      return NextResponse.json(
        { error: 'opportunityId is required' },
        { status: 400 }
      )
    }

    const teamMembers = await prisma.teamMember.findMany({
      where: {
        opportunityId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        opportunity: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        assignedDate: 'desc',
      },
    })

    return NextResponse.json(teamMembers)
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json(
      { error: 'Failed to fetch team members' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      opportunityId,
      userId,
      role,
      organizationId = 'demo-org-id',
    } = body

    // Validate required fields
    if (!opportunityId || !userId || !role) {
      return NextResponse.json(
        { error: 'opportunityId, userId, and role are required' },
        { status: 400 }
      )
    }

    // Check if team member already exists
    const existing = await prisma.teamMember.findUnique({
      where: {
        opportunityId_userId: {
          opportunityId,
          userId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'User is already assigned to this opportunity' },
        { status: 400 }
      )
    }

    const teamMember = await prisma.teamMember.create({
      data: {
        opportunityId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        opportunity: {
          select: {
            title: true,
          },
        },
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        organizationId,
        entityType: 'TeamMember',
        entityId: teamMember.id,
        activityType: 'Assigned',
        description: `${teamMember.user.name || teamMember.user.email} assigned to "${teamMember.opportunity.title}" as ${role}`,
        userId,
        opportunityId,
      },
    })

    return NextResponse.json(teamMember, { status: 201 })
  } catch (error) {
    console.error('Error creating team member:', error)
    return NextResponse.json(
      { error: 'Failed to create team member' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const organizationId = searchParams.get('organizationId') || 'demo-org-id'

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    // Get team member info before deletion for logging
    const teamMember = await prisma.teamMember.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        opportunity: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!teamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    await prisma.teamMember.delete({
      where: { id },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        organizationId,
        entityType: 'TeamMember',
        entityId: id,
        activityType: 'Removed',
        description: `${teamMember.user.name || teamMember.user.email} removed from "${teamMember.opportunity.title}"`,
        userId: teamMember.userId,
        opportunityId: teamMember.opportunityId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json(
      { error: 'Failed to delete team member' },
      { status: 500 }
    )
  }
}
