'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

export default function SamGovPage() {
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isAdding, setIsAdding] = useState<string | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [showSyncForm, setShowSyncForm] = useState(false)
  const [syncProgress, setSyncProgress] = useState<string>('')

  // Sync form fields
  const [syncNaicsCodes, setSyncNaicsCodes] = useState('')
  const [syncKeyword, setSyncKeyword] = useState('')
  const [syncState, setSyncState] = useState('')
  const [syncSetAside, setSyncSetAside] = useState('')
  const [syncPostedFrom, setSyncPostedFrom] = useState('')
  const [syncPostedTo, setSyncPostedTo] = useState('')

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [agencyFilter, setAgencyFilter] = useState('')
  const [noticeTypeFilter, setNoticeTypeFilter] = useState('')
  const [setAsideFilter, setSetAsideFilter] = useState('')
  const [naicsFilter, setNaicsFilter] = useState<string[]>([])
  const [pipelineStatusFilter, setPipelineStatusFilter] = useState('not_added')
  const [dateRangeFilter, setDateRangeFilter] = useState('all')
  const [customDateFrom, setCustomDateFrom] = useState('')
  const [customDateTo, setCustomDateTo] = useState('')

  useEffect(() => {
    fetchOrganization()
    fetchOpportunities()
  }, [])

  const fetchOrganization = async () => {
    setOrganizationId('cmgy6b6g40000bmu5nyozr67g')
  }

  const fetchOpportunities = async () => {
    try {
      const response = await fetch('/api/sam-gov-opportunities')
      const data = await response.json()
      setOpportunities(data)
    } catch (error) {
      console.error('Failed to fetch opportunities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncProgress('Starting sync...')
    try {
      const convertDate = (dateStr: string) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const year = date.getFullYear()
        return `${month}/${day}/${year}`
      }

      const response = await fetch('/api/sam-gov/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          naicsCodes: syncNaicsCodes,
          keyword: syncKeyword,
          state: syncState,
          setAside: syncSetAside,
          postedFrom: syncPostedFrom ? convertDate(syncPostedFrom) : undefined,
          postedTo: syncPostedTo ? convertDate(syncPostedTo) : undefined,
          limit: 100,
        }),
      })

      if (!response.ok) throw new Error('Sync failed')
      const data = await response.json()

      let message = `Sync complete!\n\nTotal: ${data.imported} imported, ${data.updated} updated`
      if (data.totalFetched) {
        message += `, ${data.totalFetched} fetched`
      }

      if (data.breakdown) {
        message += `\n\nBreakdown by NAICS:`
        Object.entries(data.breakdown).forEach(([naics, stats]: [string, any]) => {
          message += `\n  • ${naics}: ${stats.imported} imported, ${stats.fetched} fetched`
        })
      }

      alert(message)
      setSyncProgress('')
      setShowSyncForm(false)
      fetchOpportunities()
    } catch (error) {
      console.error('Sync error:', error)
      alert('Sync failed. Please check your SAM.gov API key.')
      setSyncProgress('')
    } finally {
      setIsSyncing(false)
    }
  }

  const handleAddToPipeline = async (oppId: string) => {
    if (!organizationId) {
      alert('Organization not loaded. Please refresh the page.')
      return
    }

    setIsAdding(oppId)
    try {
      const response = await fetch(`/api/sam-gov-opportunities/${oppId}/add-to-pipeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add to pipeline')
      }

      alert('Successfully added to pipeline!')
      fetchOpportunities()
    } catch (error: any) {
      console.error('Add to pipeline error:', error)
      alert(`Failed to add to pipeline: ${error.message}`)
    } finally {
      setIsAdding(null)
    }
  }

  // Apply filters
  const filteredOpportunities = opportunities.filter(opp => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const matches =
        opp.title?.toLowerCase().includes(term) ||
        opp.description?.toLowerCase().includes(term) ||
        opp.solicitationNumber?.toLowerCase().includes(term) ||
        opp.agencyName?.toLowerCase().includes(term) ||
        opp.naicsCode?.toLowerCase().includes(term)
      if (!matches) return false
    }

    // Agency filter
    if (agencyFilter && opp.agencyName !== agencyFilter) return false

    // Notice type filter
    if (noticeTypeFilter && opp.noticeType !== noticeTypeFilter) return false

    // Set aside filter
    if (setAsideFilter && opp.setAsideType !== setAsideFilter) return false

    // NAICS filter (OR logic - match ANY selected NAICS code)
    if (naicsFilter.length > 0 && !naicsFilter.includes(opp.naicsCode)) return false

    // Pipeline status filter
    if (pipelineStatusFilter === 'added' && !opp.addedToPipeline) return false
    if (pipelineStatusFilter === 'not_added' && opp.addedToPipeline) return false

    // Date range filter
    if (dateRangeFilter !== 'all' && opp.postedDate) {
      const postedDate = new Date(opp.postedDate)
      const now = new Date()

      if (dateRangeFilter === 'last7') {
        const cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        if (postedDate < cutoff) return false
      } else if (dateRangeFilter === 'last30') {
        const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        if (postedDate < cutoff) return false
      } else if (dateRangeFilter === 'last90') {
        const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        if (postedDate < cutoff) return false
      } else if (dateRangeFilter === 'custom') {
        if (customDateFrom) {
          const fromDate = new Date(customDateFrom)
          if (postedDate < fromDate) return false
        }
        if (customDateTo) {
          const toDate = new Date(customDateTo)
          if (postedDate > toDate) return false
        }
      }
    }

    return true
  })

  const uniqueAgencies = Array.from(new Set(opportunities.map(o => o.agencyName).filter(Boolean))).sort()
  const uniqueNoticeTypes = Array.from(new Set(opportunities.map(o => o.noticeType).filter(Boolean))).sort()
  const uniqueSetAsideTypes = Array.from(new Set(opportunities.map(o => o.setAsideType).filter(Boolean))).sort()
  const uniqueNAICS = Array.from(new Set(opportunities.map(o => o.naicsCode).filter(Boolean))).sort()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SAM.gov opportunities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">SAM.gov Review Queue</h1>
            <p className="text-sm text-gray-500">Review and select opportunities to add to your pipeline</p>
          </div>
          <button
            onClick={() => setShowSyncForm(!showSyncForm)}
            disabled={isSyncing}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isSyncing ? 'Syncing...' : 'Sync from SAM.gov'}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Sync Form */}
        {showSyncForm && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Sync Opportunities from SAM.gov</h2>

            {syncProgress && (
              <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="flex items-center gap-2 text-indigo-700">
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>{syncProgress}</span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">NAICS Codes (comma-separated)</label>
                <textarea
                  rows={3}
                  placeholder="541511, 811210, 541330 (comma-separated)"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={syncNaicsCodes}
                  onChange={(e) => setSyncNaicsCodes(e.target.value)}
                  disabled={isSyncing}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter multiple NAICS codes separated by commas to sync opportunities across multiple codes
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keyword (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., IT services"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={syncKeyword}
                    onChange={(e) => setSyncKeyword(e.target.value)}
                    disabled={isSyncing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., VA"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={syncState}
                    onChange={(e) => setSyncState(e.target.value)}
                    disabled={isSyncing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Set Aside (optional)</label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={syncSetAside}
                    onChange={(e) => setSyncSetAside(e.target.value)}
                    disabled={isSyncing}
                  >
                    <option value="">All</option>
                    <option value="SBA">Small Business</option>
                    <option value="8A">8(a)</option>
                    <option value="HZC">HUBZone</option>
                    <option value="SDVOSBC">Service-Disabled Veteran-Owned</option>
                    <option value="WOSB">Women-Owned Small Business</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Posted From (optional)</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={syncPostedFrom}
                    onChange={(e) => setSyncPostedFrom(e.target.value)}
                    disabled={isSyncing}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Posted To (optional)</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={syncPostedTo}
                    onChange={(e) => setSyncPostedTo(e.target.value)}
                    disabled={isSyncing}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSync}
                  disabled={isSyncing || !syncNaicsCodes.trim()}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSyncing ? 'Syncing...' : 'Start Sync'}
                </button>
                <button
                  onClick={() => setShowSyncForm(false)}
                  disabled={isSyncing}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search opportunities..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Agency</label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={agencyFilter}
                onChange={(e) => setAgencyFilter(e.target.value)}
              >
                <option value="">All Agencies</option>
                {uniqueAgencies.map(agency => (
                  <option key={agency} value={agency}>{agency}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notice Type</label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={noticeTypeFilter}
                onChange={(e) => setNoticeTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {uniqueNoticeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Set Aside</label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={setAsideFilter}
                onChange={(e) => setSetAsideFilter(e.target.value)}
              >
                <option value="">All Set Asides</option>
                {uniqueSetAsideTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">NAICS Code</label>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto bg-white">
                {uniqueNAICS.length === 0 ? (
                  <p className="text-sm text-gray-500">No NAICS codes available</p>
                ) : (
                  <div className="space-y-2">
                    {uniqueNAICS.map(naics => (
                      <label key={naics} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={naicsFilter.includes(naics)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNaicsFilter([...naicsFilter, naics])
                            } else {
                              setNaicsFilter(naicsFilter.filter(n => n !== naics))
                            }
                          }}
                          className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-sm">{naics}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {naicsFilter.length > 0
                  ? `${naicsFilter.length} code${naicsFilter.length > 1 ? 's' : ''} selected`
                  : 'Select one or more NAICS codes'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline Status</label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={pipelineStatusFilter}
                onChange={(e) => setPipelineStatusFilter(e.target.value)}
              >
                <option value="all">All Opportunities</option>
                <option value="not_added">Not in Pipeline</option>
                <option value="added">In Pipeline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Posted Date Range</label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
              >
                <option value="all">All Dates</option>
                <option value="last7">Last 7 Days</option>
                <option value="last30">Last 30 Days</option>
                <option value="last90">Last 90 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateRangeFilter === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={customDateFrom}
                    onChange={(e) => setCustomDateFrom(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={customDateTo}
                    onChange={(e) => setCustomDateTo(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredOpportunities.length} of {opportunities.length} opportunities
            </div>
            <button
              onClick={() => {
                setSearchTerm('')
                setAgencyFilter('')
                setNoticeTypeFilter('')
                setSetAsideFilter('')
                setNaicsFilter([])
                setPipelineStatusFilter('not_added')
                setDateRangeFilter('all')
                setCustomDateFrom('')
                setCustomDateTo('')
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="space-y-4">
          {filteredOpportunities.map((opp) => (
            <div key={opp.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{opp.title}</h3>
                    {opp.addedToPipeline && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        ✓ In Pipeline
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{opp.solicitationNumber}</p>
                  <p className="text-sm text-gray-700 mt-1">{opp.agencyName}</p>
                </div>
                {opp.estimatedValue && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Estimated Value</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(opp.estimatedValue)}
                    </div>
                  </div>
                )}
              </div>

              {opp.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{opp.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 font-medium">{opp.noticeType || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Set Aside:</span>
                  <span className="ml-2 font-medium">{opp.setAsideType || 'None'}</span>
                </div>
                <div>
                  <span className="text-gray-500">NAICS:</span>
                  <span className="ml-2 font-medium">{opp.naicsCode || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Posted:</span>
                  <span className="ml-2 font-medium text-indigo-600">
                    {opp.postedDate ? format(new Date(opp.postedDate), 'MMM d, yyyy') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Response Due:</span>
                  <span className="ml-2 font-medium">
                    {opp.responseDeadline ? format(new Date(opp.responseDeadline), 'MMM d, yyyy') : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {opp.descriptionLink && (
                  <button
                    onClick={() => window.open(opp.descriptionLink, '_blank')}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View on SAM.gov
                  </button>
                )}
                {!opp.addedToPipeline ? (
                  <button
                    onClick={() => handleAddToPipeline(opp.id)}
                    disabled={isAdding === opp.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {isAdding === opp.id ? 'Adding...' : 'Add to Pipeline'}
                  </button>
                ) : (
                  <button
                    onClick={() => window.location.href = '/opportunities'}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    View in Pipeline
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-gray-500">No opportunities found matching your filters</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setAgencyFilter('')
                setNoticeTypeFilter('')
                setSetAsideFilter('')
                setNaicsFilter([])
                setPipelineStatusFilter('all')
                setDateRangeFilter('all')
                setCustomDateFrom('')
                setCustomDateTo('')
              }}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
