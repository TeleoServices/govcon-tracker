import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Return empty array for now - contracts will be managed separately
    // or migrated to Supabase later
    const contracts: any[] = []
    return NextResponse.json(contracts)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Contracts are not supported yet in this version
  return NextResponse.json(
    { error: 'Contract management is not yet implemented' },
    { status: 501 }
  )
}