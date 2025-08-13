import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const contactLogs = await prisma.contactLog.findMany({
      include: {
        subcontractor: true,
        opportunity: true,
      },
      orderBy: {
        date: 'desc',
      },
    })
    return NextResponse.json(contactLogs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contact logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const contactLog = await prisma.contactLog.create({
      data: {
        ...body,
        date: new Date(body.date),
      },
      include: {
        subcontractor: true,
        opportunity: true,
      },
    })
    return NextResponse.json(contactLog, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create contact log' }, { status: 500 })
  }
}