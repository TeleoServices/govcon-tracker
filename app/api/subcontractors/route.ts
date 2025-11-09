import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const subcontractors = await prisma.subcontractor.findMany({
      orderBy: {
        companyName: 'asc',
      },
    })

    return NextResponse.json(subcontractors)
  } catch (error) {
    console.error('Subcontractors API error:', error)
    return NextResponse.json({ error: 'Failed to fetch subcontractors' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // For demo purposes, using a hardcoded organizationId
    // In production, get this from session
    const organizationId = 'demo-org-id'

    const subcontractor = await prisma.subcontractor.create({
      data: {
        organizationId,
        companyName: body.companyName,
        dunsNumber: body.dunsNumber || null,
        cageCode: body.cageCode || null,
        contactName: body.contactName || null,
        email: body.email || null,
        phone: body.phone || null,
        specialties: body.specialties || null,
        performanceRating: body.performanceRating || null,
        status: body.status || 'Active',
        samRegistered: body.samRegistered || false,
      },
    })

    return NextResponse.json(subcontractor, { status: 201 })
  } catch (error: any) {
    console.error('Subcontractor POST error:', error)

    if (error.code === 'P2003') {
      return NextResponse.json({ error: 'Invalid organization ID' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create subcontractor' }, { status: 500 })
  }
}
