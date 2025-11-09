'use client'

interface StageData {
  name: string
  count: number
  color: string
}

interface StageDistributionProps {
  stages: StageData[]
}

export function StageDistribution({ stages }: StageDistributionProps) {
  if (!stages || stages.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Stage Distribution</h3>
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    )
  }

  const maxCount = Math.max(...stages.map(s => s.count))

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold mb-4">Stage Distribution</h3>
      <div className="space-y-3">
        {stages.map((stage, index) => (
          <div key={index}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-600">{stage.name}</span>
              <span className="text-sm font-bold text-gray-900">{stage.count}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${(stage.count / maxCount) * 100}%`,
                  backgroundColor: stage.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
