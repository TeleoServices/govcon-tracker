import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const vendors = await prisma.vendor.findMany({
      include: {
        contracts: true,
        opportunities: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    return NextResponse.json(vendors)
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Transform arrays to JSON strings for SQLite
    const transformedData = {
      ...body,
      capabilities: Array.isArray(body.capabilities) ? JSON.stringify(body.capabilities) : body.capabilities,
      naicsCode: Array.isArray(body.naicsCode) ? JSON.stringify(body.naicsCode) : body.naicsCode,
      certifications: Array.isArray(body.certifications) ? JSON.stringify(body.certifications) : body.certifications,
    }
    
    const vendor = await prisma.vendor.create({
      data: transformedData,
      include: {
        contracts: true,
        opportunities: true,
      },
    })
    return NextResponse.json(vendor, { status: 201 })
  } catch (error) {
    console.error('Error creating vendor:', error)
    return NextResponse.json({ error: 'Failed to create vendor' }, { status: 500 })
  }
}