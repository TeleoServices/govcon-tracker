import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Use hardcoded Supabase credentials
    const supabaseUrl = 'https://fuflbtkhtzvkqdobruow.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZmxidGtodHp2a3Fkb2JydW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzYwNjYsImV4cCI6MjA3MDYxMjA2Nn0.-nYOJ-wGj95Z2AWuGwxhu49ZTigXcmFrp6PZ11qyrew'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const url = new URL(request.url)
    const searchParams = url.searchParams
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '25'), 100) // Max 100 per page
    const naicsCode = searchParams.get('naicsCode') || undefined
    const activeOnly = searchParams.get('activeOnly') !== 'false'
    const searchTerm = searchParams.get('search') || undefined
    const setAsideType = searchParams.get('setAsideType') || undefined
    const postedDateFrom = searchParams.get('postedDateFrom') || undefined
    const postedDateTo = searchParams.get('postedDateTo') || undefined
    const responseDueFrom = searchParams.get('responseDueFrom') || undefined
    const responseDueTo = searchParams.get('responseDueTo') || undefined
    
    // Build query
    let query = supabase
      .from('sam_opportunities')
      .select('*')
    
    // Apply filters
    if (activeOnly) {
      query = query.eq('active', true)
    }
    
    if (naicsCode) {
      query = query.eq('naics_code', naicsCode)
    }
    
    if (setAsideType) {
      query = query.eq('set_aside_type', setAsideType)
    }
    
    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,department_name.ilike.%${searchTerm}%,office_name.ilike.%${searchTerm}%`)
    }
    
    if (postedDateFrom) {
      query = query.gte('posted_date', postedDateFrom)
    }
    
    if (postedDateTo) {
      query = query.lte('posted_date', postedDateTo)
    }
    
    if (responseDueFrom) {
      query = query.gte('response_deadline', responseDueFrom)
    }
    
    if (responseDueTo) {
      query = query.lte('response_deadline', responseDueTo)
    }
    
    // Get count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from('sam_opportunities')
      .select('*', { count: 'exact', head: true })
    
    if (countError) throw countError
    
    // Apply pagination and ordering
    const offset = (page - 1) * pageSize
    query = query
      .order('posted_date', { ascending: false })
      .range(offset, offset + pageSize - 1)
    
    const { data: opportunities, error } = await query
    
    if (error) throw error
    
    // Calculate pagination info
    const totalPages = Math.ceil((totalCount || 0) / pageSize)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1
    
    return NextResponse.json({
      success: true,
      data: opportunities || [],
      pagination: {
        page,
        pageSize,
        totalCount: totalCount || 0,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    })
    
  } catch (error) {
    console.error('Error fetching SAM opportunities:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch opportunities',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}