import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { OpportunityStage } from '@/types'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { contractId } = await request.json()

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      )
    }

    // Get the contract details
    const contract = await prisma.contract.findUnique({
      where: { id: contractId },
    })

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      )
    }

    // Create opportunity from contract data
    const opportunity = await prisma.opportunity.create({
      data: {
        title: contract.title,
        description: contract.description || '',
        solNo: contract.contractNumber,
        agency: contract.agency,
        type: contract.type || 'RFP',
        setAside: contract.setAside || '',
        postedDate: new Date(),
        dueDate: null, // Will need to be filled in by user
        estimatedValue: contract.value,
        naics: contract.naicsCode || '',
        placeOfPerformance: contract.popLocation || '',
        stage: OpportunityStage.AWARDED, // Start as awarded since it was a contract
        priority: 'MEDIUM',
        status: 'OPEN',
        notes: `Reverted from contract on ${new Date().toLocaleDateString()}. Original contract: ${contract.contractNumber}. ${contract.notes || ''}`.trim(),
        vendorId: contract.vendorId,
      },
    })

    // Delete the contract
    await prisma.contract.delete({
      where: { id: contractId },
    })

    return NextResponse.json({ 
      success: true, 
      opportunity,
      message: 'Contract successfully reverted to opportunity'
    })

  } catch (error) {
    console.error('Error reverting contract to opportunity:', error)
    return NextResponse.json(
      { error: 'Failed to revert contract to opportunity' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}