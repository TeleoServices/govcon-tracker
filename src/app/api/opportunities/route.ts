import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const opportunities = await prisma.opportunity.findMany({
      include: {
        vendor: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    })
    return NextResponse.json(opportunities)
  } catch (error) {
    console.error('Error fetching opportunities:', error)
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Transform arrays to JSON strings for SQLite
    const transformedData = {
      ...body,
      attachments: Array.isArray(body.attachments) ? JSON.stringify(body.attachments) : body.attachments,
      vendorId: body.vendorId === "" ? null : body.vendorId,
    }
    
    const opportunity = await prisma.opportunity.create({
      data: transformedData,
      include: {
        vendor: true,
      },
    })
    return NextResponse.json(opportunity, { status: 201 })
  } catch (error) {
    console.error('Error creating opportunity:', error)
    return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 })
  }
}