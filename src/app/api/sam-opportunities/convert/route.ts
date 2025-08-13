import { NextRequest, NextResponse } from 'next/server'
import { samDatabaseOps } from '@/lib/sam-database'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const convertRequestSchema = z.object({
  noticeId: z.string(),
  vendorId: z.string().optional() // optional vendor to associate with
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { noticeId, vendorId } = convertRequestSchema.parse(body)
    
    // Get the SAM opportunity with full details
    const samOpportunity = await samDatabaseOps.getOpportunityByNoticeId(noticeId)
    
    if (!samOpportunity) {
      return NextResponse.json(
        { error: 'SAM opportunity not found' },
        { status: 404 }
      )
    }

    // Check if opportunity already exists
    const existingOpportunity = await prisma.opportunity.findUnique({
      where: { solNo: samOpportunity.solicitation_number || samOpportunity.notice_id }
    })

    if (existingOpportunity) {
      return NextResponse.json(
        { error: 'Opportunity already exists in local database' },
        { status: 409 }
      )
    }

    // Convert SAM opportunity to local opportunity format
    const localOpportunity = await prisma.opportunity.create({
      data: {
        solNo: samOpportunity.solicitation_number || samOpportunity.notice_id,
        title: samOpportunity.title,
        description: samOpportunity.description_link || 'Imported from SAM.gov',
        agency: samOpportunity.department_name || 'Unknown Agency',
        naics: samOpportunity.naics_code,
        stage: 'IDENTIFIED', // Default stage for new opportunities
        dueDate: samOpportunity.response_deadline ? new Date(samOpportunity.response_deadline) : null,
        priority: 'MEDIUM', // Default priority
        postedDate: new Date(samOpportunity.posted_date!),
        estimatedValue: null, // SAM.gov doesn't always have this
        type: samOpportunity.opportunity_type || 'Unknown',
        setAside: samOpportunity.set_aside_description,
        placeOfPerformance: samOpportunity.location,
        status: samOpportunity.active ? 'OPEN' : 'CLOSED',
        samUrl: samOpportunity.ui_link,
        vendorId: vendorId || null,
        notes: `Imported from SAM.gov on ${new Date().toISOString()}\n\nNotice ID: ${samOpportunity.notice_id}`
      }
    })

    return NextResponse.json({
      success: true,
      data: localOpportunity,
      message: 'Successfully converted SAM opportunity to local opportunity'
    })

  } catch (error) {
    console.error('Error converting SAM opportunity:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to convert opportunity' },
      { status: 500 }
    )
  }
}