'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Disable static generation for this page
export const dynamic = 'force-dynamic'

export default function ContactLogPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [formData, setFormData] = useState({
    contactType: 'Email',
    description: '',
    status: 'Completed',
    subcontractorId: '',
    opportunityId: '',
  })

  // Fetch contact logs
  const { data: contacts, isLoading } = useQuery({
    queryKey: ['contact-log'],
    queryFn: async () => {
      const response = await fetch('/api/contact-log')
      if (!response.ok) throw new Error('Failed to fetch contacts')
      return response.json()
    },
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

  // Fetch opportunities for dropdown
  const { data: opportunities } = useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const response = await fetch('/api/opportunities')
      if (!response.ok) throw new Error('Failed to fetch opportunities')
      return response.json()
    },
  })

  // Create contact mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/contact-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create contact')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-log'] })
      setShowForm(false)
      setFormData({
        contactType: 'Email',
        description: '',
        status: 'Completed',
        subcontractorId: '',
        opportunityId: '',
      })
    },
  })

  // Delete contact mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/contact-log/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete contact')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-log'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  // Filter contacts
  const filteredContacts = contacts?.filter((contact: any) => {
    if (filterType && contact.metadata) {
      const metadata = JSON.parse(contact.metadata)
      if (metadata.contactType !== filterType) return false
    }
    if (filterStatus && contact.metadata) {
      const metadata = JSON.parse(contact.metadata)
      if (metadata.status !== filterStatus) return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Contact Log</h1>
            <p className="text-sm text-gray-500">
              Track communications and interactions
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {showForm ? 'Cancel' : 'Log New Contact'}
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* New Contact Form */}
        {showForm && (
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Log New Contact</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Type
                  </label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.contactType}
                    onChange={(e) => setFormData({ ...formData, contactType: e.target.value })}
                  >
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Video Call">Video Call</option>
                  </select>
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
                    <option value="Completed">Completed</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Follow-up Required">Follow-up Required</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcontractor (Optional)
                  </label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.subcontractorId}
                    onChange={(e) => setFormData({ ...formData, subcontractorId: e.target.value })}
                  >
                    <option value="">None</option>
                    {subcontractors?.map((sub: any) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opportunity (Optional)
                  </label>
                  <select
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.opportunityId}
                    onChange={(e) => setFormData({ ...formData, opportunityId: e.target.value })}
                  >
                    <option value="">None</option>
                    {opportunities?.map((opp: any) => (
                      <option key={opp.id} value={opp.id}>
                        {opp.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Describe the contact interaction..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Type
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Email">Email</option>
                <option value="Phone">Phone</option>
                <option value="Meeting">Meeting</option>
                <option value="Video Call">Video Call</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Follow-up Required">Follow-up Required</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact List */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Contact History</h2>
            <p className="text-sm text-gray-500">
              {filteredContacts?.length || 0} contacts logged
            </p>
          </div>

          <div className="divide-y">
            {isLoading ? (
              <div className="p-12 text-center text-gray-500">Loading contacts...</div>
            ) : filteredContacts && filteredContacts.length > 0 ? (
              filteredContacts.map((contact: any) => {
                const metadata = contact.metadata ? JSON.parse(contact.metadata) : {}
                return (
                  <div key={contact.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                            {metadata.contactType || 'Contact'}
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {metadata.status || 'Unknown'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(contact.activityDate).toLocaleDateString()} at{' '}
                            {new Date(contact.activityDate).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-900 mb-2">{contact.description}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          {contact.user && (
                            <span>By: {contact.user.name || contact.user.email}</span>
                          )}
                          {contact.subcontractor && (
                            <span>Subcontractor: {contact.subcontractor.companyName}</span>
                          )}
                          {contact.opportunity && (
                            <span>Opportunity: {contact.opportunity.title}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Delete this contact log?')) {
                            deleteMutation.mutate(contact.id)
                          }
                        }}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="p-12 text-center text-gray-500">
                No contacts logged yet. Click "Log New Contact" to get started.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
