"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStageDisplayName, formatCurrency } from "../adapters/dataAdapter"
import { OpportunityStage } from "@/types"

interface PipelineFunnelProps {
  data: any[]
}

export const PipelineFunnel = ({ data }: PipelineFunnelProps) => {
  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Pipeline Funnel</CardTitle>
          <CardDescription>Opportunity progression through stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Define the funnel widths based on stage progression
  const stageWidths = {
    [OpportunityStage.IDENTIFIED]: 100,
    [OpportunityStage.PURSUIT]: 85,
    [OpportunityStage.CAPTURE]: 70,
    [OpportunityStage.PROPOSAL_DEVELOPMENT]: 55,
    [OpportunityStage.SUBMITTED]: 40,
    [OpportunityStage.AWARDED]: 25,
    [OpportunityStage.LOST]: 25,
  }

  // Color scheme for stages
  const stageColors = {
    [OpportunityStage.IDENTIFIED]: "bg-blue-500",
    [OpportunityStage.PURSUIT]: "bg-indigo-500",
    [OpportunityStage.CAPTURE]: "bg-purple-500",
    [OpportunityStage.PROPOSAL_DEVELOPMENT]: "bg-pink-500",
    [OpportunityStage.SUBMITTED]: "bg-red-500",
    [OpportunityStage.AWARDED]: "bg-green-500",
    [OpportunityStage.LOST]: "bg-gray-500",
  }

  const textColors = {
    [OpportunityStage.IDENTIFIED]: "text-blue-700",
    [OpportunityStage.PURSUIT]: "text-indigo-700",
    [OpportunityStage.CAPTURE]: "text-purple-700",
    [OpportunityStage.PROPOSAL_DEVELOPMENT]: "text-pink-700",
    [OpportunityStage.SUBMITTED]: "text-red-700",
    [OpportunityStage.AWARDED]: "text-green-700",
    [OpportunityStage.LOST]: "text-gray-700",
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
          Pipeline Funnel
        </CardTitle>
        <CardDescription>
          Opportunity progression through capture stages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 py-4">
          {data.map((stage, index) => {
            const width = stageWidths[stage.stage as OpportunityStage] || 50
            const color = stageColors[stage.stage as OpportunityStage] || "bg-gray-500"
            const textColor = textColors[stage.stage as OpportunityStage] || "text-gray-700"
            
            return (
              <div key={stage.stage} className="relative">
                {/* Stage Bar */}
                <div 
                  className={`${color} text-white rounded-lg p-4 transition-all duration-300 hover:shadow-lg cursor-pointer hover:scale-105 mx-auto`}
                  style={{ width: `${width}%` }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {getStageDisplayName(stage.stage)}
                      </h3>
                      <p className="text-sm opacity-90">
                        {stage.count} opportunities
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatCurrency(stage.value)}
                      </p>
                      <p className="text-xs opacity-75">
                        Total Value
                      </p>
                    </div>
                  </div>
                </div>

                {/* Connecting Line */}
                {index < data.length - 1 && (
                  <div className="flex justify-center my-2">
                    <div className="w-0.5 h-4 bg-gray-300"></div>
                  </div>
                )}

                {/* Stage Details */}
                <div className="text-center mt-2">
                  <span className={`text-xs font-medium ${textColor}`}>
                    {stage.count > 0 && (
                      <>Avg: {formatCurrency(stage.value / stage.count)} per opp</>
                    )}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Funnel Summary */}
        <div className="mt-6 pt-4 border-t bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {data.reduce((sum, stage) => sum + stage.count, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Opportunities</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(data.reduce((sum, stage) => sum + stage.value, 0))}
              </p>
              <p className="text-sm text-gray-600">Total Pipeline Value</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {data.length > 0 ? Math.round((data[data.length - 1]?.count || 0) / (data[0]?.count || 1) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600">Conversion Rate</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}