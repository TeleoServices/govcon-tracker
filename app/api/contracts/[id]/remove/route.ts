import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Remove contract
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the contract
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
    })

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Delete the contract
    await prisma.contract.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true, message: 'Contract removed successfully' })
  } catch (error: any) {
    console.error('Remove contract error:', error)
    return NextResponse.json({ error: 'Failed to remove contract' }, { status: 500 })
  }
}
