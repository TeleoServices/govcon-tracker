import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Hardcode the values since they're public and not loading from env properly
    const supabaseUrl = 'https://fuflbtkhtzvkqdobruow.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZmxidGtodHp2a3Fkb2JydW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzYwNjYsImV4cCI6MjA3MDYxMjA2Nn0.-nYOJ-wGj95Z2AWuGwxhu49ZTigXcmFrp6PZ11qyrew'
    
    const supabase = createClient(supabaseUrl, supabaseKey)

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

export async function POST() {
  // For now, return an error since we're using sam_opportunities as read-only
  return NextResponse.json(
    { error: 'Creating opportunities is not supported. Data is synced from SAM.gov' },
    { status: 400 }
  )
}