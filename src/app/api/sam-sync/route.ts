import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // SAM sync is not supported in this version
    // The sam_opportunities table is already populated with SAM.gov data
    return NextResponse.json({
      success: false,
      error: 'SAM.gov sync is not supported in this version',
      message: 'The database already contains current SAM.gov opportunities. Manual sync is not needed.'
    }, { status: 501 })
  } catch (error) {
    console.error('Error in sam-sync route:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Operation not supported',
      message: 'SAM.gov sync is not available in this version'
    }, { status: 501 })
  }
}