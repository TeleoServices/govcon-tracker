import { NextRequest, NextResponse } from 'next/server'

const SAM_API_KEY = 'M1v3EyXRPp6b5mdrcPck6a8tCPy6qgebd9j4H2bD'
const SAM_API_BASE = 'https://api.sam.gov/entity-information/v4/entities'

export async function POST(request: NextRequest) {
  try {
    const { businessName, ueiSAM } = await request.json()

    if (!businessName && !ueiSAM) {
      return NextResponse.json(
        { error: 'Business name or UEI SAM is required' },
        { status: 400 }
      )
    }

    // Build the query parameters
    const params = new URLSearchParams({
      api_key: SAM_API_KEY,
      includeSections: 'entityRegistration,coreData'
    })

    // Add search parameter (prioritize UEI if provided)
    if (ueiSAM) {
      params.append('ueiSAM', ueiSAM)
    } else if (businessName) {
      params.append('legalBusinessName', businessName)
    }

    const url = `${SAM_API_BASE}?${params.toString()}`
    
    console.log('[SAM Verification] Searching for:', ueiSAM || businessName)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[SAM Verification] API error:', response.status, errorText)
      
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          found: false,
          message: 'No entity found in SAM.gov'
        })
      }
      
      return NextResponse.json(
        { error: `SAM.gov API error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Check if we found any entities
    if (!data.totalRecords || data.totalRecords === 0) {
      return NextResponse.json({
        success: true,
        found: false,
        message: 'No entity found in SAM.gov with the provided information'
      })
    }

    // Get the first entity (most relevant match)
    const entity = data.entityData?.[0]
    
    if (!entity) {
      return NextResponse.json({
        success: true,
        found: false,
        message: 'No valid entity data found'
      })
    }

    // Extract relevant information
    const coreData = entity.coreData
    const registration = entity.entityRegistration
    
    // Check registration status
    const isActive = registration?.registrationStatus === 'Active'
    const expirationDate = registration?.expirationDate
    const isExpired = expirationDate ? new Date(expirationDate) < new Date() : false

    const entityInfo = {
      found: true,
      active: isActive && !isExpired,
      data: {
        // Basic Information
        legalBusinessName: coreData?.legalBusinessName || '',
        dbaName: coreData?.dbaName || '',
        ueiSAM: registration?.ueiSAM || '',
        cageCode: registration?.cageCode || '',
        
        // Registration Status
        registrationStatus: registration?.registrationStatus || 'Unknown',
        registrationDate: registration?.registrationDate || null,
        expirationDate: expirationDate || null,
        lastUpdateDate: registration?.lastUpdateDate || null,
        
        // Business Details
        entityStructure: coreData?.entityStructure?.entityStructureDesc || '',
        entityType: coreData?.entityTypeDesc || '',
        organizationStructure: coreData?.organizationStructure || '',
        profitStructure: coreData?.profitStructure || '',
        
        // Location
        physicalAddress: {
          street: coreData?.physicalAddress?.addressLine1 || '',
          street2: coreData?.physicalAddress?.addressLine2 || '',
          city: coreData?.physicalAddress?.city || '',
          state: coreData?.physicalAddress?.stateOrProvinceCode || '',
          zipCode: coreData?.physicalAddress?.zipCode || '',
          country: coreData?.physicalAddress?.countryCode || ''
        },
        
        // Business Type Codes
        businessTypes: coreData?.businessTypes?.businessTypeList || [],
        naicsCodes: coreData?.naicsList?.map((n: any) => ({
          code: n.naicsCode,
          description: n.naicsDesc,
          isPrimary: n.primaryNaics === 'Y'
        })) || [],
        
        // Socioeconomic Categories
        socioeconomicCategories: {
          isSmallBusiness: coreData?.businessTypes?.businessTypeList?.some((bt: any) => bt.businessTypeCode === '2X') || false,
          isWomanOwned: coreData?.businessTypes?.businessTypeList?.some((bt: any) => bt.businessTypeCode === 'A6') || false,
          isVeteranOwned: coreData?.businessTypes?.businessTypeList?.some((bt: any) => bt.businessTypeCode === 'A5') || false,
          isServiceDisabledVeteranOwned: coreData?.businessTypes?.businessTypeList?.some((bt: any) => bt.businessTypeCode === 'QF') || false,
          is8aCertified: coreData?.businessTypes?.businessTypeList?.some((bt: any) => bt.businessTypeCode === 'XX') || false,
          isHUBZone: coreData?.businessTypes?.businessTypeList?.some((bt: any) => bt.businessTypeCode === 'XX') || false,
          isMinorityOwned: coreData?.businessTypes?.businessTypeList?.some((bt: any) => ['23', 'OY', '8W'].includes(bt.businessTypeCode)) || false,
        },
        
        // Points of Contact
        pointsOfContact: coreData?.pointsOfContact?.map((poc: any) => ({
          firstName: poc.firstName || '',
          lastName: poc.lastName || '',
          title: poc.title || '',
          email: poc.electronicMailAddress || '',
          phone: poc.telephoneNumber || '',
          type: poc.pocType || ''
        })) || []
      }
    }

    return NextResponse.json({
      success: true,
      ...entityInfo
    })

  } catch (error) {
    console.error('[SAM Verification] Error:', error)
    return NextResponse.json(
      { error: 'Failed to verify entity in SAM.gov' },
      { status: 500 }
    )
  }
}