import { NextRequest, NextResponse } from 'next/server'
import { samGovApi } from '@/lib/services/samGovApi'

export async function POST(request: NextRequest) {
  try {
    // For demo purposes, using a hardcoded organizationId
    // In production, get this from session
    const organizationId = 'demo-org-id'

    const body = await request.json()
    const {
      keyword,
      naicsCodes, // Can be a string (comma-separated) or array
      state,
      setAside,
      postedFrom,
      postedTo,
      responseFrom,
      responseTo,
      limit = 100,
    } = body

    // Parse NAICS codes - accept both string (comma-separated) and array
    let naicsArray: string[] = []
    if (naicsCodes) {
      if (typeof naicsCodes === 'string') {
        naicsArray = naicsCodes.split(',').map((code: string) => code.trim()).filter(Boolean)
      } else if (Array.isArray(naicsCodes)) {
        naicsArray = naicsCodes.map(code => String(code).trim()).filter(Boolean)
      }
    }

    // If no NAICS codes provided, do a single sync without NAICS filter
    if (naicsArray.length === 0) {
      const result = await samGovApi.syncOpportunities(
        organizationId,
        {
          keyword,
          state,
          setAside,
          postedFrom,
          postedTo,
          responseFrom,
          responseTo,
          limit,
        }
      )

      return NextResponse.json({
        success: true,
        ...result,
      })
    }

    // Multi-NAICS sync
    let totalImported = 0
    let totalUpdated = 0
    let totalErrors = 0
    let totalFetched = 0
    const breakdown: { [naicsCode: string]: { imported: number; updated: number; errors: number; fetched: number } } = {}
    const seenNoticeIds = new Set<string>()

    console.log(`Starting multi-NAICS sync for ${naicsArray.length} codes: ${naicsArray.join(', ')}`)

    // Loop through each NAICS code
    for (let i = 0; i < naicsArray.length; i++) {
      const naicsCode = naicsArray[i]
      console.log(`\n--- Processing NAICS ${i + 1} of ${naicsArray.length}: ${naicsCode} ---`)

      try {
        const result = await samGovApi.syncOpportunities(
          organizationId,
          {
            keyword,
            naicsCode,
            state,
            setAside,
            postedFrom,
            postedTo,
            responseFrom,
            responseTo,
            limit,
          },
          (batch, totalBatches) => {
            console.log(`NAICS ${naicsCode} - Batch ${batch} of ${totalBatches}`)
          }
        )

        breakdown[naicsCode] = {
          imported: result.imported,
          updated: result.updated,
          errors: result.errors,
          fetched: result.totalFetched,
        }

        totalImported += result.imported
        totalUpdated += result.updated
        totalErrors += result.errors
        totalFetched += result.totalFetched

        console.log(`NAICS ${naicsCode} results: ${result.imported} imported, ${result.updated} updated, ${result.totalFetched} fetched`)
      } catch (error: any) {
        console.error(`Error syncing NAICS ${naicsCode}:`, error)
        breakdown[naicsCode] = {
          imported: 0,
          updated: 0,
          errors: 1,
          fetched: 0,
        }
        totalErrors++
      }

      // Add delay between NAICS code requests
      if (i < naicsArray.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    console.log(`\nMulti-NAICS sync complete. Total: ${totalImported} imported, ${totalUpdated} updated, ${totalFetched} fetched`)

    return NextResponse.json({
      success: true,
      imported: totalImported,
      updated: totalUpdated,
      errors: totalErrors,
      totalFetched,
      breakdown,
    })
  } catch (error: any) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Sync failed', details: error.message },
      { status: 500 }
    )
  }
}
