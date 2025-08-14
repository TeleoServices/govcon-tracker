import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // For this version, converting opportunities is not supported
    // since we're using the sam_opportunities table directly from Supabase
    return NextResponse.json({
      success: false,
      error: 'Converting opportunities is not supported in this version',
      message: 'All SAM.gov opportunities are already available in the sam_opportunities table. No conversion needed.'
    }, { status: 501 })

  } catch (error) {
    console.error('Error in convert route:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Operation not supported',
      message: 'Opportunity conversion is not available in this version'
    }, { status: 501 })
  }
}