import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get the first organization (for demo purposes)
export async function GET() {
  try {
    const org = await prisma.organization.findFirst()

    if (!org) {
      return NextResponse.json({ error: 'No organization found' }, { status: 404 })
    }

    return NextResponse.json(org)
  } catch (error) {
    console.error('Organization API error:', error)
    return NextResponse.json({ error: 'Failed to fetch organization' }, { status: 500 })
  }
}
