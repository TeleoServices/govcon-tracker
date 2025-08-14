import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return empty array for now - vendors will be managed separately
    // or migrated to Supabase later
    const vendors: any[] = []
    return NextResponse.json(vendors)
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return NextResponse.json({ error: 'Failed to fetch vendors' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Vendors are not supported yet in this version
  return NextResponse.json(
    { error: 'Vendor management is not yet implemented' },
    { status: 501 }
  )
}