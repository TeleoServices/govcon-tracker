// SAM.gov synchronization service combining API and database operations

import { samApiClient, type SamApiParams } from './sam-api'
import { samDatabaseOps } from './sam-database'
import type { ApiSyncLog } from './supabase'

export interface SyncOptions {
  dateFrom: Date
  dateTo: Date
  naicsCode?: string
  procurementTypes?: string[]
  state?: string
  setAsideType?: string
  activeOnly?: boolean // default true - only import active opportunities
  responseDueDateFrom?: Date
  responseDueDateTo?: Date
  onProgress?: (current: number, total: number) => void
  onBatchComplete?: (batchResults: any) => void
}

export interface SyncResult {
  success: boolean
  syncLogId: string
  totalRecords: number
  processedRecords: number
  failedRecords: number
  errors: Array<{ noticeId: string; error: string }>
  duration: number
}

class SamSyncService {
  
  /**
   * Full synchronization of opportunities for a date range
   */
  async syncOpportunities(options: SyncOptions): Promise<SyncResult> {
    const startTime = Date.now()
    let syncLogId: string = ''
    
    try {
      // Prepare API parameters - ensure proper MM/dd/yyyy format
      const formatDate = (date: Date): string => {
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        const year = date.getFullYear()
        return `${month}/${day}/${year}`
      }

      const apiParams: SamApiParams = {
        postedFrom: formatDate(options.dateFrom),
        postedTo: formatDate(options.dateTo),
        ptype: options.procurementTypes?.join(',') || 'k,o',
        ncode: options.naicsCode,
        state: options.state,
        typeOfSetAside: options.setAsideType,
        active: options.activeOnly !== false ? 'Yes' : undefined, // default to active only
        rdlfrom: options.responseDueDateFrom ? formatDate(options.responseDueDateFrom) : undefined,
        rdlto: options.responseDueDateTo ? formatDate(options.responseDueDateTo) : undefined
      }

      // Create sync log
      syncLogId = await samDatabaseOps.createSyncLog('full_sync', apiParams)
      console.log(`[SAM Sync] Started sync with log ID: ${syncLogId}`)

      // Fetch all opportunities from API
      console.log(`[SAM Sync] Fetching opportunities from ${options.dateFrom.toDateString()} to ${options.dateTo.toDateString()}`)
      
      const opportunities = await samApiClient.fetchAllOpportunities(
        apiParams,
        options.onProgress
      )

      console.log(`[SAM Sync] Retrieved ${opportunities.length} opportunities from API`)

      // Process opportunities in batches with progress tracking
      const batchResults = await samDatabaseOps.processBatchOpportunities(
        opportunities, 
        syncLogId, 
        options.onProgress
      )
      
      if (options.onBatchComplete) {
        options.onBatchComplete(batchResults)
      }

      // Update sync log with results
      const duration = Date.now() - startTime
      await samDatabaseOps.updateSyncLog(syncLogId, 'completed', {
        total_records: batchResults.total,
        new_records: batchResults.processed, // Simplified - could track new vs updated
        updated_records: 0,
        errors: batchResults.errors.length > 0 ? JSON.stringify(batchResults.errors) : undefined
      })

      console.log(`[SAM Sync] Completed sync in ${duration}ms. Processed: ${batchResults.processed}/${batchResults.total}`)

      return {
        success: true,
        syncLogId,
        totalRecords: batchResults.total,
        processedRecords: batchResults.processed,
        failedRecords: batchResults.failed,
        errors: batchResults.errors,
        duration
      }

    } catch (error) {
      const duration = Date.now() - startTime
      console.error('[SAM Sync] Sync failed:', error)

      // Update sync log with error
      if (syncLogId) {
        await samDatabaseOps.updateSyncLog(syncLogId, 'failed', {
          errors: error instanceof Error ? error.message : 'Unknown error'
        })
      }

      return {
        success: false,
        syncLogId,
        totalRecords: 0,
        processedRecords: 0,
        failedRecords: 0,
        errors: [{ noticeId: 'N/A', error: error instanceof Error ? error.message : 'Unknown error' }],
        duration
      }
    }
  }

  /**
   * Incremental sync for recent opportunities
   */
  async incrementalSync(days: number = 7): Promise<SyncResult> {
    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)

    console.log(`[SAM Sync] Starting incremental sync for last ${days} days`)

    return this.syncOpportunities({
      dateFrom: fromDate,
      dateTo: toDate
    })
  }

  /**
   * Sync opportunities for today
   */
  async syncToday(): Promise<SyncResult> {
    const today = new Date()
    
    console.log('[SAM Sync] Starting sync for today')

    return this.syncOpportunities({
      dateFrom: today,
      dateTo: today
    })
  }

  /**
   * Sync opportunities by NAICS code for a date range
   */
  async syncByNaicsCode(
    naicsCode: string, 
    fromDate: Date, 
    toDate: Date,
    onProgress?: (current: number, total: number) => void
  ): Promise<SyncResult> {
    console.log(`[SAM Sync] Starting sync for NAICS code ${naicsCode}`)

    return this.syncOpportunities({
      dateFrom: fromDate,
      dateTo: toDate,
      naicsCode,
      onProgress
    })
  }

  /**
   * Sync opportunities by state
   */
  async syncByState(
    state: string,
    fromDate: Date,
    toDate: Date
  ): Promise<SyncResult> {
    console.log(`[SAM Sync] Starting sync for state ${state}`)

    return this.syncOpportunities({
      dateFrom: fromDate,
      dateTo: toDate,
      state
    })
  }

  /**
   * Get sync status and history with stale sync cleanup
   */
  async getSyncStatus(): Promise<{
    latestSync: ApiSyncLog | null
    recentSyncs: ApiSyncLog[]
    isRunning: boolean
  }> {
    try {
      const recentSyncs = await samDatabaseOps.getSyncLogs(10)
      const latestSync = recentSyncs[0] || null
      
      // Check for stale running syncs (running for more than 15 minutes)
      let isRunning = false
      if (latestSync?.status === 'running') {
        const syncStartTime = new Date(latestSync.created_at || latestSync.start_time!)
        const now = new Date()
        const timeDiffMinutes = (now.getTime() - syncStartTime.getTime()) / (1000 * 60)
        
        if (timeDiffMinutes > 15) {
          // Mark stale sync as failed
          console.log(`[SAM Sync] Marking stale sync ${latestSync.id} as failed (${timeDiffMinutes.toFixed(1)} minutes old)`)
          await samDatabaseOps.updateSyncLog(latestSync.id!, 'failed', {
            errors: 'Sync timeout - marked as failed due to excessive runtime'
          })
          isRunning = false
        } else {
          isRunning = true
        }
      }

      return {
        latestSync,
        recentSyncs,
        isRunning
      }
    } catch (error) {
      console.error('[SAM Sync] Error getting sync status:', error)
      throw error
    }
  }

  /**
   * Check if a sync is currently running
   */
  async isSyncRunning(): Promise<boolean> {
    try {
      const status = await this.getSyncStatus()
      return status.isRunning
    } catch (error) {
      console.error('[SAM Sync] Error checking sync status:', error)
      return false
    }
  }

  /**
   * Get opportunities statistics in format expected by frontend
   */
  async getStats(): Promise<{
    lastSyncAt: string | null
    totalOpportunities: number
    activeOpportunities: number
    isRunning: boolean
    lastError: string | null
    progress?: {
      current: number
      total: number
      percentage: number
    }
  }> {
    try {
      const [databaseStats, syncStatus] = await Promise.all([
        samDatabaseOps.getOpportunityStats(),
        this.getSyncStatus()
      ])

      // Calculate progress if sync is running
      let progress = undefined
      if (syncStatus.isRunning && syncStatus.latestSync) {
        const totalRecords = syncStatus.latestSync.total_records || 0
        const processedRecords = syncStatus.latestSync.new_records || 0
        
        if (totalRecords > 0) {
          progress = {
            current: processedRecords,
            total: totalRecords,
            percentage: Math.round((processedRecords / totalRecords) * 100)
          }
        }
      }

      return {
        lastSyncAt: (syncStatus.latestSync?.end_time instanceof Date ? syncStatus.latestSync.end_time.toISOString() : syncStatus.latestSync?.end_time) || (syncStatus.latestSync?.created_at instanceof Date ? syncStatus.latestSync.created_at.toISOString() : syncStatus.latestSync?.created_at) || null,
        totalOpportunities: databaseStats.total,
        activeOpportunities: databaseStats.active,
        isRunning: syncStatus.isRunning,
        lastError: syncStatus.latestSync?.errors || null,
        progress
      }
    } catch (error) {
      console.error('[SAM Sync] Error getting stats:', error)
      throw error
    }
  }

  /**
   * Manual sync with custom parameters
   */
  async manualSync(
    params: {
      dateFrom: string // MM/dd/yyyy
      dateTo: string   // MM/dd/yyyy
      naicsCode?: string
      procurementTypes?: string
      state?: string
      setAsideType?: string
      activeOnly?: boolean
      responseDueDateFrom?: string // MM/dd/yyyy
      responseDueDateTo?: string   // MM/dd/yyyy
    },
    onProgress?: (current: number, total: number) => void
  ): Promise<SyncResult> {
    console.log('[SAM Sync] Starting manual sync with custom parameters:', params)

    const fromDate = new Date(params.dateFrom)
    const toDate = new Date(params.dateTo)

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new Error('Invalid date format. Expected MM/dd/yyyy')
    }

    const responseDueDateFrom = params.responseDueDateFrom ? new Date(params.responseDueDateFrom) : undefined
    const responseDueDateTo = params.responseDueDateTo ? new Date(params.responseDueDateTo) : undefined

    return this.syncOpportunities({
      dateFrom: fromDate,
      dateTo: toDate,
      naicsCode: params.naicsCode,
      procurementTypes: params.procurementTypes?.split(','),
      state: params.state,
      setAsideType: params.setAsideType,
      activeOnly: params.activeOnly,
      responseDueDateFrom,
      responseDueDateTo,
      onProgress
    })
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string; sampleData?: any }> {
    try {
      console.log('[SAM Sync] Testing API connection...')
      
      // Test with a small request for today
      const today = new Date()
      const response = await samApiClient.fetchOpportunities({
        postedFrom: today.toLocaleDateString('en-US'),
        postedTo: today.toLocaleDateString('en-US'),
        limit: '1'
      })

      return {
        success: true,
        message: `API connection successful. Found ${response.totalRecords} opportunities for today.`,
        sampleData: {
          totalRecords: response.totalRecords,
          limit: response.limit,
          offset: response.offset,
          hasData: response.opportunitiesData && response.opportunitiesData.length > 0
        }
      }
    } catch (error) {
      console.error('[SAM Sync] API connection test failed:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during API test'
      }
    }
  }

  /**
   * Cleanup old sync logs (keep last 100)
   */
  async cleanupSyncLogs(): Promise<{ deleted: number }> {
    try {
      console.log('[SAM Sync] Cleaning up old sync logs...')
      
      // This would need to be implemented with a proper cleanup query
      // For now, we'll just return a placeholder
      return { deleted: 0 }
    } catch (error) {
      console.error('[SAM Sync] Error cleaning up sync logs:', error)
      throw error
    }
  }
}

// Export singleton instance
export const samSyncService = new SamSyncService()