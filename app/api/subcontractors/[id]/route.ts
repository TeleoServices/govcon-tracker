import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subcontractor = await prisma.subcontractor.findUnique({
      where: { id: params.id },
      include: {
        quotes: true,
        activities: {
          orderBy: { activityDate: 'desc' },
          take: 10,
        },
      },
    })

    if (!subcontractor) {
      return NextResponse.json({ error: 'Subcontractor not found' }, { status: 404 })
    }

    return NextResponse.json(subcontractor)
  } catch (error) {
    console.error('Subcontractor GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch subcontractor' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Remove fields that shouldn't be updated directly
    const { id, organizationId, createdAt, updatedAt, quotes, activities, ...updateData } = body

    const subcontractor = await prisma.subcontractor.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(subcontractor)
  } catch (error: any) {
    console.error('Subcontractor PATCH error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Subcontractor not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to update subcontractor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.subcontractor.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Subcontractor deleted successfully' })
  } catch (error: any) {
    console.error('Subcontractor DELETE error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Subcontractor not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to delete subcontractor' }, { status: 500 })
  }
}
