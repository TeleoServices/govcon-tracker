// SAM.gov API Client for retrieving government contract opportunities

interface SamApiParams {
  postedFrom: string // MM/dd/yyyy format
  postedTo: string   // MM/dd/yyyy format
  limit?: string     // max 1000
  offset?: string    // pagination offset
  ptype?: string     // procurement types (k=Combined Synopsis/Solicitation, o=Solicitation)
  ncode?: string     // NAICS code
  solnum?: string    // solicitation number
  noticeid?: string  // notice ID
  title?: string     // opportunity title
  state?: string     // place of performance state
  zip?: string       // place of performance zip
  typeOfSetAside?: string // set-aside type code
  organizationCode?: string
  organizationName?: string
  active?: string    // "Yes" for active only, "No" for inactive only, omit for all
  rdlfrom?: string   // response deadline from (MM/dd/yyyy)
  rdlto?: string     // response deadline to (MM/dd/yyyy)
}

interface SamApiResponse {
  totalRecords: number
  limit: number
  offset: number
  opportunitiesData: SamOpportunityData[]
  links: any[]
}

interface SamOpportunityData {
  noticeId: string
  title: string
  solicitationNumber?: string
  fullParentPathName?: string
  fullParentPathCode?: string
  postedDate: string
  type: string
  baseType?: string
  archiveType?: string
  archiveDate?: string
  active: string // "Yes" or "No"
  naicsCode?: string
  classificationCode?: string
  responseDeadLine?: string
  typeOfSetAside?: string
  typeOfSetAsideDescription?: string
  description?: string
  uiLink?: string
  additionalInfoLink?: string
  organizationType?: string
  award?: {
    number?: string
    amount?: number
    date?: string
    awardee?: {
      name?: string
      ueiSAM?: string
      location?: {
        streetAddress?: string
        streetAddress2?: string
        city?: {
          code?: string
          name?: string
        }
        state?: {
          code?: string
          name?: string
        }
        country?: {
          code?: string
          name?: string
        }
        zip?: string
      }
    }
  }
  pointOfContact?: Array<{
    type?: string
    title?: string
    fullName?: string
    email?: string
    phone?: string
    fax?: string
    additionalInfo?: {
      content?: string
    }
  }>
  placeOfPerformance?: {
    streetAddress?: string
    streetAddress2?: string
    city?: {
      code?: string
      name?: string
    }
    state?: {
      code?: string
      name?: string
    }
    country?: {
      code?: string
      name?: string
    }
    zip?: string
  }
  officeAddress?: {
    city?: string
    state?: string
    zipcode?: string
    zip?: string
    countryCode?: string
  }
}

class SamApiClient {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = process.env.SAM_GOV_API_KEY || ''
    this.baseUrl = process.env.SAM_GOV_API_URL || 'https://api.sam.gov/prod/opportunities/v2/search'
    
    if (!this.apiKey) {
      throw new Error('SAM_GOV_API_KEY environment variable is required')
    }
  }

  /**
   * Build the SAM.gov API URL with parameters
   */
  private buildUrl(params: SamApiParams): string {
    const urlParams = new URLSearchParams()
    
    // Add API key (masked in logs)
    urlParams.append('api_key', this.apiKey)
    
    // Add required date parameters (URLSearchParams handles encoding)
    urlParams.append('postedFrom', params.postedFrom)
    urlParams.append('postedTo', params.postedTo)
    
    // Add pagination
    urlParams.append('offset', params.offset || '0')
    urlParams.append('limit', params.limit || '1000')
    
    // Add optional filters
    if (params.ptype) urlParams.append('ptype', params.ptype)
    if (params.ncode) urlParams.append('ncode', params.ncode)
    if (params.solnum) urlParams.append('solnum', params.solnum)
    if (params.noticeid) urlParams.append('noticeid', params.noticeid)
    if (params.title) urlParams.append('title', params.title)
    if (params.state) urlParams.append('state', params.state)
    if (params.zip) urlParams.append('zip', params.zip)
    if (params.typeOfSetAside) urlParams.append('typeOfSetAside', params.typeOfSetAside)
    if (params.organizationCode) urlParams.append('organizationCode', params.organizationCode)
    if (params.organizationName) urlParams.append('organizationName', params.organizationName)
    
    return `${this.baseUrl}?${urlParams.toString()}`
  }

  /**
   * Validate date format and range
   */
  private validateDates(postedFrom: string, postedTo: string): void {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
    
    if (!dateRegex.test(postedFrom) || !dateRegex.test(postedTo)) {
      throw new Error('Invalid Date Entered. Expected date format is MM/dd/yyyy')
    }
    
    const fromDate = new Date(postedFrom)
    const toDate = new Date(postedTo)
    
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      throw new Error('Invalid Date Entered. Expected date format is MM/dd/yyyy')
    }
    
    const oneYearMs = 365 * 24 * 60 * 60 * 1000
    if (toDate.getTime() - fromDate.getTime() > oneYearMs) {
      throw new Error('Date range must be 1 year(s) apart')
    }
    
    if (fromDate > toDate) {
      throw new Error('PostedFrom date must be before PostedTo date')
    }
  }

  /**
   * Validate request parameters
   */
  private validateParams(params: SamApiParams): void {
    // Validate required fields
    if (!params.postedFrom || !params.postedTo) {
      throw new Error('PostedFrom and PostedTo are mandatory')
    }
    
    // Validate dates
    this.validateDates(params.postedFrom, params.postedTo)
    
    // Validate limit
    if (params.limit) {
      const limit = parseInt(params.limit)
      if (isNaN(limit) || limit < 1 || limit > 1000) {
        throw new Error('Limit valid range is 1-1000. Please provide valid input.')
      }
    }
    
    // Validate offset
    if (params.offset) {
      const offset = parseInt(params.offset)
      if (isNaN(offset) || offset < 0) {
        throw new Error('Offset must be a non-negative integer')
      }
    }
  }

  /**
   * Mask API key for logging
   */
  private maskApiKey(url: string): string {
    return url.replace(/api_key=[^&]+/, 'api_key=XXXXXXXX')
  }

  /**
   * Fetch opportunities from SAM.gov API
   */
  async fetchOpportunities(params: SamApiParams): Promise<SamApiResponse> {
    try {
      // Validate parameters
      this.validateParams(params)
      
      // Build URL
      const url = this.buildUrl(params)
      const maskedUrl = this.maskApiKey(url)
      
      console.log(`[SAM API] Fetching opportunities: ${maskedUrl}`)
      
      // Make API request
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TELEO-Services-GovCon-Tracker/1.0'
        }
      })
      
      // Handle non-200 responses
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`[SAM API] Error ${response.status}: ${errorText}`)
        
        switch (response.status) {
          case 400:
            throw new Error('Bad Request: Invalid parameters provided')
          case 401:
            throw new Error('An invalid api_key was supplied')
          case 403:
            throw new Error('Forbidden: Access denied')
          case 404:
            throw new Error('No data found for the specified criteria')
          case 429:
            throw new Error('Rate limit exceeded. Please try again later.')
          case 500:
            throw new Error('Internal Server Error: SAM.gov service unavailable')
          default:
            throw new Error(`API request failed: ${response.status} ${response.statusText}`)
        }
      }
      
      // Parse response
      const data: SamApiResponse = await response.json()
      
      console.log(`[SAM API] Successfully fetched ${data.opportunitiesData?.length || 0} opportunities (${data.totalRecords} total)`)
      
      return data
    } catch (error) {
      console.error('[SAM API] Error fetching opportunities:', error)
      throw error
    }
  }

  /**
   * Fetch all opportunities with pagination
   */
  async fetchAllOpportunities(
    params: SamApiParams,
    onProgress?: (current: number, total: number) => void
  ): Promise<SamOpportunityData[]> {
    const allOpportunities: SamOpportunityData[] = []
    let offset = 0
    const limit = 1000 // Maximum per request
    
    try {
      while (true) {
        const response = await this.fetchOpportunities({
          ...params,
          offset: offset.toString(),
          limit: limit.toString()
        })
        
        if (response.opportunitiesData && response.opportunitiesData.length > 0) {
          allOpportunities.push(...response.opportunitiesData)
          
          // Call progress callback
          if (onProgress) {
            onProgress(allOpportunities.length, response.totalRecords)
          }
        }
        
        // Check if we've retrieved all records
        if (offset + limit >= response.totalRecords || response.opportunitiesData.length === 0) {
          break
        }
        
        offset += limit
        
        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      console.log(`[SAM API] Completed pagination: ${allOpportunities.length} total opportunities`)
      return allOpportunities
    } catch (error) {
      console.error('[SAM API] Error in pagination:', error)
      throw error
    }
  }

  /**
   * Get opportunities for a specific date range with common filters
   */
  async getOpportunitiesForDateRange(
    fromDate: Date,
    toDate: Date,
    options: {
      naicsCode?: string
      procurementTypes?: string[]
      state?: string
      setAsideType?: string
    } = {}
  ): Promise<SamOpportunityData[]> {
    const params: SamApiParams = {
      postedFrom: fromDate.toLocaleDateString('en-US'),
      postedTo: toDate.toLocaleDateString('en-US'),
      ptype: options.procurementTypes?.join(',') || 'k,o',
      ncode: options.naicsCode,
      state: options.state,
      typeOfSetAside: options.setAsideType
    }
    
    return this.fetchAllOpportunities(params)
  }

  /**
   * Get recent opportunities (last N days)
   */
  async getRecentOpportunities(days: number = 7): Promise<SamOpportunityData[]> {
    const toDate = new Date()
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)
    
    return this.getOpportunitiesForDateRange(fromDate, toDate)
  }

  /**
   * Search opportunities by keyword
   */
  async searchOpportunities(
    keyword: string,
    fromDate: Date,
    toDate: Date,
    options: { naicsCode?: string; limit?: number } = {}
  ): Promise<SamOpportunityData[]> {
    const params: SamApiParams = {
      postedFrom: fromDate.toLocaleDateString('en-US'),
      postedTo: toDate.toLocaleDateString('en-US'),
      title: keyword,
      ncode: options.naicsCode,
      limit: options.limit?.toString() || '1000'
    }
    
    const response = await this.fetchOpportunities(params)
    return response.opportunitiesData || []
  }
}

// Export singleton instance
export const samApiClient = new SamApiClient()

// Export types
export type {
  SamApiParams,
  SamApiResponse,
  SamOpportunityData
}