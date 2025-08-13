"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, PieChart, TrendingUp } from "lucide-react"
import { getStageDisplayName, formatCurrency } from "../adapters/dataAdapter"

interface ChartsRowProps {
  data: any
}

export const ChartsRow = ({ data }: ChartsRowProps) => {
  if (!data) {
    return (
      <>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-40 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </>
    )
  }

  const { rawData, pipeline, kpis } = data

  // Group opportunities by agency
  const agencyData = rawData?.reduce((acc: any, opp: any) => {
    const agency = opp.agency || 'Unknown'
    if (!acc[agency]) {
      acc[agency] = { count: 0, value: 0 }
    }
    acc[agency].count += 1
    acc[agency].value += opp.estimatedValue || 0
    return acc
  }, {}) || {}

  const topAgencies = Object.entries(agencyData)
    .sort(([,a]: any, [,b]: any) => b.value - a.value)
    .slice(0, 5)

  // Group by priority
  const priorityData = rawData?.reduce((acc: any, opp: any) => {
    const priority = opp.priority || 'MEDIUM'
    if (!acc[priority]) {
      acc[priority] = { count: 0, value: 0 }
    }
    acc[priority].count += 1
    acc[priority].value += opp.estimatedValue || 0
    return acc
  }, {}) || {}

  // Monthly trend (simplified - group by creation month)
  const monthlyData = rawData?.reduce((acc: any, opp: any) => {
    const month = new Date(opp.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    if (!acc[month]) {
      acc[month] = { count: 0, value: 0 }
    }
    acc[month].count += 1
    acc[month].value += opp.estimatedValue || 0
    return acc
  }, {}) || {}

  const recentMonths = Object.entries(monthlyData)
    .slice(-6) // Last 6 months

  return (
    <>
      {/* Stage Distribution Chart */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-600" />
            Stage Distribution
          </CardTitle>
          <CardDescription>Opportunities by capture stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pipeline?.map((stage: any, index: number) => {
              const total = pipeline.reduce((sum: number, s: any) => sum + s.count, 0)
              const percentage = total > 0 ? (stage.count / total) * 100 : 0
              
              const colors = [
                "bg-blue-500",
                "bg-indigo-500", 
                "bg-purple-500",
                "bg-pink-500",
                "bg-red-500",
                "bg-green-500"
              ]

              return (
                <div key={stage.stage} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-3 h-3 rounded-full ${colors[index] || 'bg-gray-400'}`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      {getStageDisplayName(stage.stage)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${colors[index] || 'bg-gray-400'}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <Badge variant="outline" className="text-xs min-w-[3rem] justify-center">
                      {stage.count}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Agencies Chart */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            Top Agencies
          </CardTitle>
          <CardDescription>By total opportunity value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topAgencies.map(([agency, data]: any, index: number) => {
              const maxValue = Math.max(...topAgencies.map(([,d]: any) => d.value))
              const percentage = maxValue > 0 ? (data.value / maxValue) * 100 : 0

              return (
                <div key={agency} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {agency.length > 20 ? `${agency.substring(0, 20)}...` : agency}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{data.count} opps</span>
                      <Badge variant="outline" className="text-xs">
                        {formatCurrency(data.value)}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Trends Chart */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Priority Mix
          </CardTitle>
          <CardDescription>Opportunities by priority level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(priorityData).map(([priority, data]: any) => {
              const total = Object.values(priorityData).reduce((sum: any, d: any) => sum + d.count, 0) as number
              const percentage = total > 0 ? (data.count / total) * 100 : 0
              
              const priorityColors: any = {
                'HIGH': 'bg-red-500',
                'MEDIUM': 'bg-yellow-500',
                'LOW': 'bg-green-500'
              }

              const priorityBadgeColors: any = {
                'HIGH': 'bg-red-100 text-red-800',
                'MEDIUM': 'bg-yellow-100 text-yellow-800',
                'LOW': 'bg-green-100 text-green-800'
              }

              return (
                <div key={priority} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${priorityColors[priority] || 'bg-gray-400'}`}></div>
                      <span className="text-sm font-medium text-gray-700">
                        {priority} Priority
                      </span>
                    </div>
                    <Badge className={`${priorityBadgeColors[priority] || 'bg-gray-100 text-gray-800'} border-0 text-xs`}>
                      {data.count} opps
                    </Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${priorityColors[priority] || 'bg-gray-400'}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">
                      {formatCurrency(data.value)} total value
                    </span>
                  </div>
                </div>
              )
            })}

            {/* Summary */}
            <div className="pt-4 border-t">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">
                  Total Active Pipeline
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(kpis?.totalContractValue || 0)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}