'use client'

interface PriorityData {
  name: string
  count: number
  percentage: number
  color: string
}

interface PriorityMixProps {
  priorities: PriorityData[]
}

export function PriorityMix({ priorities }: PriorityMixProps) {
  if (!priorities || priorities.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Priority Mix</h3>
        <p className="text-gray-500 text-sm">No priority data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Priority Mix</h3>
      <div className="space-y-3">
        {priorities.map((priority, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-600">{priority.name}</span>
              <span className="text-sm font-bold text-gray-900">
                {priority.count} ({Math.round(priority.percentage)}%)
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${priority.percentage}%`,
                  backgroundColor: priority.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
