import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const opportunityId = searchParams.get('opportunityId')
    const subcontractorId = searchParams.get('subcontractorId')

    const quotes = await prisma.quote.findMany({
      where: {
        ...(opportunityId && { opportunityId }),
        ...(subcontractorId && { subcontractorId }),
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
      orderBy: {
        quoteDate: 'desc',
      },
    })

    return NextResponse.json(quotes)
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      opportunityId,
      subcontractorId,
      amount,
      quoteDate,
      validUntil,
      status,
      notes,
      organizationId = 'demo-org-id',
      userId = 'demo-user-id',
    } = body

    // Validate required fields
    if (!amount || !quoteDate) {
      return NextResponse.json(
        { error: 'Amount and quote date are required' },
        { status: 400 }
      )
    }

    const quote = await prisma.quote.create({
      data: {
        organizationId,
        opportunityId,
        subcontractorId,
        amount: parseFloat(amount),
        quoteDate: new Date(quoteDate),
        validUntil: validUntil ? new Date(validUntil) : undefined,
        status: status || 'Pending',
        notes,
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
    if (opportunityId) {
      await prisma.activity.create({
        data: {
          organizationId,
          entityType: 'Quote',
          entityId: quote.id,
          activityType: 'Created',
          description: `Quote received${quote.subcontractor ? ` from ${quote.subcontractor.companyName}` : ''} for $${amount.toLocaleString()}`,
          userId,
          opportunityId,
          subcontractorId,
        },
      })
    }

    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    )
  }
}
