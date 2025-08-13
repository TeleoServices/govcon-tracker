import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for SAM.gov opportunities
export interface SamOpportunity {
  id?: string
  notice_id: string
  title: string
  solicitation_number?: string
  full_parent_path_name?: string
  full_parent_path_code?: string
  posted_date?: Date | string
  opportunity_type?: string
  base_type?: string
  archive_type?: string
  archive_date?: Date | string
  active: boolean
  naics_code?: string
  classification_code?: string
  response_deadline?: Date | string
  set_aside_type?: string
  set_aside_description?: string
  description_link?: string
  ui_link?: string
  additional_info_link?: string
  organization_type?: string
  department_name?: string
  office_name?: string
  location?: string
  zip_code?: string
  created_at?: Date | string
  updated_at?: Date | string
  last_synced?: Date | string
}

export interface OpportunityAward {
  id?: string
  opportunity_id: string
  award_number?: string
  award_amount?: number
  award_date?: Date | string
  awardee_name?: string
  awardee_uei_sam?: string
  awardee_street_address?: string
  awardee_street_address2?: string
  awardee_city_code?: string
  awardee_city_name?: string
  awardee_state_code?: string
  awardee_state_name?: string
  awardee_country_code?: string
  awardee_country_name?: string
  awardee_zip?: string
  created_at?: Date | string
}

export interface OpportunityContact {
  id?: string
  opportunity_id: string
  contact_type?: string
  title?: string
  full_name?: string
  email?: string
  phone?: string
  fax?: string
  additional_info?: string
  created_at?: Date | string
}

export interface OpportunityPerformanceLocation {
  id?: string
  opportunity_id: string
  street_address?: string
  street_address2?: string
  city_code?: string
  city_name?: string
  state_code?: string
  state_name?: string
  country_code?: string
  country_name?: string
  zip?: string
  created_at?: Date | string
}

export interface OpportunityOfficeAddress {
  id?: string
  opportunity_id: string
  city?: string
  state?: string
  zip?: string
  country_code?: string
  created_at?: Date | string
}

export interface ApiSyncLog {
  id?: string
  sync_type: 'full_sync' | 'incremental' | 'manual'
  start_time?: Date | string
  end_time?: Date | string
  status: 'running' | 'completed' | 'failed'
  total_records?: number
  new_records?: number
  updated_records?: number
  errors?: string
  api_params?: any
  created_at?: Date | string
}