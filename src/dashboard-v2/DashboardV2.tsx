"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useOpportunities } from "@/hooks/use-data"
import { KPICards } from "./components/KPICards"
import { PipelineFunnel } from "./components/PipelineFunnel"
import { QuickStats } from "./components/QuickStats"
import { ChartsRow } from "./components/ChartsRow"
import { EnhancedOpportunitiesTable } from "./components/EnhancedOpportunitiesTable"
import { transformOpportunityData } from "./adapters/dataAdapter"

const DashboardV2 = () => {
  const { opportunities, loading, error } = useOpportunities()
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    if (opportunities.length > 0) {
      const transformedData = transformOpportunityData(opportunities)
      setDashboardData(transformedData)
    }
  }, [opportunities])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Comprehensive view of your government contracting pipeline
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <KPICards data={dashboardData} />
      </div>
      
      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Pipeline Funnel (8 cols) */}
        <div className="lg:col-span-8">
          <PipelineFunnel data={dashboardData?.pipeline} />
        </div>
        
        {/* Quick Stats (4 cols) */}
        <div className="lg:col-span-4">
          <QuickStats data={dashboardData} />
        </div>
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ChartsRow data={dashboardData} />
      </div>
      
      {/* Opportunities Table */}
      <div className="mt-6">
        <EnhancedOpportunitiesTable 
          opportunities={opportunities}
          data={dashboardData}
        />
      </div>
    </div>
  )
}

export default DashboardV2