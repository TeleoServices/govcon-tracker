import { prisma } from '@/lib/prisma'

interface SamGovSearchParams {
  keyword?: string
  naicsCode?: string
  state?: string
  setAside?: string
  postedFrom?: string
  postedTo?: string
  responseFrom?: string
  responseTo?: string
  status?: string
  limit?: number
  offset?: number
}

interface SamGovOpportunity {
  noticeId: string
  solicitationNumber: string
  title: string
  description?: string
  type: string
  baseType?: string
  organizationName?: string
  departmentName?: string
  officeName?: string
  naicsCode?: string
  postedDate?: string
  responseDeadline?: string
  archiveDate?: string
  setAside?: string
  placeOfPerformance?: {
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  pointOfContact?: {
    fullName?: string
    email?: string
    phone?: string
  }[]
  links?: {
    rel: string
    href: string
  }[]
  uiLink?: string  // Link to view on SAM.gov
  additionalInfoLink?: string  // Additional information link
}

export class SamGovApiService {
  private apiKey: string
  private baseUrl: string
  private rateLimit: number

  constructor() {
    this.apiKey = process.env.SAM_GOV_API_KEY || ''
    this.baseUrl = process.env.SAM_GOV_API_URL || 'https://api.sam.gov/opportunities/v2/search'
    this.rateLimit = parseInt(process.env.SAM_GOV_RATE_LIMIT || '10')
  }

  async searchOpportunities(params: SamGovSearchParams): Promise<{
    opportunities: SamGovOpportunity[]
    totalRecords: number
  }> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams()

      if (params.keyword) queryParams.append('qterms', params.keyword)
      if (params.naicsCode) queryParams.append('ncode', params.naicsCode)
      if (params.state) queryParams.append('pstate', params.state)
      if (params.setAside) queryParams.append('typeOfSetAside', params.setAside)
      if (params.responseFrom) queryParams.append('rdlfrom', params.responseFrom)
      if (params.responseTo) queryParams.append('rdlto', params.responseTo)

      // SAM.gov API requires postedFrom and postedTo in MM/DD/YYYY format - default to last 30 days
      const formatDate = (date: Date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const year = date.getFullYear()
        return `${month}/${day}/${year}`
      }

      const postedFrom = params.postedFrom || formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      const postedTo = params.postedTo || formatDate(new Date())

      queryParams.append('postedFrom', postedFrom)
      queryParams.append('postedTo', postedTo)

      queryParams.append('limit', (params.limit || 25).toString())
      queryParams.append('offset', (params.offset || 0).toString())
      queryParams.append('api_key', this.apiKey)

      const url = `${this.baseUrl}?${queryParams.toString()}`

      // Log the request for debugging
      console.log('SAM.gov API Request URL:', url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('SAM.gov API Error Response:', errorText)
        throw new Error(`SAM.gov API error: ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()

      return {
        opportunities: data.opportunitiesData || [],
        totalRecords: data.totalRecords || 0,
      }
    } catch (error) {
      console.error('SAM.gov API error:', error)
      throw error
    }
  }

  async getOpportunityById(noticeId: string): Promise<SamGovOpportunity | null> {
    try {
      // SAM.gov API requires postedFrom and postedTo in MM/DD/YYYY format - search last 365 days for specific notice
      const formatDate = (date: Date) => {
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const year = date.getFullYear()
        return `${month}/${day}/${year}`
      }

      const postedFrom = formatDate(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
      const postedTo = formatDate(new Date())

      const url = `https://api.sam.gov/opportunities/v2/search?noticeid=${noticeId}&postedFrom=${postedFrom}&postedTo=${postedTo}&api_key=${this.apiKey}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.opportunitiesData?.[0] || null
    } catch (error) {
      console.error('Error fetching opportunity:', error)
      return null
    }
  }

  async syncOpportunities(
    organizationId: string,
    params: SamGovSearchParams,
    onProgress?: (batch: number, totalBatches: number) => void
  ): Promise<{
    imported: number
    updated: number
    errors: number
    totalFetched: number
  }> {
    try {
      // First call to get total records count
      const initialLimit = params.limit || 100
      const firstBatch = await this.searchOpportunities({
        ...params,
        limit: initialLimit,
        offset: 0,
      })

      const { totalRecords } = firstBatch
      console.log(`Total records available: ${totalRecords}`)

      // Calculate number of batches needed
      const totalBatches = Math.ceil(totalRecords / initialLimit)
      console.log(`Will fetch ${totalBatches} batch(es) of ${initialLimit} records each`)

      let imported = 0
      let updated = 0
      let errors = 0
      let totalFetched = 0
      const allOpportunities: SamGovOpportunity[] = []

      // Loop through all batches
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const offset = batchIndex * initialLimit
        console.log(`Fetching batch ${batchIndex + 1} of ${totalBatches} (offset: ${offset})`)

        // Notify progress
        if (onProgress) {
          onProgress(batchIndex + 1, totalBatches)
        }

        // Add delay between requests (except for first batch which we already fetched)
        if (batchIndex > 0) {
          await new Promise(resolve => setTimeout(resolve, 200))

          const batch = await this.searchOpportunities({
            ...params,
            limit: initialLimit,
            offset,
          })
          allOpportunities.push(...batch.opportunities)
          totalFetched += batch.opportunities.length
        } else {
          // Use first batch we already fetched
          allOpportunities.push(...firstBatch.opportunities)
          totalFetched += firstBatch.opportunities.length
        }
      }

      console.log(`Fetched ${totalFetched} opportunities total`)

      // Import SAM.gov opportunities into SamGovOpportunity table (review queue)
      for (const samOpp of allOpportunities) {
        try {
          // Skip if no noticeId (required for deduplication)
          if (!samOpp.noticeId) {
            console.warn('Skipping opportunity without noticeId:', samOpp.title)
            errors++
            continue
          }

          const samGovData = {
            noticeId: samOpp.noticeId,
            solicitationNumber: samOpp.solicitationNumber || samOpp.noticeId,
            title: samOpp.title,
            description: samOpp.description,
            agencyName: samOpp.organizationName || 'Unknown',
            departmentName: samOpp.departmentName,
            officeName: samOpp.officeName,
            noticeType: samOpp.type,
            baseType: samOpp.baseType,
            naicsCode: samOpp.naicsCode,
            setAsideType: samOpp.setAside,
            postedDate: samOpp.postedDate ? new Date(samOpp.postedDate) : undefined,
            responseDeadline: samOpp.responseDeadline ? new Date(samOpp.responseDeadline) : undefined,
            archiveDate: samOpp.archiveDate ? new Date(samOpp.archiveDate) : undefined,
            descriptionLink: samOpp.uiLink || samOpp.links?.find(l => l.rel === 'self')?.href,
            additionalInfoLink: samOpp.additionalInfoLink,
          }

          // Use upsert to handle duplicates automatically
          // This creates if new, updates if exists based on unique noticeId
          const result = await prisma.samGovOpportunity.upsert({
            where: { noticeId: samOpp.noticeId },
            update: samGovData,
            create: samGovData,
          })

          // Check if it was an update or create by querying creation time
          const isNew = result.createdAt.getTime() === result.updatedAt.getTime()

          if (isNew) {
            imported++
            console.log(`✓ Imported new SAM.gov opportunity: ${samOpp.noticeId}`)
          } else {
            updated++
            console.log(`↻ Updated existing SAM.gov opportunity: ${samOpp.noticeId}`)
          }
        } catch (error: any) {
          // Handle unique constraint violations gracefully
          if (error.code === 'P2002') {
            console.warn(`⊘ Duplicate detected and skipped: ${samOpp.noticeId} (${samOpp.title})`)
            errors++
          } else {
            console.error('Error importing SAM.gov opportunity:', error)
            errors++
          }
        }
      }

      // Log sync
      await prisma.samApiSyncLog.create({
        data: {
          syncType: 'search',
          status: 'completed',
          startTime: new Date(),
          endTime: new Date(),
          totalRecords,
          newRecords: imported,
          updatedRecords: updated,
          apiParams: JSON.stringify(params),
        },
      })

      return { imported, updated, errors, totalFetched }
    } catch (error) {
      console.error('Sync error:', error)
      throw error
    }
  }
}

export const samGovApi = new SamGovApiService()
