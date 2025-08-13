import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { vendorSchema } from '@/lib/validation'
import { z } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vendor = await prisma.vendor.findUnique({
      where: { id: params.id },
      include: {
        contracts: true,
        opportunities: true,
        contactLogs: true
      }
    })

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(vendor)
  } catch (error) {
    console.error('Error fetching vendor:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vendor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Transform arrays to JSON strings for SQLite
    const transformedData = {
      ...body,
      capabilities: Array.isArray(body.capabilities) 
        ? JSON.stringify(body.capabilities) 
        : body.capabilities,
      naicsCode: Array.isArray(body.naicsCode) 
        ? JSON.stringify(body.naicsCode) 
        : body.naicsCode,
      certifications: Array.isArray(body.certifications) 
        ? JSON.stringify(body.certifications) 
        : body.certifications,
    }

    // Remove read-only fields
    const {
      id,
      createdAt,
      updatedAt,
      contracts,
      opportunities,
      contactLogs,
      ...updateData
    } = transformedData

    const vendor = await prisma.vendor.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(vendor)
  } catch (error) {
    console.error('Error updating vendor:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update vendor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.vendor.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vendor:', error)
    return NextResponse.json(
      { error: 'Failed to delete vendor' },
      { status: 500 }
    )
  }
}