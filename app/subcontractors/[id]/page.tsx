'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'

export default function SubcontractorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const subcontractorId = params.id as string

  const [subcontractor, setSubcontractor] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    if (subcontractorId) {
      fetchSubcontractor()
    }
  }, [subcontractorId])

  const fetchSubcontractor = async () => {
    try {
      const response = await fetch('/api/subcontractors')
      const data = await response.json()
      const sub = data.find((s: any) => s.id === subcontractorId)
      setSubcontractor(sub)
      setFormData(sub || {})
    } catch (error) {
      console.error('Failed to fetch subcontractor:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/subcontractors/${subcontractorId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updated = await response.json()
        setSubcontractor(updated)
        setIsEditing(false)
        alert('Subcontractor updated successfully!')
      } else {
        alert('Failed to update subcontractor')
      }
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Error saving changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(subcontractor)
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subcontractor...</p>
        </div>
      </div>
    )
  }

  if (!subcontractor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Subcontractor not found</p>
          <button
            onClick={() => router.push('/subcontractors')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Subcontractors
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <button
              onClick={() => router.push('/subcontractors')}
              className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
            >
              ← Back to Subcontractors
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              {isEditing ? 'Edit Subcontractor' : subcontractor.companyName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {subcontractor.contactName || 'No contact name'}
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Edit Details
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Company Information */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Company Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.companyName || ''}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                />
              ) : (
                <p className="text-gray-900">{subcontractor.companyName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                DUNS Number
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.dunsNumber || ''}
                  onChange={(e) => setFormData({ ...formData, dunsNumber: e.target.value })}
                />
              ) : (
                <p className="text-gray-900">{subcontractor.dunsNumber || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CAGE Code
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.cageCode || ''}
                  onChange={(e) => setFormData({ ...formData, cageCode: e.target.value })}
                />
              ) : (
                <p className="text-gray-900">{subcontractor.cageCode || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              {isEditing ? (
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.status || 'Active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="SAM Registered">SAM Registered</option>
                  <option value="Pending SAM">Pending SAM</option>
                </select>
              ) : (
                <p className="text-gray-900">{subcontractor.status}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.contactName || ''}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                />
              ) : (
                <p className="text-gray-900">{subcontractor.contactName || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              ) : (
                <p className="text-gray-900">{subcontractor.email || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              ) : (
                <p className="text-gray-900">{subcontractor.phone || 'N/A'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Capabilities & Performance */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Capabilities & Performance</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialties
              </label>
              {isEditing ? (
                <textarea
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  value={formData.specialties || ''}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  placeholder="Enter specialties, comma-separated"
                />
              ) : (
                <p className="text-gray-900">{subcontractor.specialties || 'N/A'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Performance Rating
              </label>
              {isEditing ? (
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={formData.performanceRating || ''}
                  onChange={(e) => setFormData({ ...formData, performanceRating: parseFloat(e.target.value) || null })}
                >
                  <option value="">No Rating</option>
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              ) : (
                <div className="flex items-center gap-2">
                  {subcontractor.performanceRating ? (
                    <>
                      <span className="text-gray-900">{subcontractor.performanceRating}/5</span>
                      <span className="text-yellow-500">{'★'.repeat(Math.round(subcontractor.performanceRating))}</span>
                    </>
                  ) : (
                    <span className="text-gray-500">Not rated</span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SAM Registered
              </label>
              {isEditing ? (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={formData.samRegistered || false}
                    onChange={(e) => setFormData({ ...formData, samRegistered: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">Yes, registered in SAM.gov</span>
                </label>
              ) : (
                <div className="flex items-center gap-2">
                  {subcontractor.samRegistered ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Yes
                    </span>
                  ) : (
                    <span className="text-gray-500">No</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Record Information */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Record Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created
              </label>
              <p className="text-gray-900">
                {format(new Date(subcontractor.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Updated
              </label>
              <p className="text-gray-900">
                {format(new Date(subcontractor.updatedAt), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <button
              onClick={() => router.push(`/contact-log?subcontractorId=${subcontractorId}`)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              View Contact Log
            </button>
            <button
              onClick={() => window.open(`mailto:${subcontractor.email}`, '_blank')}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              disabled={!subcontractor.email}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
