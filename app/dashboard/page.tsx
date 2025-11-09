'use client'

import { useEffect, useState } from 'react'
import { KPICards } from '@/components/dashboard/KPICards'
import { PipelineFunnel } from '@/components/dashboard/PipelineFunnel'
import { QuickInsights } from '@/components/dashboard/QuickInsights'
import { StageDistribution } from '@/components/dashboard/StageDistribution'
import { TopAgencies } from '@/components/dashboard/TopAgencies'
import { PriorityMix } from '@/components/dashboard/PriorityMix'

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/dashboard')
        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">Failed to load dashboard data</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Comprehensive view of your government contracting pipeline
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        {dashboardData?.kpis && <KPICards kpis={dashboardData.kpis} />}

        {/* Main Grid - Funnel + Quick Insights */}
        <div className="grid grid-cols-12 gap-6">
          {/* Pipeline Funnel - 8 columns */}
          <div className="col-span-12 lg:col-span-8">
            {dashboardData?.pipelineStages && <PipelineFunnel stages={dashboardData.pipelineStages} />}
          </div>

          {/* Quick Insights - 4 columns */}
          <div className="col-span-12 lg:col-span-4">
            {dashboardData?.insights && <QuickInsights insights={dashboardData.insights} />}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-lg border p-6">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">
                {dashboardData.totalOpportunities}
              </div>
              <div className="text-sm text-gray-500">Total Opportunities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                ${(dashboardData.totalPipelineValue / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-gray-500">Total Pipeline Value</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {dashboardData.conversionRate}%
              </div>
              <div className="text-sm text-gray-500">Conversion Rate</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Stage Distribution */}
          <div className="col-span-12 lg:col-span-4">
            <StageDistribution stages={dashboardData.stageDistribution} />
          </div>

          {/* Top Agencies */}
          <div className="col-span-12 lg:col-span-4">
            <TopAgencies agencies={dashboardData.topAgencies} />
          </div>

          {/* Priority Mix */}
          <div className="col-span-12 lg:col-span-4">
            <PriorityMix priorities={dashboardData.priorityMix} />
          </div>
        </div>

        {/* Pipeline Summary */}
        <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-2">Pipeline Summary</h3>
          <div className="text-3xl font-bold text-primary-600">
            ${(dashboardData.activePipelineValue / 1000000).toFixed(1)}M
          </div>
          <p className="text-sm text-gray-600">
            Across {dashboardData.activeOpportunityCount} active opportunities
          </p>
          <p className="text-sm font-medium text-primary-600 mt-2">
            {dashboardData.winRate}% Win Rate
          </p>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <p className="text-sm text-gray-500">Latest updates across your opportunities</p>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
              dashboardData.recentActivities.map((activity: any) => (
                <div key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 text-sm font-medium">
                        {activity.activityType[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>{activity.activityType}</span>
                        <span>•</span>
                        <span>{new Date(activity.activityDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{new Date(activity.activityDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No recent activity to display
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
