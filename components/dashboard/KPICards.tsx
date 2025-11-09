'use client'

import { DollarSign, Target, Activity, Clock, TrendingUp, FileCheck, ListChecks } from 'lucide-react'

interface KPI {
  label: string
  value: string | number
  subtitle: string
  change?: number
  status?: string
  statusColor?: string
}

interface KPICardsProps {
  kpis: KPI[]
}

const iconMap = {
  // Old labels (for backwards compatibility)
  'Total Contract Value': DollarSign,
  'Win Rate': Target,
  'Pipeline Health': Activity,
  'Avg Deal Cycle': Clock,
  'Active Opportunities': TrendingUp,

  // New workflow labels
  'SAM.gov Review Queue': ListChecks,
  'Active Pipeline': Activity,
  'Contract Value': DollarSign,
  'Won Opportunities': FileCheck,
}

const iconColorMap = {
  // Old labels
  'Total Contract Value': 'bg-green-100 text-green-600',
  'Win Rate': 'bg-blue-100 text-blue-600',
  'Pipeline Health': 'bg-yellow-100 text-yellow-600',
  'Avg Deal Cycle': 'bg-purple-100 text-purple-600',
  'Active Opportunities': 'bg-pink-100 text-pink-600',

  // New workflow labels
  'SAM.gov Review Queue': 'bg-orange-100 text-orange-600',
  'Active Pipeline': 'bg-indigo-100 text-indigo-600',
  'Contract Value': 'bg-green-100 text-green-600',
  'Won Opportunities': 'bg-emerald-100 text-emerald-600',
}

export function KPICards({ kpis }: KPICardsProps) {
  if (!kpis || kpis.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = iconMap[kpi.label as keyof typeof iconMap] || TrendingUp
        const iconColor = iconColorMap[kpi.label as keyof typeof iconColorMap] || 'bg-gray-100 text-gray-600'

        return (
          <div
            key={index}
            className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow"
          >
            {/* Header with Icon */}
            <div className="flex items-start justify-between mb-3">
              <div className="text-sm font-medium text-gray-600">
                {kpi.label}
              </div>
              {Icon && (
                <div className={`p-2 rounded-full ${iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Value */}
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {kpi.value}
            </div>

            {/* Subtitle */}
            <div className="text-xs text-gray-500 mb-2">{kpi.subtitle}</div>

            {/* Status/Change */}
            {kpi.change !== undefined && (
              <div className={`text-xs font-medium ${
                kpi.change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {kpi.change > 0 ? '+' : ''}{kpi.change}%
              </div>
            )}

            {kpi.status && (
              <div className={`text-xs font-medium ${
                kpi.statusColor || 'text-gray-600'
              }`}>
                {kpi.status}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
