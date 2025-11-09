'use client'

import { formatCurrency } from '@/lib/utils'

interface AgencyData {
  name: string
  count: number
  value: number
}

interface TopAgenciesProps {
  agencies: AgencyData[]
}

export function TopAgencies({ agencies }: TopAgenciesProps) {
  if (!agencies || agencies.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Top Agencies</h3>
        <p className="text-gray-500 text-sm">No agency data available</p>
      </div>
    )
  }

  const maxValue = Math.max(...agencies.map(a => a.value))

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Top Agencies</h3>
      <div className="space-y-4">
        {agencies.map((agency, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">{agency.name}</span>
              <span className="text-sm font-bold text-primary-600">{formatCurrency(agency.value)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(agency.value / maxValue) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">{agency.count} opps</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
