import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Hardcode the values since they're public and not loading from env properly
    const supabaseUrl = 'https://fuflbtkhtzvkqdobruow.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZmxidGtodHp2a3Fkb2JydW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzYwNjYsImV4cCI6MjA3MDYxMjA2Nn0.-nYOJ-wGj95Z2AWuGwxhu49ZTigXcmFrp6PZ11qyrew'
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Fetch from sam_opportunities table with correct column names
    const { data: opportunities, error } = await supabase
      .from('sam_opportunities')
      .select('id, title, department_name, office_name, response_deadline, posted_date, active, opportunity_type, notice_id, naics_code, set_aside_type, location, ui_link')
      .order('response_deadline', { ascending: true })
      .limit(50) // Get 50 opportunities
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        error: 'Supabase query failed',
        details: error.message,
        hint: error.hint
      }, { status: 500 })
    }

    // Transform with correct column mapping
    const transformedOpportunities = opportunities?.map(opp => ({
      id: opp.id,
      solNo: opp.notice_id || opp.id,
      title: opp.title || 'Untitled',
      description: '', // Not available in this table
      agency: `${opp.department_name || ''} ${opp.office_name || ''}`.trim() || 'N/A',
      naics: opp.naics_code || '',
      stage: 'IDENTIFIED',
      dueDate: opp.response_deadline,
      priority: 'MEDIUM',
      postedDate: opp.posted_date,
      estimatedValue: null,
      type: opp.opportunity_type || 'Solicitation',
      setAside: opp.set_aside_type || '',
      placeOfPerformance: opp.location || '',
      status: opp.active ? 'OPEN' : 'CLOSED',
      samUrl: opp.ui_link || '',
      attachments: null,
      vendorId: null,
      notes: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      vendor: null
    })) || []

    console.log(`Successfully fetched ${transformedOpportunities.length} opportunities`)
    return NextResponse.json(transformedOpportunities)
  } catch (error: any) {
    console.error('Error fetching opportunities:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch opportunities',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

export async function POST() {
  // For now, return an error since we're using sam_opportunities as read-only
  return NextResponse.json(
    { error: 'Creating opportunities is not supported. Data is synced from SAM.gov' },
    { status: 400 }
  )
}