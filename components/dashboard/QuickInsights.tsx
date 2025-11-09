'use client'

import { Calendar, AlertCircle, TrendingUp } from 'lucide-react'

interface Insight {
  title: string
  value: number
  subtitle: string
  status: string
  statusColor: string
  icon: 'calendar' | 'alert' | 'trending'
  iconColor: string
}

interface QuickInsightsProps {
  insights: Insight[]
}

const iconMap = {
  calendar: Calendar,
  alert: AlertCircle,
  trending: TrendingUp,
}

export function QuickInsights({ insights }: QuickInsightsProps) {
  if (!insights || insights.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-primary-500"></div>
          <h2 className="text-lg font-semibold">Quick Insights</h2>
        </div>
        <p className="text-sm text-gray-500">No insights available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-primary-500"></div>
        <h2 className="text-lg font-semibold">Quick Insights</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Critical metrics requiring attention
      </p>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = iconMap[insight.icon]

          return (
            <div
              key={index}
              className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${insight.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-600 mb-1">
                    {insight.title}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {insight.value}
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {insight.subtitle}
                  </div>
                  <div className={`inline-block text-xs font-medium px-2 py-1 rounded ${insight.statusColor}`}>
                    {insight.status}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
