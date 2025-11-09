'use client'
// Updated with remove from pipeline functionality
import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

const STAGES = ['Identified', 'Pursuit', 'Capture', 'Proposal Dev', 'Submitted']

const LOST_REASONS = [
  'Price not competitive',
  'Technical capability',
  'Past performance',
  'Incumbent advantage',
  'Agency budget cuts',
  'Solicitation canceled',
  'Other',
]

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [filteredOpportunities, setFilteredOpportunities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('Active')
  const [agencyFilter, setAgencyFilter] = useState('')

  // Modal states
  const [showWonModal, setShowWonModal] = useState(false)
  const [showLostModal, setShowLostModal] = useState(false)
  const [selectedOpp, setSelectedOpp] = useState<any>(null)

  // Won form
  const [contractNumber, setContractNumber] = useState('')
  const [awardAmount, setAwardAmount] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Lost form
  const [lostReason, setLostReason] = useState('')
  const [lostFeedback, setLostFeedback] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)

  useEffect(() => {
    fetchOpportunities()
  }, [statusFilter])

  useEffect(() => {
    applyFilters()
  }, [searchTerm, stageFilter, agencyFilter, opportunities])

  const fetchOpportunities = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)

      const response = await fetch(`/api/opportunities?${params.toString()}`)
      const data = await response.json()
      setOpportunities(data)
    } catch (error) {
      console.error('Failed to fetch opportunities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...opportunities]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(opp =>
        opp.title?.toLowerCase().includes(term) ||
        opp.solicitationNumber?.toLowerCase().includes(term) ||
        opp.agencyName?.toLowerCase().includes(term)
      )
    }

    if (stageFilter) {
      filtered = filtered.filter(opp => opp.stage === stageFilter)
    }

    if (agencyFilter) {
      filtered = filtered.filter(opp => opp.agencyName === agencyFilter)
    }

    setFilteredOpportunities(filtered)
  }

  const handleStageChange = async (oppId: string, newStage: string) => {
    try {
      const response = await fetch(`/api/opportunities/${oppId}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })

      if (!response.ok) throw new Error('Failed to update stage')

      fetchOpportunities()
    } catch (error) {
      console.error('Stage update error:', error)
      alert('Failed to update stage')
    }
  }

  const handleMarkWon = (opp: any) => {
    setSelectedOpp(opp)
    setContractNumber(`CONTRACT-${Date.now()}`)
    setAwardAmount(opp.estimatedValue?.toString() || '')
    setStartDate(format(new Date(), 'yyyy-MM-dd'))
    setShowWonModal(true)
  }

  const handleMarkLost = (opp: any) => {
    setSelectedOpp(opp)
    setLostReason('')
    setLostFeedback('')
    setShowLostModal(true)
  }

  const submitMarkWon = async () => {
    if (!selectedOpp || !contractNumber) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/opportunities/${selectedOpp.id}/mark-won`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contractNumber,
          awardAmount: parseFloat(awardAmount) || undefined,
          startDate,
          endDate: endDate || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to mark as won')
      }

      alert('Opportunity marked as won and contract created!')
      setShowWonModal(false)
      resetWonForm()
      fetchOpportunities()
    } catch (error: any) {
      console.error('Mark won error:', error)
      alert(error.message || 'Failed to mark as won')
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitMarkLost = async () => {
    if (!selectedOpp || !lostReason) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/opportunities/${selectedOpp.id}/mark-lost`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lostReason, lostFeedback }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to mark as lost')
      }

      alert('Opportunity marked as lost with feedback recorded')
      setShowLostModal(false)
      resetLostForm()
      fetchOpportunities()
    } catch (error: any) {
      console.error('Mark lost error:', error)
      alert(error.message || 'Failed to mark as lost')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetWonForm = () => {
    setSelectedOpp(null)
    setContractNumber('')
    setAwardAmount('')
    setStartDate('')
    setEndDate('')
  }

  const resetLostForm = () => {
    setSelectedOpp(null)
    setLostReason('')
    setLostFeedback('')
  }

  const handleRemoveFromPipeline = async (oppId: string, oppTitle: string) => {
    if (!confirm(`Are you sure you want to remove "${oppTitle}" from the pipeline? This action cannot be undone.`)) {
      return
    }

    setIsRemoving(oppId)
    try {
      const response = await fetch(`/api/opportunities/${oppId}/remove`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove from pipeline')
      }

      alert('Opportunity removed from pipeline successfully')
      fetchOpportunities()
    } catch (error: any) {
      console.error('Remove from pipeline error:', error)
      alert(error.message || 'Failed to remove from pipeline')
    } finally {
      setIsRemoving(null)
    }
  }

  const uniqueAgencies = Array.from(new Set(opportunities.map(o => o.agencyName).filter(Boolean))).sort()

  const getStageColor = (stage: string) => {
    const colors: any = {
      'Identified': 'bg-blue-100 text-blue-800',
      'Pursuit': 'bg-indigo-100 text-indigo-800',
      'Capture': 'bg-purple-100 text-purple-800',
      'Proposal Dev': 'bg-pink-100 text-pink-800',
      'Submitted': 'bg-orange-100 text-orange-800',
    }
    return colors[stage] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      'Active': 'bg-green-100 text-green-800',
      'Won': 'bg-emerald-100 text-emerald-800',
      'Lost': 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  // Calculate stats by stage
  const statsByStage = STAGES.reduce((acc, stage) => {
    const opps = opportunities.filter(o => o.stage === stage)
    acc[stage] = {
      count: opps.length,
      value: opps.reduce((sum, o) => sum + (o.estimatedValue || 0), 0),
    }
    return acc
  }, {} as any)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pipeline...</p>
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
            <h1 className="text-2xl font-semibold text-gray-900">Opportunities Pipeline</h1>
            <p className="text-sm text-gray-500">
              Manage your active pursuit opportunities
            </p>
          </div>
          <div className="flex gap-3">
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="Active">Active Pipeline</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
              <option value="">All Statuses</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Pipeline Stats */}
        {statusFilter === 'Active' && (
          <div className="grid grid-cols-5 gap-4">
            {STAGES.map((stage) => (
              <div key={stage} className="bg-white rounded-lg border p-4">
                <div className="text-xs text-gray-500 mb-1">{stage}</div>
                <div className="text-2xl font-bold text-gray-900">{statsByStage[stage]?.count || 0}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {formatCurrency(statsByStage[stage]?.value || 0)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Search & Filters</h2>

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search title, solicitation number, agency..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stage</label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
              >
                <option value="">All Stages</option>
                {STAGES.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
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
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredOpportunities.length} of {opportunities.length} opportunities
            </div>
            <button
              onClick={() => {
                setSearchTerm('')
                setStageFilter('')
                setAgencyFilter('')
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(opp.status)}`}>
                      {opp.status}
                    </span>
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

              <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Stage:</span>
                  <div className="mt-1">
                    {opp.status === 'Active' ? (
                      <select
                        value={opp.stage}
                        onChange={(e) => handleStageChange(opp.id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStageColor(opp.stage)}`}
                      >
                        {STAGES.map(stage => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(opp.stage)}`}>
                        {opp.stage}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Notice Type:</span>
                  <span className="ml-2 font-medium">{opp.noticeType || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Posted:</span>
                  <span className="ml-2 font-medium">
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

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = `/opportunities/${opp.id}`}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Details
                </button>

                {opp.status === 'Active' && (
                  <>
                    <button
                      onClick={() => handleRemoveFromPipeline(opp.id, opp.title)}
                      disabled={isRemoving === opp.id}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2 disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {isRemoving === opp.id ? 'Removing...' : 'Remove from Pipeline'}
                    </button>
                    <button
                      onClick={() => handleMarkWon(opp)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Mark as Won
                    </button>
                    <button
                      onClick={() => handleMarkLost(opp)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Mark as Lost
                    </button>
                  </>
                )}

                {opp.status === 'Won' && opp.contractNumber && (
                  <button
                    onClick={() => window.location.href = '/contracts'}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Contract
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-gray-500">No opportunities found matching your filters</p>
          </div>
        )}
      </div>

      {/* Mark as Won Modal */}
      {showWonModal && selectedOpp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Mark Opportunity as Won</h2>
            <p className="text-sm text-gray-600 mb-4">
              Marking <strong>{selectedOpp.title}</strong> as won will create a contract record.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contract Number *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Award Amount
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={awardAmount}
                  onChange={(e) => setAwardAmount(e.target.value)}
                  placeholder="Enter award amount"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowWonModal(false)
                  resetWonForm()
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={submitMarkWon}
                disabled={!contractNumber || isSubmitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Mark as Won'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Lost Modal */}
      {showLostModal && selectedOpp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Mark Opportunity as Lost</h2>
            <p className="text-sm text-gray-600 mb-4">
              Record why <strong>{selectedOpp.title}</strong> was not won to help improve future bids.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lost Reason *
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  required
                >
                  <option value="">Select a reason...</option>
                  {LOST_REASONS.map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Feedback
                </label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  value={lostFeedback}
                  onChange={(e) => setLostFeedback(e.target.value)}
                  placeholder="Enter any additional feedback or lessons learned..."
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowLostModal(false)
                  resetLostForm()
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={submitMarkLost}
                disabled={!lostReason || isSubmitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Mark as Lost'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
