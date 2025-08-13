// Database operations for SAM.gov opportunities in Supabase

import { supabase, type SamOpportunity, type OpportunityAward, type OpportunityContact, type OpportunityPerformanceLocation, type OpportunityOfficeAddress, type ApiSyncLog } from './supabase'
import type { SamOpportunityData } from './sam-api'

export class SamDatabaseOperations {
  
  /**
   * Upsert opportunity data (insert or update if exists)
   */
  async upsertOpportunity(opportunityData: SamOpportunityData): Promise<SamOpportunity> {
    try {
      const opportunityRecord: Partial<SamOpportunity> = {
        notice_id: opportunityData.noticeId,
        title: opportunityData.title,
        solicitation_number: opportunityData.solicitationNumber,
        full_parent_path_name: opportunityData.fullParentPathName,
        full_parent_path_code: opportunityData.fullParentPathCode,
        posted_date: opportunityData.postedDate ? new Date(opportunityData.postedDate).toISOString() : undefined,
        opportunity_type: opportunityData.type,
        base_type: opportunityData.baseType,
        archive_type: opportunityData.archiveType,
        archive_date: opportunityData.archiveDate ? new Date(opportunityData.archiveDate).toISOString() : undefined,
        active: opportunityData.active === 'Yes',
        naics_code: opportunityData.naicsCode,
        classification_code: opportunityData.classificationCode,
        response_deadline: opportunityData.responseDeadLine ? new Date(opportunityData.responseDeadLine).toISOString() : undefined,
        set_aside_type: opportunityData.typeOfSetAside,
        set_aside_description: opportunityData.typeOfSetAsideDescription,
        description_link: opportunityData.description,
        ui_link: opportunityData.uiLink,
        additional_info_link: opportunityData.additionalInfoLink,
        organization_type: opportunityData.organizationType,
        // Add the missing fields
        department_name: opportunityData.fullParentPathName?.split('.')?.slice(0, 1).join('.') || undefined,
        office_name: undefined,
        location: opportunityData.officeAddress ? `${opportunityData.officeAddress.city}, ${opportunityData.officeAddress.state}` : undefined,
        zip_code: opportunityData.officeAddress?.zipcode || undefined,
        last_synced: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('sam_opportunities')
        .upsert([opportunityRecord], {
          onConflict: 'notice_id'
        })
        .select()
        .single()

      if (error) {
        console.error('Error upserting opportunity:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in upsertOpportunity:', error)
      throw error
    }
  }

  /**
   * Insert award information for an opportunity
   */
  async insertAwardData(opportunityId: string, awardData: NonNullable<SamOpportunityData['award']>): Promise<OpportunityAward | null> {
    if (!awardData) return null

    try {
      const awardRecord: Partial<OpportunityAward> = {
        opportunity_id: opportunityId,
        award_number: awardData.number,
        award_amount: awardData.amount,
        award_date: awardData.date ? new Date(awardData.date).toISOString() : undefined,
        awardee_name: awardData.awardee?.name,
        awardee_uei_sam: awardData.awardee?.ueiSAM,
        awardee_street_address: awardData.awardee?.location?.streetAddress,
        awardee_street_address2: awardData.awardee?.location?.streetAddress2,
        awardee_city_code: awardData.awardee?.location?.city?.code,
        awardee_city_name: awardData.awardee?.location?.city?.name,
        awardee_state_code: awardData.awardee?.location?.state?.code,
        awardee_state_name: awardData.awardee?.location?.state?.name,
        awardee_country_code: awardData.awardee?.location?.country?.code,
        awardee_country_name: awardData.awardee?.location?.country?.name,
        awardee_zip: awardData.awardee?.location?.zip
      }

      const { data, error } = await supabase
        .from('sam_opportunity_awards')
        .insert([awardRecord])
        .select()
        .single()

      if (error) {
        console.error('Error inserting award data:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in insertAwardData:', error)
      throw error
    }
  }

  /**
   * Insert contact information for an opportunity
   */
  async insertContactData(opportunityId: string, contactsArray: NonNullable<SamOpportunityData['pointOfContact']>): Promise<OpportunityContact[]> {
    if (!contactsArray || contactsArray.length === 0) return []

    try {
      const contactInserts: Partial<OpportunityContact>[] = contactsArray.map(contact => ({
        opportunity_id: opportunityId,
        contact_type: contact.type,
        title: contact.title,
        full_name: contact.fullName,
        email: contact.email,
        phone: contact.phone,
        fax: contact.fax,
        additional_info: contact.additionalInfo?.content
      }))

      const { data, error } = await supabase
        .from('sam_opportunity_contacts')
        .insert(contactInserts)
        .select()

      if (error) {
        console.error('Error inserting contact data:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error in insertContactData:', error)
      throw error
    }
  }

  /**
   * Insert performance location for an opportunity
   */
  async insertPerformanceLocation(opportunityId: string, locationData: NonNullable<SamOpportunityData['placeOfPerformance']>): Promise<OpportunityPerformanceLocation | null> {
    if (!locationData) return null

    try {
      const locationRecord: Partial<OpportunityPerformanceLocation> = {
        opportunity_id: opportunityId,
        street_address: locationData.streetAddress,
        street_address2: locationData.streetAddress2,
        city_code: locationData.city?.code,
        city_name: locationData.city?.name,
        state_code: locationData.state?.code,
        state_name: locationData.state?.name,
        country_code: locationData.country?.code,
        country_name: locationData.country?.name,
        zip: locationData.zip
      }

      const { data, error } = await supabase
        .from('sam_opportunity_performance_locations')
        .insert([locationRecord])
        .select()
        .single()

      if (error) {
        console.error('Error inserting performance location:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in insertPerformanceLocation:', error)
      throw error
    }
  }

  /**
   * Insert office address for an opportunity
   */
  async insertOfficeAddress(opportunityId: string, officeData: NonNullable<SamOpportunityData['officeAddress']>): Promise<OpportunityOfficeAddress | null> {
    if (!officeData) return null

    try {
      const officeRecord: Partial<OpportunityOfficeAddress> = {
        opportunity_id: opportunityId,
        city: officeData.city,
        state: officeData.state,
        zip: officeData.zipcode || officeData.zip,
        country_code: officeData.countryCode
      }

      const { data, error } = await supabase
        .from('sam_opportunity_office_addresses')
        .insert([officeRecord])
        .select()
        .single()

      if (error) {
        console.error('Error inserting office address:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in insertOfficeAddress:', error)
      throw error
    }
  }

  /**
   * Comprehensive sync of opportunity and all related data
   */
  async syncOpportunityToDatabase(opportunityData: SamOpportunityData): Promise<SamOpportunity> {
    try {
      // Upsert main opportunity record
      const opportunity = await this.upsertOpportunity(opportunityData)
      
      // Clear existing related data for updates
      await this.clearRelatedData(opportunity.id!)
      
      // Insert related data
      const promises = []
      
      if (opportunityData.award) {
        promises.push(this.insertAwardData(opportunity.id!, opportunityData.award))
      }
      
      if (opportunityData.pointOfContact) {
        promises.push(this.insertContactData(opportunity.id!, opportunityData.pointOfContact))
      }
      
      if (opportunityData.placeOfPerformance) {
        promises.push(this.insertPerformanceLocation(opportunity.id!, opportunityData.placeOfPerformance))
      }
      
      if (opportunityData.officeAddress) {
        promises.push(this.insertOfficeAddress(opportunity.id!, opportunityData.officeAddress))
      }
      
      // Execute all related data insertions in parallel
      await Promise.allSettled(promises)
      
      return opportunity
    } catch (error) {
      console.error('Error syncing opportunity to database:', error)
      throw error
    }
  }

  /**
   * Clear existing related data for an opportunity (for updates)
   */
  private async clearRelatedData(opportunityId: string): Promise<void> {
    const clearPromises = [
      supabase.from('sam_opportunity_awards').delete().eq('opportunity_id', opportunityId),
      supabase.from('sam_opportunity_contacts').delete().eq('opportunity_id', opportunityId),
      supabase.from('sam_opportunity_performance_locations').delete().eq('opportunity_id', opportunityId),
      supabase.from('sam_opportunity_office_addresses').delete().eq('opportunity_id', opportunityId)
    ]
    
    await Promise.allSettled(clearPromises)
  }

  /**
   * Batch process multiple opportunities with progress tracking
   */
  async processBatchOpportunities(
    opportunitiesData: SamOpportunityData[], 
    syncLogId?: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<{
    total: number
    processed: number
    failed: number
    errors: Array<{ noticeId: string; error: string }>
  }> {
    const results = {
      total: opportunitiesData.length,
      processed: 0,
      failed: 0,
      errors: [] as Array<{ noticeId: string; error: string }>
    }
    
    // Process in smaller batches to avoid overwhelming the database
    const batchSize = 10
    for (let i = 0; i < opportunitiesData.length; i += batchSize) {
      const batch = opportunitiesData.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (opportunity) => {
        try {
          await this.syncOpportunityToDatabase(opportunity)
          results.processed++
        } catch (error) {
          results.failed++
          results.errors.push({
            noticeId: opportunity.noticeId,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
          console.error(`Error processing opportunity ${opportunity.noticeId}:`, error)
        }
      })
      
      await Promise.allSettled(batchPromises)
      
      // Update progress in sync log and callback
      if (syncLogId) {
        try {
          await this.updateSyncLog(syncLogId, 'running', {
            total_records: results.total,
            new_records: results.processed,
            errors: results.errors.length > 0 ? JSON.stringify(results.errors.slice(-5)) : undefined // Keep last 5 errors
          })
        } catch (error) {
          console.error('Error updating sync progress:', error)
        }
      }
      
      if (onProgress) {
        onProgress(results.processed, results.total)
      }
      
      // Small delay between batches
      if (i + batchSize < opportunitiesData.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    return results
  }

  /**
   * Create sync log entry
   */
  async createSyncLog(syncType: ApiSyncLog['sync_type'], apiParams: any): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('sam_api_sync_logs')
        .insert([{
          sync_type: syncType,
          api_params: apiParams,
          status: 'running'
        }])
        .select('id')
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.error('Error creating sync log:', error)
      throw error
    }
  }

  /**
   * Update sync log with results
   */
  async updateSyncLog(
    syncLogId: string, 
    status: ApiSyncLog['status'], 
    results?: {
      total_records?: number
      new_records?: number
      updated_records?: number
      errors?: string
    }
  ): Promise<void> {
    try {
      const updateData: Partial<ApiSyncLog> = {
        status,
        end_time: new Date().toISOString(),
        ...results
      }

      const { error } = await supabase
        .from('sam_api_sync_logs')
        .update(updateData)
        .eq('id', syncLogId)

      if (error) throw error
    } catch (error) {
      console.error('Error updating sync log:', error)
      throw error
    }
  }

  /**
   * Get sync logs
   */
  async getSyncLogs(limit: number = 10): Promise<ApiSyncLog[]> {
    try {
      const { data, error } = await supabase
        .from('sam_api_sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching sync logs:', error)
      throw error
    }
  }

  /**
   * Get opportunities with pagination and filters
   */
  async getOpportunities(filters: {
    naicsCode?: string
    activeOnly?: boolean
    postedAfter?: string
    postedDateTo?: string
    responseDueFrom?: string
    responseDueTo?: string
    searchTerm?: string
    state?: string
    setAsideType?: string
  } = {}, page: number = 1, pageSize: number = 50): Promise<{
    data: SamOpportunity[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
  }> {
    try {
      let query = supabase
        .from('sam_opportunities')
        .select('*', { count: 'exact' })

      // Apply filters
      if (filters.naicsCode) {
        query = query.eq('naics_code', filters.naicsCode)
      }
      if (filters.activeOnly !== false) {
        query = query.eq('active', true)
      }
      if (filters.postedAfter) {
        query = query.gte('posted_date', filters.postedAfter)
      }
      if (filters.postedDateTo) {
        query = query.lte('posted_date', filters.postedDateTo)
      }
      if (filters.responseDueFrom) {
        query = query.gte('response_deadline', filters.responseDueFrom)
      }
      if (filters.responseDueTo) {
        query = query.lte('response_deadline', filters.responseDueTo)
      }
      if (filters.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,full_parent_path_name.ilike.%${filters.searchTerm}%,solicitation_number.ilike.%${filters.searchTerm}%`)
      }
      if (filters.state) {
        // Note: This would require joining with performance locations table
        // For now, we'll implement a simpler search
        query = query.ilike('full_parent_path_name', `%${filters.state}%`)
      }
      if (filters.setAsideType) {
        query = query.eq('set_aside_type', filters.setAsideType)
      }

      // Add pagination
      const offset = (page - 1) * pageSize
      query = query.range(offset, offset + pageSize - 1)

      // Order by posted date (newest first)
      query = query.order('posted_date', { ascending: false })

      const { data, error, count } = await query

      if (error) throw error

      return {
        data: data || [],
        totalCount: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error)
      throw error
    }
  }

  /**
   * Get opportunity by notice ID with full details
   */
  async getOpportunityByNoticeId(noticeId: string): Promise<SamOpportunity & {
    awards?: OpportunityAward[]
    contacts?: OpportunityContact[]
    performance_locations?: OpportunityPerformanceLocation[]
    office_addresses?: OpportunityOfficeAddress[]
  } | null> {
    try {
      const { data, error } = await supabase
        .from('sam_opportunities')
        .select(`
          *,
          awards:sam_opportunity_awards(*),
          contacts:sam_opportunity_contacts(*),
          performance_locations:sam_opportunity_performance_locations(*),
          office_addresses:sam_opportunity_office_addresses(*)
        `)
        .eq('notice_id', noticeId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error
      }

      return data
    } catch (error) {
      console.error('Error fetching opportunity by notice ID:', error)
      throw error
    }
  }

  /**
   * Search opportunities with full-text search
   */
  async searchOpportunities(searchTerm: string, filters: {
    naicsCode?: string
    activeOnly?: boolean
    limit?: number
  } = {}): Promise<SamOpportunity[]> {
    try {
      let query = supabase
        .from('sam_opportunities')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,full_parent_path_name.ilike.%${searchTerm}%,solicitation_number.ilike.%${searchTerm}%`)

      if (filters.naicsCode) {
        query = query.eq('naics_code', filters.naicsCode)
      }
      if (filters.activeOnly !== false) {
        query = query.eq('active', true)
      }

      query = query
        .order('posted_date', { ascending: false })
        .limit(filters.limit || 100)

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error searching opportunities:', error)
      throw error
    }
  }

  /**
   * Get statistics about stored opportunities
   */
  async getOpportunityStats(): Promise<{
    total: number
    active: number
    withAwards: number
    recentSync: Date | null
    naicsCodes: Array<{ naics_code: string; count: number }>
  }> {
    try {
      // Get total and active counts
      const [totalResult, activeResult, recentSyncResult] = await Promise.all([
        supabase.from('sam_opportunities').select('id', { count: 'exact', head: true }),
        supabase.from('sam_opportunities').select('id', { count: 'exact', head: true }).eq('active', true),
        supabase.from('sam_api_sync_logs').select('created_at').eq('status', 'completed').order('created_at', { ascending: false }).limit(1).single()
      ])

      // Get opportunities with awards count
      const { data: awardedOpportunityIds } = await supabase
        .from('sam_opportunity_awards')
        .select('opportunity_id')
      
      const { count: withAwards } = await supabase
        .from('sam_opportunities')
        .select('id', { count: 'exact', head: true })
        .in('id', awardedOpportunityIds?.map(a => a.opportunity_id) || [])

      // Get NAICS codes distribution
      const { data: naicsData } = await supabase
        .from('sam_opportunities')
        .select('naics_code')
        .not('naics_code', 'is', null)
        .order('naics_code')

      // Count NAICS codes
      const naicsCounts = new Map<string, number>()
      naicsData?.forEach(item => {
        if (item.naics_code) {
          naicsCounts.set(item.naics_code, (naicsCounts.get(item.naics_code) || 0) + 1)
        }
      })

      const naicsCodes = Array.from(naicsCounts.entries())
        .map(([naics_code, count]) => ({ naics_code, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Top 10

      return {
        total: totalResult.count || 0,
        active: activeResult.count || 0,
        withAwards: withAwards || 0,
        recentSync: recentSyncResult.data?.created_at ? new Date(recentSyncResult.data.created_at) : null,
        naicsCodes
      }
    } catch (error) {
      console.error('Error fetching opportunity stats:', error)
      throw error
    }
  }
}

// Export singleton instance
export const samDatabaseOps = new SamDatabaseOperations()