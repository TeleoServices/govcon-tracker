import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
      include: {
        vendor: true,
      },
    })
    
    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 })
    }
    
    return NextResponse.json(opportunity)
  } catch (error) {
    console.error('Error fetching opportunity:', error)
    return NextResponse.json({ error: 'Failed to fetch opportunity' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    
    // Filter out read-only fields and transform data for SQLite
    const {
      id,
      createdAt,
      updatedAt,
      vendor,
      contactLogs,
      ...updateData
    } = body
    
    const transformedData = {
      ...updateData,
      attachments: Array.isArray(updateData.attachments) ? JSON.stringify(updateData.attachments) : updateData.attachments,
      vendorId: updateData.vendorId === "" ? null : updateData.vendorId,
    }
    
    const opportunity = await prisma.opportunity.update({
      where: { id: params.id },
      data: transformedData,
      include: {
        vendor: true,
      },
    })
    return NextResponse.json(opportunity)
  } catch (error) {
    console.error('Error updating opportunity:', error)
    return NextResponse.json({ error: 'Failed to update opportunity' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.opportunity.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: 'Opportunity deleted successfully' })
  } catch (error) {
    console.error('Error deleting opportunity:', error)
    return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 })
  }
}