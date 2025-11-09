import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: params.id },
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

    if (!activity) {
      return NextResponse.json(
        { error: 'Contact log not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Error fetching contact log:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact log' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { description, metadata } = body

    const activity = await prisma.activity.update({
      where: { id: params.id },
      data: {
        description,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
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

    return NextResponse.json(activity)
  } catch (error) {
    console.error('Error updating contact log:', error)
    return NextResponse.json(
      { error: 'Failed to update contact log' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.activity.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting contact log:', error)
    return NextResponse.json(
      { error: 'Failed to delete contact log' },
      { status: 500 }
    )
  }
}
