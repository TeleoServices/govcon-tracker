'use client'

import { useEffect, useState } from 'react'

export default function SubcontractorsPage() {
  const [subcontractors, setSubcontractors] = useState<any[]>([])
  const [filteredSubcontractors, setFilteredSubcontractors] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [samRegisteredFilter, setSamRegisteredFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newSubcontractor, setNewSubcontractor] = useState({
    companyName: '',
    dunsNumber: '',
    cageCode: '',
    contactName: '',
    email: '',
    phone: '',
    specialties: '',
    performanceRating: null as number | null,
    status: 'Active',
    samRegistered: false,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/subcontractors')
        const data = await response.json()
        setSubcontractors(data)
        setFilteredSubcontractors(data)
      } catch (error) {
        console.error('Failed to fetch subcontractors:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...subcontractors]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.contactName && sub.contactName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.email && sub.email.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(sub => sub.status === statusFilter)
    }

    // SAM registered filter
    if (samRegisteredFilter !== '') {
      filtered = filtered.filter(sub => sub.samRegistered === (samRegisteredFilter === 'true'))
    }

    setFilteredSubcontractors(filtered)
  }, [searchTerm, statusFilter, samRegisteredFilter, subcontractors])

  const exportToCSV = () => {
    const headers = ['Company Name', 'Contact Name', 'Email', 'Phone', 'CAGE Code', 'Status', 'SAM Registered', 'Rating']
    const rows = filteredSubcontractors.map(sub => [
      sub.companyName,
      sub.contactName || '',
      sub.email || '',
      sub.phone || '',
      sub.cageCode || '',
      sub.status,
      sub.samRegistered ? 'Yes' : 'No',
      sub.performanceRating || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subcontractors_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleCreate = async () => {
    if (!newSubcontractor.companyName) {
      alert('Company name is required')
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/subcontractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubcontractor),
      })

      if (response.ok) {
        const created = await response.json()
        setSubcontractors([...subcontractors, created])
        setShowModal(false)
        setNewSubcontractor({
          companyName: '',
          dunsNumber: '',
          cageCode: '',
          contactName: '',
          email: '',
          phone: '',
          specialties: '',
          performanceRating: null,
          status: 'Active',
          samRegistered: false,
        })
        alert('Subcontractor created successfully!')
      } else {
        alert('Failed to create subcontractor')
      }
    } catch (error) {
      console.error('Failed to create:', error)
      alert('Error creating subcontractor')
    } finally {
      setIsSaving(false)
    }
  }

  const uniqueStatuses = Array.from(new Set(subcontractors.map(sub => sub.status))).sort()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subcontractors...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Subcontractors</h1>
            <p className="text-sm text-gray-500">
              Manage your subcontractor network
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New
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
                placeholder="Company name, contact, email..."
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
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SAM Registered
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={samRegisteredFilter}
                onChange={(e) => setSamRegisteredFilter(e.target.value)}
              >
                <option value="">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredSubcontractors.length} of {subcontractors.length} subcontractors
            </div>
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('')
                setSamRegisteredFilter('')
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Subcontractors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubcontractors.map((sub) => (
            <div key={sub.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{sub.companyName}</h3>
                  <p className="text-sm text-gray-500">{sub.contactName}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  sub.samRegistered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {sub.status}
                </span>
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">CAGE Code:</span>
                  <span className="font-medium">{sub.cageCode || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email:</span>
                  <span className="font-medium text-xs truncate max-w-[150px]">{sub.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span className="font-medium">{sub.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Rating:</span>
                  <span className="font-medium">
                    {sub.performanceRating ? (
                      <span className="flex items-center gap-1">
                        {sub.performanceRating}/5
                        <span className="text-yellow-500">{'★'.repeat(Math.round(sub.performanceRating))}</span>
                      </span>
                    ) : 'N/A'}
                  </span>
                </div>
                {sub.samRegistered && (
                  <div className="pt-2 border-t">
                    <span className="flex items-center gap-1 text-green-600">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      SAM Registered
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = `/subcontractors/${sub.id}`}
                  className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                  View Details
                </button>
                <button
                  onClick={() => window.location.href = `/contact-log?subcontractorId=${sub.id}`}
                  className="px-3 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                  title="Contact Log"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredSubcontractors.length === 0 && (
          <div className="bg-white rounded-lg border p-12 text-center">
            <p className="text-gray-500">No subcontractors found matching your filters</p>
          </div>
        )}
      </div>

      {/* Add New Subcontractor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Add New Subcontractor</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Company Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Company Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newSubcontractor.companyName}
                      onChange={(e) => setNewSubcontractor({ ...newSubcontractor, companyName: e.target.value })}
                      placeholder="Enter company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DUNS Number
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newSubcontractor.dunsNumber}
                      onChange={(e) => setNewSubcontractor({ ...newSubcontractor, dunsNumber: e.target.value })}
                      placeholder="123456789"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CAGE Code
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newSubcontractor.cageCode}
                      onChange={(e) => setNewSubcontractor({ ...newSubcontractor, cageCode: e.target.value })}
                      placeholder="1ABC2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newSubcontractor.status}
                      onChange={(e) => setNewSubcontractor({ ...newSubcontractor, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="SAM Registered">SAM Registered</option>
                      <option value="Pending SAM">Pending SAM</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        checked={newSubcontractor.samRegistered}
                        onChange={(e) => setNewSubcontractor({ ...newSubcontractor, samRegistered: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-gray-700">SAM Registered</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newSubcontractor.contactName}
                      onChange={(e) => setNewSubcontractor({ ...newSubcontractor, contactName: e.target.value })}
                      placeholder="John Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newSubcontractor.email}
                      onChange={(e) => setNewSubcontractor({ ...newSubcontractor, email: e.target.value })}
                      placeholder="john@company.com"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newSubcontractor.phone}
                      onChange={(e) => setNewSubcontractor({ ...newSubcontractor, phone: e.target.value })}
                      placeholder="555-0100"
                    />
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Capabilities</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specialties
                    </label>
                    <textarea
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={3}
                      value={newSubcontractor.specialties}
                      onChange={(e) => setNewSubcontractor({ ...newSubcontractor, specialties: e.target.value })}
                      placeholder="Enter specialties, comma-separated"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Performance Rating
                    </label>
                    <select
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={newSubcontractor.performanceRating || ''}
                      onChange={(e) => setNewSubcontractor({ ...newSubcontractor, performanceRating: e.target.value ? parseFloat(e.target.value) : null })}
                    >
                      <option value="">No Rating</option>
                      <option value="1">1 Star</option>
                      <option value="2">2 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="5">5 Stars</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false)
                  setNewSubcontractor({
                    companyName: '',
                    dunsNumber: '',
                    cageCode: '',
                    contactName: '',
                    email: '',
                    phone: '',
                    specialties: '',
                    performanceRating: null,
                    status: 'Active',
                    samRegistered: false,
                  })
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? 'Creating...' : 'Create Subcontractor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
