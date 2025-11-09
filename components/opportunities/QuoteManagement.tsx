'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

interface QuoteManagementProps {
  opportunityId: string
}

export default function QuoteManagement({ opportunityId }: QuoteManagementProps) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    subcontractorId: '',
    amount: '',
    quoteDate: new Date().toISOString().split('T')[0],
    validUntil: '',
    status: 'Pending',
    notes: '',
  })

  // Fetch quotes for this opportunity
  const { data: quotes, isLoading: loadingQuotes } = useQuery({
    queryKey: ['quotes', opportunityId],
    queryFn: async () => {
      const response = await fetch(`/api/quotes?opportunityId=${opportunityId}`)
      if (!response.ok) throw new Error('Failed to fetch quotes')
      return response.json()
    },
    enabled: !!opportunityId,
  })

  // Fetch subcontractors for dropdown
  const { data: subcontractors } = useQuery({
    queryKey: ['subcontractors'],
    queryFn: async () => {
      const response = await fetch('/api/subcontractors')
      if (!response.ok) throw new Error('Failed to fetch subcontractors')
      return response.json()
    },
  })

  // Create quote mutation
  const createQuoteMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          opportunityId,
        }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create quote')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', opportunityId] })
      setShowForm(false)
      setFormData({
        subcontractorId: '',
        amount: '',
        quoteDate: new Date().toISOString().split('T')[0],
        validUntil: '',
        status: 'Pending',
        notes: '',
      })
    },
    onError: (error: Error) => {
      alert(error.message)
    },
  })

  // Update quote status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ quoteId, status }: { quoteId: string; status: string }) => {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error('Failed to update quote')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', opportunityId] })
    },
  })

  // Delete quote mutation
  const deleteQuoteMutation = useMutation({
    mutationFn: async (quoteId: string) => {
      const response = await fetch(`/api/quotes/${quoteId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete quote')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', opportunityId] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.subcontractorId || !formData.amount) {
      alert('Please select a subcontractor and enter an amount')
      return
    }
    createQuoteMutation.mutate(formData)
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Accepted': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const totalQuoteAmount = quotes?.reduce((sum: number, quote: any) => sum + quote.amount, 0) || 0

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Quotes</h3>
          <p className="text-sm text-gray-500">
            Manage subcontractor quotes for this opportunity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Quoted</div>
            <div className="text-lg font-semibold text-gray-900">{formatCurrency(totalQuoteAmount)}</div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
          >
            {showForm ? 'Cancel' : '+ Add Quote'}
          </button>
        </div>
      </div>

      {/* Add Quote Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcontractor *
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.subcontractorId}
                onChange={(e) => setFormData({ ...formData, subcontractorId: e.target.value })}
                required
              >
                <option value="">Select a subcontractor...</option>
                {subcontractors?.map((sub: any) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.companyName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote Date *
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.quoteDate}
                onChange={(e) => setFormData({ ...formData, quoteDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valid Until
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this quote..."
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              type="submit"
              disabled={createQuoteMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {createQuoteMutation.isPending ? 'Creating...' : 'Add Quote'}
            </button>
          </div>
        </form>
      )}

      {/* Quotes List */}
      <div className="space-y-3">
        {loadingQuotes ? (
          <div className="text-center py-4 text-gray-500">Loading quotes...</div>
        ) : quotes && quotes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Subcontractor
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Quote Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Valid Until
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {quotes.map((quote: any) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {quote.subcontractor?.companyName || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatCurrency(quote.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {format(new Date(quote.quoteDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {quote.validUntil ? format(new Date(quote.validUntil), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={quote.status}
                        onChange={(e) => updateStatusMutation.mutate({ quoteId: quote.id, status: e.target.value })}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(quote.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => {
                          if (confirm('Delete this quote?')) {
                            deleteQuoteMutation.mutate(quote.id)
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No quotes received yet</p>
            <p className="text-xs mt-1">Click "Add Quote" to record a subcontractor quote</p>
          </div>
        )}
      </div>
    </div>
  )
}
