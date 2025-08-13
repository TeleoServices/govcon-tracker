import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const contracts = await prisma.contract.findMany({
      include: {
        vendor: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(contracts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const contract = await prisma.contract.create({
      data: body,
      include: {
        vendor: true,
      },
    })
    return NextResponse.json(contract, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 })
  }
}