'use client'

import { formatCurrency } from '@/lib/utils'

interface PipelineStage {
  name: string
  count: number
  value: number
  width: number
  color: string
}

interface PipelineFunnelProps {
  stages: PipelineStage[]
}

export function PipelineFunnel({ stages }: PipelineFunnelProps) {
  if (!stages || stages.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-primary-500"></div>
          <h2 className="text-lg font-semibold">Pipeline Funnel</h2>
        </div>
        <p className="text-sm text-gray-500">No pipeline data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-primary-500"></div>
        <h2 className="text-lg font-semibold">Pipeline Funnel</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Opportunity progression through capture stages
      </p>

      <div className="space-y-3">
        {stages.map((stage, index) => {
          const avgValue = stage.count > 0 ? stage.value / stage.count : 0

          return (
            <div key={index} className="relative">
              {/* Funnel Bar */}
              <div
                className="rounded-lg py-4 px-6 transition-all hover:shadow-md cursor-pointer"
                style={{
                  backgroundColor: stage.color,
                  width: `${stage.width}%`,
                  marginLeft: `${(100 - stage.width) / 2}%`,
                }}
              >
                <div className="flex items-center justify-between text-white">
                  <div>
                    <div className="font-semibold">{stage.name}</div>
                    <div className="text-sm opacity-90">
                      {stage.count} opportunities
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {formatCurrency(stage.value)}
                    </div>
                    <div className="text-sm opacity-90">Total Value</div>
                  </div>
                </div>
              </div>

              {/* Average indicator */}
              {stage.count > 0 && (
                <div className="text-center mt-1">
                  <span className="text-xs text-gray-500">
                    Avg: {formatCurrency(avgValue)} per opp
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
