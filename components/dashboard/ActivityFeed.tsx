'use client'

import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'

export default function ActivityFeed() {
  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ['activities', 'recent'],
    queryFn: async () => {
      const response = await fetch('/api/activities?limit=10')
      if (!response.ok) throw new Error('Failed to fetch activities')
      return response.json()
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const activities = activitiesData?.activities || []

  const getActivityIcon = (activityType: string) => {
    const icons: any = {
      'Created': '➕',
      'Updated': '✏️',
      'Status Change': '🔄',
      'Stage Change': '📊',
      'Assigned': '👤',
      'Removed': '➖',
      'Contact': '📞',
      'Modified': '🔧',
      'Completed': '✅',
      'Uploaded': '📎',
    }
    return icons[activityType] || '📌'
  }

  const getActivityColor = (activityType: string) => {
    const colors: any = {
      'Created': 'text-green-600',
      'Updated': 'text-blue-600',
      'Status Change': 'text-purple-600',
      'Stage Change': 'text-indigo-600',
      'Assigned': 'text-cyan-600',
      'Removed': 'text-red-600',
      'Contact': 'text-yellow-600',
      'Modified': 'text-orange-600',
      'Completed': 'text-green-600',
      'Uploaded': 'text-gray-600',
    }
    return colors[activityType] || 'text-gray-600'
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        <span className="text-sm text-gray-500">{activities.length} recent items</span>
      </div>

      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity: any) => (
            <div key={activity.id} className="flex gap-3 pb-4 border-b last:border-b-0 last:pb-0">
              <div className={`text-2xl ${getActivityColor(activity.activityType)}`}>
                {getActivityIcon(activity.activityType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 mb-1">
                  {activity.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {activity.user && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      {activity.user.name || activity.user.email}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {formatDistanceToNow(new Date(activity.activityDate), { addSuffix: true })}
                  </span>
                  {activity.entityType && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                      {activity.entityType}
                    </span>
                  )}
                </div>
                {(activity.opportunity || activity.contract || activity.subcontractor) && (
                  <div className="mt-2 text-xs text-gray-600">
                    {activity.opportunity && (
                      <span className="flex items-center gap-1">
                        📋 {activity.opportunity.title}
                      </span>
                    )}
                    {activity.contract && (
                      <span className="flex items-center gap-1">
                        📄 {activity.contract.contractNumber} - {activity.contract.title}
                      </span>
                    )}
                    {activity.subcontractor && (
                      <span className="flex items-center gap-1">
                        🏢 {activity.subcontractor.companyName}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No recent activity</p>
            <p className="text-xs mt-1">Activities will appear here as you work</p>
          </div>
        )}
      </div>

      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <a
            href="/activities"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all activity →
          </a>
        </div>
      )}
    </div>
  )
}
