"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, AlertTriangle, TrendingUp, Users } from "lucide-react"
import { formatCurrency } from "../adapters/dataAdapter"

interface QuickStatsProps {
  data: any
}

export const QuickStats = ({ data }: QuickStatsProps) => {
  if (!data) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const { rawData, kpis } = data

  // Calculate quick stats
  const today = new Date()
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

  const upcomingDeadlines = rawData?.filter((opp: any) => {
    if (!opp.dueDate) return false
    const dueDate = new Date(opp.dueDate)
    return dueDate >= today && dueDate <= thirtyDaysFromNow
  }).length || 0

  const overdueOpportunities = rawData?.filter((opp: any) => {
    if (!opp.dueDate) return false
    const dueDate = new Date(opp.dueDate)
    return dueDate < today
  }).length || 0

  const highValueOpportunities = rawData?.filter((opp: any) => 
    (opp.estimatedValue || 0) > 500000
  ).length || 0

  const highPriorityOpportunities = rawData?.filter((opp: any) => 
    opp.priority === 'HIGH'
  ).length || 0

  const quickStats = [
    {
      title: "Upcoming Deadlines",
      value: upcomingDeadlines,
      description: "Due in next 30 days",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      badge: upcomingDeadlines > 5 ? "High" : upcomingDeadlines > 2 ? "Medium" : "Low",
      badgeColor: upcomingDeadlines > 5 ? "bg-red-100 text-red-800" : upcomingDeadlines > 2 ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
    },
    {
      title: "Overdue Items",
      value: overdueOpportunities,
      description: "Past due date",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      badge: overdueOpportunities > 0 ? "Action Needed" : "All Clear",
      badgeColor: overdueOpportunities > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
    },
    {
      title: "High Value Opps",
      value: highValueOpportunities,
      description: "Over $500K value",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
      badge: `${Math.round((highValueOpportunities / (rawData?.length || 1)) * 100)}%`,
      badgeColor: "bg-green-100 text-green-800"
    },
    {
      title: "High Priority",
      value: highPriorityOpportunities,
      description: "Critical opportunities",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      badge: highPriorityOpportunities > 3 ? "Focus Area" : "Manageable",
      badgeColor: highPriorityOpportunities > 3 ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
    }
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Insights</CardTitle>
          <CardDescription>Key metrics at a glance</CardDescription>
        </CardHeader>
      </Card>

      {quickStats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">
              {stat.title}
            </CardTitle>
            <div className={`${stat.bgColor} p-2 rounded-lg`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stat.description}
                </p>
              </div>
              <Badge className={`${stat.badgeColor} border-0`}>
                {stat.badge}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Pipeline Summary</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(kpis?.totalContractValue || 0)}
            </div>
            <div className="text-sm text-gray-600">
              Across {kpis?.activeOpportunities || 0} active opportunities
            </div>
            <div className="mt-3 flex justify-center">
              <Badge className="bg-blue-100 text-blue-800 border-0">
                {Math.round(kpis?.winRate || 0)}% Win Rate
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}