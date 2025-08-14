import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Use hardcoded Supabase credentials
    const supabaseUrl = 'https://fuflbtkhtzvkqdobruow.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZmxidGtodHp2a3Fkb2JydW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzYwNjYsImV4cCI6MjA3MDYxMjA2Nn0.-nYOJ-wGj95Z2AWuGwxhu49ZTigXcmFrp6PZ11qyrew'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from('sam_opportunities')
      .select('*', { count: 'exact', head: true })
    
    if (totalError) throw totalError
    
    // Get active count
    const { count: activeCount, error: activeError } = await supabase
      .from('sam_opportunities')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
    
    if (activeError) throw activeError
    
    // Get latest sync time (use updated_at from most recent record)
    const { data: latestRecord, error: latestError } = await supabase
      .from('sam_opportunities')
      .select('last_synced, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
    
    if (latestError) throw latestError
    
    const lastSyncAt = latestRecord?.[0]?.last_synced || latestRecord?.[0]?.updated_at
    
    return NextResponse.json({
      success: true,
      data: {
        lastSyncAt,
        totalOpportunities: totalCount || 0,
        activeOpportunities: activeCount || 0,
        isRunning: false,
        lastError: null
      }
    })
  } catch (error) {
    console.error('Error fetching SAM sync stats:', error)
    
    return NextResponse.json({
      success: false, 
      error: 'Failed to fetch stats',
      data: {
        lastSyncAt: null,
        totalOpportunities: 0,
        activeOpportunities: 0,
        isRunning: false,
        lastError: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 })
  }
}