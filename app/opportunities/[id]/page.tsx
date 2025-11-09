'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'
import TeamManagement from '@/components/opportunities/TeamManagement'
import QuoteManagement from '@/components/opportunities/QuoteManagement'

export default function OpportunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const opportunityId = params.id as string
  const [opportunity, setOpportunity] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (opportunityId) {
      fetchOpportunity()
    }
  }, [opportunityId])

  const fetchOpportunity = async () => {
    try {
      const response = await fetch('/api/opportunities')
      const data = await response.json()
      const opp = data.find((o: any) => o.id === opportunityId)
      setOpportunity(opp)
    } catch (error) {
      console.error('Failed to fetch opportunity:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading opportunity...</p>
        </div>
      </div>
    )
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Opportunity not found</p>
          <button
            onClick={() => router.push('/opportunities')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Opportunities
          </button>
        </div>
      </div>
    )
  }

  const getStageColor = (stage: string) => {
    const colors: any = {
      'Identified': 'bg-blue-100 text-blue-800',
      'Pursuit': 'bg-indigo-100 text-indigo-800',
      'Capture': 'bg-purple-100 text-purple-800',
      'Proposal Dev': 'bg-pink-100 text-pink-800',
      'Submitted': 'bg-red-100 text-red-800',
      'Awarded': 'bg-green-100 text-green-800',
    }
    return colors[stage] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      'Active': 'bg-green-100 text-green-800',
      'Won': 'bg-blue-100 text-blue-800',
      'Lost': 'bg-red-100 text-red-800',
      'Cancelled': 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <button
              onClick={() => router.push('/opportunities')}
              className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
            >
              ← Back to Opportunities
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">{opportunity.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {opportunity.solicitationNumber}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(opportunity.stage)}`}>
                {opportunity.stage}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(opportunity.status)}`}>
                {opportunity.status}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Estimated Value</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(opportunity.estimatedValue)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`py-3 border-b-2 font-medium text-sm ${
              activeTab === 'team'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Team
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`py-3 border-b-2 font-medium text-sm ${
              activeTab === 'quotes'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Quotes
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Key Information */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Key Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Agency
                  </label>
                  <p className="text-gray-900">{opportunity.agencyName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <p className="text-gray-900">{opportunity.departmentName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notice Type
                  </label>
                  <p className="text-gray-900">{opportunity.noticeType || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Set Aside Type
                  </label>
                  <p className="text-gray-900">{opportunity.setAsideType || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NAICS Code
                  </label>
                  <p className="text-gray-900">{opportunity.naicsCode || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Probability
                  </label>
                  <p className="text-gray-900">{opportunity.probability ? `${opportunity.probability}%` : 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Important Dates</h2>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posted Date
                  </label>
                  <p className="text-gray-900">
                    {opportunity.postedDate
                      ? format(new Date(opportunity.postedDate), 'MMM d, yyyy')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Response Deadline
                  </label>
                  <p className="text-gray-900 font-semibold">
                    {opportunity.responseDeadline
                      ? format(new Date(opportunity.responseDeadline), 'MMM d, yyyy')
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Archive Date
                  </label>
                  <p className="text-gray-900">
                    {opportunity.archiveDate
                      ? format(new Date(opportunity.archiveDate), 'MMM d, yyyy')
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            {opportunity.description && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{opportunity.description}</p>
              </div>
            )}

            {/* Links */}
            {(opportunity.descriptionLink || opportunity.additionalInfoLink) && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">External Links</h2>
                <div className="space-y-3">
                  {opportunity.descriptionLink && (
                    <div>
                      <a
                        href={opportunity.descriptionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Full Details on SAM.gov
                      </a>
                    </div>
                  )}
                  {opportunity.additionalInfoLink && (
                    <div>
                      <a
                        href={opportunity.additionalInfoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Additional Information
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <TeamManagement
            opportunityId={opportunity.id}
            opportunityTitle={opportunity.title}
          />
        )}

        {/* Quotes Tab */}
        {activeTab === 'quotes' && (
          <QuoteManagement opportunityId={opportunity.id} />
        )}
      </div>
    </div>
  )
}
