'use client'
// Updated with remove contract functionality and create contract form
import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { format } from 'date-fns'

export default function ContractsPage() {
  const [contracts, setContracts] = useState<any[]>([])
  const [filteredContracts, setFilteredContracts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRemoving, setIsRemoving] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [organizationId, setOrganizationId] = useState('')

  useEffect(() => {
    fetchContracts()
    fetchOrganization()
  }, [])

  const fetchOrganization = async () => {
    try {
      const response = await fetch('/api/organization')
      const data = await response.json()
      if (data.id) {
        setOrganizationId(data.id)
      }
    } catch (error) {
      console.error('Failed to fetch organization:', error)
    }
  }

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/contracts')
      const data = await response.json()
      setContracts(data)
    } catch (error) {
      console.error('Failed to fetch contracts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateContract = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const formData = new FormData(e.currentTarget)
      const contractData = {
        contractNumber: formData.get('contractNumber'),
        title: formData.get('title'),
        agencyName: formData.get('agencyName'),
        contractType: formData.get('contractType'),
        status: formData.get('status') || 'Active',
        baseValue: formData.get('baseValue'),
        totalValue: formData.get('totalValue'),
        currentValue: formData.get('currentValue'),
        awardDate: formData.get('awardDate'),
        startDate: formData.get('startDate'),
        endDate: formData.get('endDate'),
        organizationId,
      }

      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create contract')
      }

      alert('Contract created successfully!')
      setShowCreateModal(false)
      fetchContracts()
      e.currentTarget.reset()
    } catch (error: any) {
      console.error('Create contract error:', error)
      alert(error.message || 'Failed to create contract')
    } finally {
      setIsCreating(false)
    }
  }

  // Apply filters
  useEffect(() => {
    let filtered = [...contracts]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(contract =>
        contract.contractNumber?.toLowerCase().includes(term) ||
        contract.title?.toLowerCase().includes(term) ||
        contract.agencyName?.toLowerCase().includes(term)
      )
    }

    if (statusFilter) {
      filtered = filtered.filter(contract => contract.status === statusFilter)
    }

    if (typeFilter) {
      filtered = filtered.filter(contract => contract.contractType === typeFilter)
    }

    setFilteredContracts(filtered)
  }, [searchTerm, statusFilter, typeFilter, contracts])

  const exportToCSV = () => {
    const headers = ['Contract Number', 'Title', 'Agency', 'Type', 'Status', 'Base Value', 'Total Value', 'Start Date', 'End Date']
    const rows = filteredContracts.map(contract => [
      contract.contractNumber,
      contract.title,
      contract.agencyName,
      contract.contractType,
      contract.status,
      contract.baseValue || 0,
      contract.totalValue || 0,
      contract.startDate ? format(new Date(contract.startDate), 'yyyy-MM-dd') : '',
      contract.endDate ? format(new Date(contract.endDate), 'yyyy-MM-dd') : '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contracts_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleRemoveContract = async (contractId: string, contractTitle: string) => {
    if (!confirm(`Are you sure you want to remove "${contractTitle}"? This action cannot be undone.`)) {
      return
    }

    setIsRemoving(contractId)
    try {
      const response = await fetch(`/api/contracts/${contractId}/remove`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove contract')
      }

      alert('Contract removed successfully')
      fetchContracts()
    } catch (error: any) {
      console.error('Remove contract error:', error)
      alert(error.message || 'Failed to remove contract')
    } finally {
      setIsRemoving(null)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      'Active': 'bg-green-100 text-green-800',
      'Completed': 'bg-blue-100 text-blue-800',
      'Terminated': 'bg-red-100 text-red-800',
      'Expired': 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const totalContractValue = filteredContracts.reduce((sum, contract) => sum + (contract.totalValue || 0), 0)
  const uniqueTypes = Array.from(new Set(contracts.map(c => c.contractType).filter(Boolean))).sort()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contracts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Contracts</h1>
            <p className="text-sm text-gray-500">
              Manage active contracts and track performance
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Contract
            </button>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export to CSV
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-6">
            <div className="text-sm text-gray-500 mb-1">Total Contracts</div>
            <div className="text-2xl font-bold text-gray-900">{contracts.length}</div>
            <div className="text-xs text-gray-500 mt-2">All time</div>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <div className="text-sm text-gray-500 mb-1">Total Value</div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalContractValue)}</div>
            <div className="text-xs text-gray-500 mt-2">Combined contract value</div>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <div className="text-sm text-gray-500 mb-1">Active Contracts</div>
            <div className="text-2xl font-bold text-green-600">
              {contracts.filter(c => c.status === 'Active').length}
            </div>
            <div className="text-xs text-gray-500 mt-2">Currently active</div>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <div className="text-sm text-gray-500 mb-1">Completed</div>
            <div className="text-2xl font-bold text-blue-600">
              {contracts.filter(c => c.status === 'Completed').length}
            </div>
            <div className="text-xs text-gray-500 mt-2">Successfully completed</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Search & Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Contract #, title, agency..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Terminated">Terminated</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredContracts.length} of {contracts.length} contracts
            </div>
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setTypeFilter('')
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Contracts List */}
        <div className="space-y-4">
          {filteredContracts.map((contract) => (
            <div key={contract.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{contract.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                      {contract.status}
                    </span>
                    {contract.opportunity && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        From Pipeline
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{contract.contractNumber}</p>
                  <p className="text-sm text-gray-700 mt-1">{contract.agencyName}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Total Value</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatCurrency(contract.totalValue || 0)}
                  </div>
                </div>
              </div>

              {contract.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{contract.description}</p>
              )}

              {/* Source Opportunity Info */}
              {contract.opportunity && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-xs font-medium text-blue-900">Won from Pipeline Opportunity</span>
                  </div>
                  <div className="text-xs text-blue-700">
                    <p><strong>Solicitation:</strong> {contract.opportunity.solicitationNumber}</p>
                    <p><strong>Stage:</strong> {contract.opportunity.stage}</p>
                    {contract.opportunity.wonDate && (
                      <p><strong>Won Date:</strong> {format(new Date(contract.opportunity.wonDate), 'MMM d, yyyy')}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 font-medium">{contract.contractType || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Vendor:</span>
                  <span className="ml-2 font-medium">{contract.vendorName || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500">Start Date:</span>
                  <span className="ml-2 font-medium">
                    {contract.startDate ? format(new Date(contract.startDate), 'MMM d, yyyy') : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">End Date:</span>
                  <span className="ml-2 font-medium">
                    {contract.endDate ? format(new Date(contract.endDate), 'MMM d, yyyy') : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = `/contracts/${contract.id}`}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Details
                </button>

                {contract.opportunity && (
                  <button
                    onClick={() => window.location.href = `/opportunities/${contract.opportunityId}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    View Source Opportunity
                  </button>
                )}

                <button
                  onClick={() => handleRemoveContract(contract.id, contract.title)}
                  disabled={isRemoving === contract.id}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {isRemoving === contract.id ? 'Removing...' : 'Remove Contract'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredContracts.length === 0 && (
          <div className="bg-white rounded-lg border p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 mb-2">No contracts found</p>
            <p className="text-sm text-gray-400">Win opportunities from your pipeline to create contracts or add one manually</p>
          </div>
        )}
      </div>

      {/* Create Contract Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Create New Contract</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="contractNumber"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g., CONTRACT-2025-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="contractType"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Type</option>
                      <option value="FFP">Firm Fixed Price (FFP)</option>
                      <option value="T&M">Time & Materials (T&M)</option>
                      <option value="Cost-Plus">Cost Plus</option>
                      <option value="IDIQ">IDIQ</option>
                      <option value="BPA">Blanket Purchase Agreement (BPA)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Contract title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agency Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="agencyName"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., DEPT OF DEFENSE"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Terminated">Terminated</option>
                  </select>
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Financial Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Value <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="baseValue"
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Value <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="totalValue"
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Value <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="currentValue"
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Dates</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Award Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="awardDate"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
