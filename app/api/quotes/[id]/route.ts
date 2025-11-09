import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: {
        subcontractor: {
          select: {
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
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

    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error fetching quote:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
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
    const {
      amount,
      quoteDate,
      validUntil,
      status,
      notes,
    } = body

    const quote = await prisma.quote.update({
      where: { id: params.id },
      data: {
        ...(amount && { amount: parseFloat(amount) }),
        ...(quoteDate && { quoteDate: new Date(quoteDate) }),
        ...(validUntil && { validUntil: new Date(validUntil) }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        subcontractor: {
          select: {
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
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

    // Log activity
    if (quote.opportunityId) {
      await prisma.activity.create({
        data: {
          organizationId: quote.organizationId,
          entityType: 'Quote',
          entityId: quote.id,
          activityType: 'Updated',
          description: `Quote updated${quote.subcontractor ? ` for ${quote.subcontractor.companyName}` : ''} - Status: ${status || quote.status}`,
          userId: 'demo-user-id',
          opportunityId: quote.opportunityId,
          subcontractorId: quote.subcontractorId,
        },
      })
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error('Error updating quote:', error)
    return NextResponse.json(
      { error: 'Failed to update quote' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.quote.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting quote:', error)
    return NextResponse.json(
      { error: 'Failed to delete quote' },
      { status: 500 }
    )
  }
}
