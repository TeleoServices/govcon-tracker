import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List all contracts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Filters
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const contractType = searchParams.get('contractType')

    const where: any = {}

    // Filter by status
    if (status) {
      where.status = status
    }

    // Filter by contract type
    if (contractType) {
      where.contractType = contractType
    }

    // Search across contract number, title, agency
    if (search) {
      where.OR = [
        { contractNumber: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { agencyName: { contains: search, mode: 'insensitive' } },
      ]
    }

    const contracts = await prisma.contract.findMany({
      where,
      include: {
        opportunity: true, // Include source opportunity if available
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(contracts)
  } catch (error) {
    console.error('Contracts API error:', error)
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 })
  }
}

// POST - Create new contract
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      contractNumber,
      title,
      organizationId,
      agencyName,
      contractType,
      status = 'Active',
      baseValue,
      totalValue,
      currentValue,
      awardDate,
      startDate,
      endDate,
      opportunityId,
    } = body

    // Validate required fields
    if (!contractNumber || !title || !organizationId || !agencyName || !contractType) {
      return NextResponse.json(
        { error: 'Missing required fields: contractNumber, title, organizationId, agencyName, contractType' },
        { status: 400 }
      )
    }

    if (!baseValue || !totalValue || !currentValue) {
      return NextResponse.json(
        { error: 'Missing required financial fields: baseValue, totalValue, currentValue' },
        { status: 400 }
      )
    }

    if (!awardDate || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required date fields: awardDate, startDate, endDate' },
        { status: 400 }
      )
    }

    // Check if contract number already exists
    const existing = await prisma.contract.findUnique({
      where: { contractNumber },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Contract number already exists' },
        { status: 400 }
      )
    }

    // Create contract
    const contract = await prisma.contract.create({
      data: {
        contractNumber,
        title,
        organizationId,
        agencyName,
        contractType,
        status,
        baseValue: parseFloat(baseValue),
        totalValue: parseFloat(totalValue),
        currentValue: parseFloat(currentValue),
        awardDate: new Date(awardDate),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        opportunityId: opportunityId || null,
      },
      include: {
        opportunity: true,
      },
    })

    return NextResponse.json(contract, { status: 201 })
  } catch (error: any) {
    console.error('Create contract error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create contract' },
      { status: 500 }
    )
  }
}
