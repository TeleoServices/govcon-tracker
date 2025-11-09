'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface TeamManagementProps {
  opportunityId: string
  opportunityTitle: string
}

export default function TeamManagement({ opportunityId, opportunityTitle }: TeamManagementProps) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedRole, setSelectedRole] = useState('Contributor')

  // Fetch team members for this opportunity
  const { data: teamMembers, isLoading: loadingTeam } = useQuery({
    queryKey: ['team-members', opportunityId],
    queryFn: async () => {
      const response = await fetch(`/api/team-members?opportunityId=${opportunityId}`)
      if (!response.ok) throw new Error('Failed to fetch team members')
      return response.json()
    },
    enabled: !!opportunityId,
  })

  // Fetch available users (for demo, using a mock list)
  const availableUsers = [
    { id: 'user-1', name: 'John Smith', email: 'john@teleo.com' },
    { id: 'user-2', name: 'Sarah Johnson', email: 'sarah@teleo.com' },
    { id: 'user-3', name: 'Michael Brown', email: 'michael@teleo.com' },
    { id: 'user-4', name: 'Emily Davis', email: 'emily@teleo.com' },
  ]

  // Add team member mutation
  const addMemberMutation = useMutation({
    mutationFn: async (data: { userId: string; role: string }) => {
      const response = await fetch('/api/team-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId,
          userId: data.userId,
          role: data.role,
        }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add team member')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', opportunityId] })
      setShowForm(false)
      setSelectedUserId('')
      setSelectedRole('Contributor')
    },
    onError: (error: Error) => {
      alert(error.message)
    },
  })

  // Remove team member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (teamMemberId: string) => {
      const response = await fetch(`/api/team-members?id=${teamMemberId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to remove team member')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', opportunityId] })
    },
  })

  const handleAddMember = () => {
    if (!selectedUserId) {
      alert('Please select a user')
      return
    }
    addMemberMutation.mutate({ userId: selectedUserId, role: selectedRole })
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: any = {
      'Lead': 'bg-purple-100 text-purple-800',
      'Contributor': 'bg-blue-100 text-blue-800',
      'Reviewer': 'bg-green-100 text-green-800',
      'Observer': 'bg-gray-100 text-gray-800',
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <p className="text-sm text-gray-500">
            Assign team members to this opportunity
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
        >
          {showForm ? 'Cancel' : '+ Add Member'}
        </button>
      </div>

      {/* Add Member Form */}
      {showForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select User
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Choose a user...</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="Lead">Lead</option>
                <option value="Contributor">Contributor</option>
                <option value="Reviewer">Reviewer</option>
                <option value="Observer">Observer</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleAddMember}
              disabled={addMemberMutation.isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {addMemberMutation.isPending ? 'Adding...' : 'Add to Team'}
            </button>
          </div>
        </div>
      )}

      {/* Team Members List */}
      <div className="space-y-3">
        {loadingTeam ? (
          <div className="text-center py-4 text-gray-500">Loading team members...</div>
        ) : teamMembers && teamMembers.length > 0 ? (
          teamMembers.map((member: any) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
                  {member.user?.name?.[0] || member.user?.email?.[0] || '?'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {member.user?.name || member.user?.email || 'Unknown User'}
                  </div>
                  <div className="text-sm text-gray-500">{member.user?.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(member.role)}`}>
                  {member.role}
                </span>
                <button
                  onClick={() => {
                    if (confirm(`Remove ${member.user?.name || member.user?.email} from this opportunity?`)) {
                      removeMemberMutation.mutate(member.id)
                    }
                  }}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No team members assigned yet</p>
            <p className="text-xs mt-1">Click "Add Member" to assign someone to this opportunity</p>
          </div>
        )}
      </div>
    </div>
  )
}
