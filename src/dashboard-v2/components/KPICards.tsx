"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Activity, Clock, Target } from "lucide-react"
import { formatCurrency, formatPercentage } from "../adapters/dataAdapter"

interface KPICardsProps {
  data: any
}

export const KPICards = ({ data }: KPICardsProps) => {
  if (!data?.kpis) {
    return (
      <div className="col-span-5 grid grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const { kpis } = data

  const kpiCards = [
    {
      title: "Total Contract Value",
      value: formatCurrency(kpis.totalContractValue),
      description: "Sum of all opportunity values",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      trend: "+12.5%"
    },
    {
      title: "Win Rate",
      value: formatPercentage(kpis.winRate),
      description: "Won / (Won + Lost)",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: kpis.winRate > 50 ? "Good" : "Needs Improvement"
    },
    {
      title: "Pipeline Health",
      value: formatPercentage(kpis.pipelineHealth),
      description: "Weighted opportunity value",
      icon: Activity,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      trend: kpis.pipelineHealth > 60 ? "Strong" : "Moderate"
    },
    {
      title: "Avg Deal Cycle",
      value: `${Math.round(kpis.avgDealCycle)} days`,
      description: "Average time to close",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      trend: kpis.avgDealCycle < 90 ? "Fast" : "Slow"
    },
    {
      title: "Active Opportunities",
      value: kpis.activeOpportunities.toString(),
      description: "Non-closed opportunities",
      icon: TrendingUp,
      color: "text-red-600",
      bgColor: "bg-red-100",
      trend: `${kpis.activeOpportunities} active`
    }
  ]

  return (
    <>
      {kpiCards.map((kpi, index) => (
        <Card 
          key={index} 
          className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {kpi.title}
            </CardTitle>
            <div className={`${kpi.bgColor} p-2 rounded-lg`}>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {kpi.value}
            </div>
            <p className="text-xs text-gray-500 mb-2">
              {kpi.description}
            </p>
            <div className={`text-xs font-medium ${
              kpi.trend.includes('+') || kpi.trend === 'Good' || kpi.trend === 'Strong' || kpi.trend === 'Fast'
                ? 'text-green-600' 
                : kpi.trend === 'Moderate' || kpi.trend === 'Needs Improvement' || kpi.trend === 'Slow'
                ? 'text-amber-600'
                : 'text-gray-600'
            }`}>
              {kpi.trend}
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}