import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fuflbtkhtzvkqdobruow.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    // Fetch from sam_opportunities table
    const { data: opportunities, error } = await supabase
      .from('sam_opportunities')
      .select('*')
      .order('response_date', { ascending: true })
      .limit(100) // Limit to recent 100 for performance
    
    if (error) {
      console.error('Supabase error:', error)
      throw error
    }

    // Transform sam_opportunities data to match expected format
    const transformedOpportunities = opportunities?.map(opp => ({
      id: opp.id,
      solNo: opp.notice_id || opp.id,
      title: opp.title,
      description: opp.description,
      agency: opp.agency_name || 'N/A',
      naics: opp.naics_code,
      stage: 'IDENTIFIED', // Default stage since sam_opportunities doesn't have this
      dueDate: opp.response_date,
      priority: 'MEDIUM', // Default priority
      postedDate: opp.posted_date,
      estimatedValue: null, // sam_opportunities doesn't have this
      type: opp.type || 'Solicitation',
      setAside: opp.set_aside_type,
      placeOfPerformance: opp.place_of_performance,
      status: opp.active === 'Yes' ? 'OPEN' : 'CLOSED',
      samUrl: opp.url,
      attachments: null,
      vendorId: null,
      notes: null,
      createdAt: opp.created_at,
      updatedAt: opp.updated_at,
      vendor: null
    })) || []

    return NextResponse.json(transformedOpportunities)
  } catch (error) {
    console.error('Error fetching opportunities:', error)
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // For now, return an error since we're using sam_opportunities as read-only
  return NextResponse.json(
    { error: 'Creating opportunities is not supported. Data is synced from SAM.gov' },
    { status: 400 }
  )
}