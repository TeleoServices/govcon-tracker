# TELEO GovCon Tracker - Advanced Features Implementation

## Current Status ✅
- ✅ Basic application structure
- ✅ Database with 18 models
- ✅ Dashboard with KPIs and funnel
- ✅ 6 pages (Dashboard, SAM.gov, Opportunities, Subcontractors, Contact Log, Contracts)
- ✅ 50 sample opportunities seeded
- ✅ Authentication setup

## Missing Features to Implement 🚧

This guide will help you add:
1. **SAM.gov API Integration** - Real-time opportunity sync
2. **Contact Log Functionality** - Full CRUD operations
3. **Quote Management System** - Track subcontractor quotes
4. **Team Member Assignments** - Assign users to opportunities
5. **Activity Logging** - Audit trail for all actions
6. **Compliance Tracking** - Manage requirements
7. **Document Upload** - File management system
8. **Advanced Search/Filter** - Multi-field filtering
9. **Reporting Dashboard** - Export and analytics
10. **Notifications** - Email and in-app alerts

---

## PHASE 1: SAM.gov API Integration

### Step 1.1: Set Up SAM.gov API Key

**File: `.env`**

Add to your existing `.env` file:

```env
# Existing variables
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3001"

# SAM.gov API Configuration
SAM_GOV_API_KEY="YOUR_API_KEY_HERE"
SAM_GOV_API_URL="https://api.sam.gov/opportunities/v2/search"
SAM_GOV_RATE_LIMIT=10
```

To get a SAM.gov API key:
1. Go to https://open.gsa.gov/api/get-opportunities-public-api/
2. Register for an API key
3. Replace `YOUR_API_KEY_HERE` with your actual key

---

### Step 1.2: Create SAM.gov API Service

**File: `lib/services/samGovApi.ts`**

```typescript
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
      if (params.postedFrom) queryParams.append('postedFrom', params.postedFrom)
      if (params.postedTo) queryParams.append('postedTo', params.postedTo)
      if (params.responseFrom) queryParams.append('rdlfrom', params.responseFrom)
      if (params.responseTo) queryParams.append('rdlto', params.responseTo)
      
      queryParams.append('limit', (params.limit || 25).toString())
      queryParams.append('offset', (params.offset || 0).toString())
      queryParams.append('api_key', this.apiKey)

      const url = `${this.baseUrl}?${queryParams.toString()}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`SAM.gov API error: ${response.statusText}`)
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
      const url = `https://api.sam.gov/opportunities/v2/search?noticeid=${noticeId}&api_key=${this.apiKey}`

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
    params: SamGovSearchParams
  ): Promise<{
    imported: number
    updated: number
    errors: number
  }> {
    try {
      const { opportunities, totalRecords } = await this.searchOpportunities(params)

      let imported = 0
      let updated = 0
      let errors = 0

      // Import opportunities into database
      for (const samOpp of opportunities) {
        try {
          const existingOpp = await prisma.opportunity.findUnique({
            where: { noticeId: samOpp.noticeId }
          })

          const oppData = {
            noticeId: samOpp.noticeId,
            solicitationNumber: samOpp.solicitationNumber || samOpp.noticeId,
            title: samOpp.title,
            description: samOpp.description,
            organizationId,
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
            stage: 'Identified',
            status: 'Active',
            descriptionLink: samOpp.links?.find(l => l.rel === 'self')?.href,
          }

          if (existingOpp) {
            await prisma.opportunity.update({
              where: { id: existingOpp.id },
              data: oppData,
            })
            updated++
          } else {
            await prisma.opportunity.create({
              data: oppData,
            })
            imported++
          }
        } catch (error) {
          console.error('Error importing opportunity:', error)
          errors++
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

      return { imported, updated, errors }
    } catch (error) {
      console.error('Sync error:', error)
      throw error
    }
  }
}

export const samGovApi = new SamGovApiService()
```

---

### Step 1.3: Create SAM.gov Sync API Endpoint

**File: `app/api/sam-gov/sync/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { samGovApi } from '@/lib/services/samGovApi'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      keyword,
      naicsCode,
      state,
      setAside,
      postedFrom,
      postedTo,
      responseFrom,
      responseTo,
      limit = 100,
    } = body

    // Sync opportunities
    const result = await samGovApi.syncOpportunities(
      session.user.organizationId,
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
      }
    )

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      { error: 'Sync failed', details: error.message },
      { status: 500 }
    )
  }
}
```

---

### Step 1.4: Create SAM.gov Search API Endpoint

**File: `app/api/sam-gov/search/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { samGovApi } from '@/lib/services/samGovApi'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const params = {
      keyword: searchParams.get('keyword') || undefined,
      naicsCode: searchParams.get('naicsCode') || undefined,
      state: searchParams.get('state') || undefined,
      setAside: searchParams.get('setAside') || undefined,
      postedFrom: searchParams.get('postedFrom') || undefined,
      postedTo: searchParams.get('postedTo') || undefined,
      responseFrom: searchParams.get('responseFrom') || undefined,
      responseTo: searchParams.get('responseTo') || undefined,
      limit: parseInt(searchParams.get('limit') || '25'),
      offset: parseInt(searchParams.get('offset') || '0'),
    }

    const result = await samGovApi.searchOpportunities(params)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed', details: error.message },
      { status: 500 }
    )
  }
}
```

---

### Step 1.5: Update SAM.gov Page with Sync Functionality

**File: `app/sam-gov/page.tsx` (Update existing)**

Add this to your existing SAM.gov page:

```typescript
'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

export default function SamGovPage() {
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    naicsCode: '',
    state: '',
    setAside: 'All',
    postedFrom: '',
    postedTo: '',
    responseFrom: '',
    responseTo: '',
  })

  const [page, setPage] = useState(0)
  const limit = 25

  // Search SAM.gov
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['sam-gov-search', searchParams, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        ...searchParams,
        limit: limit.toString(),
        offset: (page * limit).toString(),
      })
      const response = await fetch(`/api/sam-gov/search?${params}`)
      if (!response.ok) throw new Error('Search failed')
      return response.json()
    },
    enabled: false, // Only search when user clicks button
  })

  // Sync opportunities
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/sam-gov/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams),
      })
      if (!response.ok) throw new Error('Sync failed')
      return response.json()
    },
    onSuccess: (data) => {
      alert(`Sync complete! Imported: ${data.imported}, Updated: ${data.updated}`)
    },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">SAM.gov Opportunities</h1>
            <p className="text-sm text-gray-500">
              Government contract opportunities from SAM.gov
            </p>
          </div>
          <Button
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {syncMutation.isPending ? 'Syncing...' : 'Sync Opportunities'}
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Sync Status Card */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <h2 className="text-lg font-semibold">Sync Status</h2>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Last Sync</div>
              <div className="text-lg font-semibold">Just now</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Opportunities</div>
              <div className="text-lg font-semibold">
                {searchResults?.totalRecords || '8,519'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Active Opportunities</div>
              <div className="text-lg font-semibold">
                {searchResults?.opportunities?.length || '8,519'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm font-medium text-green-600">Ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Form */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Search & Filter</h2>
          
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="Search title, description..."
              value={searchParams.keyword}
              onChange={(e) => setSearchParams({ ...searchParams, keyword: e.target.value })}
            />
            <Input
              placeholder="NAICS Code (e.g., 541511)"
              value={searchParams.naicsCode}
              onChange={(e) => setSearchParams({ ...searchParams, naicsCode: e.target.value })}
            />
            <Input
              placeholder="State (e.g., VA, CA, TX)"
              value={searchParams.state}
              onChange={(e) => setSearchParams({ ...searchParams, state: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            <Select
              value={searchParams.setAside}
              onValueChange={(value) => setSearchParams({ ...searchParams, setAside: value })}
            >
              <option value="All">All Set Asides</option>
              <option value="SBA">Small Business</option>
              <option value="8A">8(a)</option>
              <option value="HZ">HUBZone</option>
              <option value="WOSB">Woman-Owned</option>
              <option value="SDVOSB">Service-Disabled Veteran-Owned</option>
            </Select>

            <Input
              type="date"
              placeholder="Posted From"
              value={searchParams.postedFrom}
              onChange={(e) => setSearchParams({ ...searchParams, postedFrom: e.target.value })}
            />
            <Input
              type="date"
              placeholder="Posted To"
              value={searchParams.postedTo}
              onChange={(e) => setSearchParams({ ...searchParams, postedTo: e.target.value })}
            />
          </div>

          <div className="mt-4">
            <Button
              onClick={() => refetch()}
              disabled={isSearching}
              className="w-full bg-gray-900 hover:bg-gray-800"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>

        {/* Results */}
        {searchResults && (
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Showing {searchResults.opportunities.length} of {searchResults.totalRecords} opportunities
              </h2>
              <div className="flex gap-2">
                <Button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  variant="outline"
                >
                  Previous
                </Button>
                <span className="px-4 py-2">Page {page + 1}</span>
                <Button
                  onClick={() => setPage(p => p + 1)}
                  disabled={(page + 1) * limit >= searchResults.totalRecords}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              {searchResults.opportunities.map((opp: any) => (
                <div key={opp.noticeId} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{opp.title}</h3>
                      <p className="text-sm text-gray-500">{opp.solicitationNumber}</p>
                      <p className="text-sm text-gray-600 mt-2">{opp.organizationName}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <span className="ml-2 font-medium">{opp.type}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">NAICS:</span>
                      <span className="ml-2 font-medium">{opp.naicsCode || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Posted:</span>
                      <span className="ml-2 font-medium">
                        {opp.postedDate ? new Date(opp.postedDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Response Due:</span>
                      <span className="ml-2 font-medium">
                        {opp.responseDeadline ? new Date(opp.responseDeadline).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => window.open(`https://sam.gov/opp/${opp.noticeId}`, '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      View on SAM.gov
                    </Button>
                    <Button
                      onClick={() => {
                        // Import this opportunity
                        syncMutation.mutate()
                      }}
                      size="sm"
                      className="bg-primary-600"
                    >
                      Import
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## PHASE 2: Contact Log Functionality

### Step 2.1: Create Contact Log API

**File: `app/api/contact-log/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In a real app, this would query a ContactLog table
    // For now, we'll use Activity table filtered by type
    const activities = await prisma.activity.findMany({
      where: {
        organizationId: session.user.organizationId,
        activityType: 'Contact',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        subcontractor: {
          select: {
            companyName: true,
          },
        },
        opportunity: {
          select: {
            title: true,
            solicitationNumber: true,
          },
        },
      },
      orderBy: {
        activityDate: 'desc',
      },
    })

    return NextResponse.json(activities)
  } catch (error) {
    console.error('Error fetching contact log:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact log' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      subcontractorId,
      opportunityId,
      contactType,
      description,
      status,
    } = body

    const activity = await prisma.activity.create({
      data: {
        organizationId: session.user.organizationId,
        entityType: 'Subcontractor',
        entityId: subcontractorId,
        activityType: 'Contact',
        description,
        userId: session.user.id,
        subcontractorId,
        opportunityId,
        metadata: JSON.stringify({
          contactType,
          status,
        }),
      },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error) {
    console.error('Error creating contact log:', error)
    return NextResponse.json(
      { error: 'Failed to create contact log' },
      { status: 500 }
    )
  }
}
```

---

## PHASE 3: Quote Management

### Step 3.1: Create Quote API Endpoints

**File: `app/api/quotes/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const opportunityId = searchParams.get('opportunityId')

    const quotes = await prisma.quote.findMany({
      where: {
        organizationId: session.user.organizationId,
        ...(opportunityId && { opportunityId }),
      },
      include: {
        subcontractor: {
          select: {
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
          },
        },
        opportunity: {
          select: {
            title: true,
            solicitationNumber: true,
          },
        },
      },
      orderBy: {
        quoteDate: 'desc',
      },
    })

    return NextResponse.json(quotes)
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      opportunityId,
      subcontractorId,
      amount,
      quoteDate,
      validUntil,
      status,
      notes,
    } = body

    const quote = await prisma.quote.create({
      data: {
        organizationId: session.user.organizationId,
        opportunityId,
        subcontractorId,
        amount: parseFloat(amount),
        quoteDate: new Date(quoteDate),
        validUntil: validUntil ? new Date(validUntil) : undefined,
        status: status || 'Pending',
        notes,
      },
      include: {
        subcontractor: true,
        opportunity: true,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        organizationId: session.user.organizationId,
        entityType: 'Quote',
        entityId: quote.id,
        activityType: 'Created',
        description: `Quote received from ${quote.subcontractor?.companyName} for $${amount}`,
        userId: session.user.id,
        opportunityId,
        subcontractorId,
      },
    })

    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json(
      { error: 'Failed to create quote' },
      { status: 500 }
    )
  }
}
```

---

## Quick Setup Commands for Claude Code

To add all these features quickly, use Claude Code with this command:

```
Add the following advanced features to the TELEO GovCon Tracker:

1. SAM.gov API Integration
   - Create lib/services/samGovApi.ts with full SAM.gov API client
   - Add API routes: /api/sam-gov/sync and /api/sam-gov/search
   - Update SAM.gov page with real search and sync functionality
   - Add environment variables for API key

2. Contact Log System
   - Create /api/contact-log endpoints (GET, POST)
   - Update Contact Log page with full CRUD operations
   - Link contacts to subcontractors and opportunities

3. Quote Management
   - Create /api/quotes endpoints (GET, POST, PUT, DELETE)
   - Add quote creation forms to subcontractor and opportunity pages
   - Display quotes in tables with status tracking

4. Activity Logging
   - Automatically log all create/update/delete actions
   - Show activity feed on dashboard and detail pages
   - Include user, timestamp, and action details

5. Team Member Management
   - Create /api/team-members endpoints
   - Add user assignment UI to opportunity pages
   - Show team member roles and assignments

6. Advanced Search
   - Add multi-field search to all list pages
   - Implement filters for date ranges, status, agency, etc.
   - Add export functionality (CSV, Excel)

Use the database schema already in place. Follow the TELEO design patterns for all new UI components.
```

---

## Testing Checklist

After implementation:

- [ ] SAM.gov search returns real results
- [ ] Can sync opportunities from SAM.gov
- [ ] Can log contacts with subcontractors
- [ ] Can create and track quotes
- [ ] Activities appear in audit trail
- [ ] Can assign team members to opportunities
- [ ] Search and filters work on all pages
- [ ] All data persists in SQLite database

---

## Next Steps

After adding these core features, you can enhance with:
- Email notifications
- Document upload to cloud storage
- Advanced reporting and analytics
- Mobile responsive improvements
- Performance optimization
- Data export capabilities
