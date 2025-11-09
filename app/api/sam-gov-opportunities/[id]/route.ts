import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get a single SAM.gov opportunity
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const samGovOpp = await prisma.samGovOpportunity.findUnique({
      where: { id: params.id },
    })

    if (!samGovOpp) {
      return NextResponse.json({ error: 'SAM.gov opportunity not found' }, { status: 404 })
    }

    return NextResponse.json(samGovOpp)
  } catch (error) {
    console.error('SAM.gov opportunity GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch SAM.gov opportunity' }, { status: 500 })
  }
}
