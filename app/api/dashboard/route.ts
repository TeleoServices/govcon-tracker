import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get SAM.gov opportunities (review queue)
    const samGovOpportunities = await prisma.samGovOpportunity.findMany()
    const samGovNotAdded = samGovOpportunities.filter(o => !o.addedToPipeline)
    const samGovAdded = samGovOpportunities.filter(o => o.addedToPipeline)

    // Get pipeline opportunities (only Active status)
    // organizationId is now required in schema, so no need to filter for it
    const pipelineOpportunities = await prisma.opportunity.findMany({
      where: {
        status: 'Active',
      },
    })

    // Get won and lost opportunities
    const wonOpportunities = await prisma.opportunity.findMany({
      where: { status: 'Won' },
    })

    const lostOpportunities = await prisma.opportunity.findMany({
      where: { status: 'Lost' },
    })

    // Get contracts
    const contracts = await prisma.contract.findMany({
      where: { status: 'Active' },
    })

    // Calculate metrics
    const totalPipelineValue = pipelineOpportunities.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0)
    const wonValue = wonOpportunities.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0)
    const totalContractValue = contracts.reduce((sum, c) => sum + (c.totalValue || 0), 0)

    const totalDecided = wonOpportunities.length + lostOpportunities.length
    const winRate = totalDecided > 0 ? (wonOpportunities.length / totalDecided) * 100 : 0

    // Pipeline stages (only Active opportunities)
    const stages = ['Identified', 'Pursuit', 'Capture', 'Proposal Dev', 'Submitted']
    const stageData = stages.map((stage, index) => {
      const stageOpps = pipelineOpportunities.filter(o => o.stage === stage)
      const value = stageOpps.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0)
      const widths = [100, 85, 70, 55, 40]
      const colors = ['#6366F1', '#5B5FE8', '#A855F7', '#EC4899', '#EF4444']

      return {
        name: stage,
        count: stageOpps.length,
        value,
        width: widths[index],
        color: colors[index],
      }
    })

    // KPI Cards data
    const kpis = [
      {
        label: 'SAM.gov Review Queue',
        value: samGovNotAdded.length,
        subtitle: 'Opportunities awaiting review',
        status: samGovNotAdded.length > 0 ? 'Action Needed' : 'All Clear',
        statusColor: samGovNotAdded.length > 0 ? 'text-orange-600' : 'text-green-600',
      },
      {
        label: 'Active Pipeline',
        value: pipelineOpportunities.length,
        subtitle: `$${(totalPipelineValue / 1000000).toFixed(1)}M total value`,
        status: `${pipelineOpportunities.length} active`,
        statusColor: 'text-blue-600',
      },
      {
        label: 'Win Rate',
        value: `${winRate.toFixed(1)}%`,
        subtitle: `${wonOpportunities.length} won / ${totalDecided} decided`,
        status: winRate > 30 ? 'Good' : 'Needs Improvement',
        statusColor: winRate > 30 ? 'text-green-600' : 'text-orange-600',
      },
      {
        label: 'Contract Value',
        value: `$${(totalContractValue / 1000000).toFixed(1)}M`,
        subtitle: `${contracts.length} active contracts`,
        status: 'Active',
        statusColor: 'text-green-600',
      },
      {
        label: 'Won Opportunities',
        value: wonOpportunities.length,
        subtitle: `$${(wonValue / 1000000).toFixed(1)}M total value`,
        status: `${wonOpportunities.length} won`,
        statusColor: 'text-emerald-600',
      },
    ]

    // Quick Insights
    const today = new Date()
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    const upcomingDeadlines = pipelineOpportunities.filter(o => {
      if (!o.responseDeadline) return false
      const deadline = new Date(o.responseDeadline)
      return deadline >= today && deadline <= next30Days
    })

    const overdueItems = pipelineOpportunities.filter(o => {
      if (!o.responseDeadline) return false
      return new Date(o.responseDeadline) < today
    })

    const highValueOpps = pipelineOpportunities.filter(o => (o.estimatedValue || 0) > 500000)

    const insights = [
      {
        title: 'Upcoming Deadlines',
        value: upcomingDeadlines.length,
        subtitle: 'Due in next 30 days',
        status: upcomingDeadlines.length > 0 ? 'Monitor' : 'None',
        statusColor: upcomingDeadlines.length > 5 ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700',
        icon: 'calendar' as const,
        iconColor: upcomingDeadlines.length > 5 ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600',
      },
      {
        title: 'Overdue Items',
        value: overdueItems.length,
        subtitle: 'Past due date',
        status: overdueItems.length > 0 ? 'Action Needed' : 'None',
        statusColor: overdueItems.length > 0 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700',
        icon: 'alert' as const,
        iconColor: overdueItems.length > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600',
      },
      {
        title: 'High Value Opps',
        value: highValueOpps.length,
        subtitle: 'Over $500K value',
        status: pipelineOpportunities.length > 0
          ? `${((highValueOpps.length / pipelineOpportunities.length) * 100).toFixed(0)}%`
          : '0%',
        statusColor: 'bg-green-50 text-green-700',
        icon: 'trending' as const,
        iconColor: 'bg-green-100 text-green-600',
      },
    ]

    // Stage Distribution (only Active pipeline)
    const stageDistribution = stageData.map((stage) => ({
      name: stage.name,
      count: stage.count,
      color: stage.color,
    }))

    // Top Agencies (from Active pipeline)
    const agencyMap = new Map<string, { count: number; value: number }>()
    pipelineOpportunities.forEach(opp => {
      const current = agencyMap.get(opp.agencyName) || { count: 0, value: 0 }
      agencyMap.set(opp.agencyName, {
        count: current.count + 1,
        value: current.value + (opp.estimatedValue || 0),
      })
    })

    const topAgencies = Array.from(agencyMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    // Priority Mix (simplified based on deadline urgency)
    const total = pipelineOpportunities.length
    const highPriority = overdueItems.length + Math.floor(upcomingDeadlines.length * 0.5)
    const mediumPriority = Math.floor(upcomingDeadlines.length * 0.5)
    const lowPriority = total - highPriority - mediumPriority

    const priorityMix = [
      { name: 'High', count: highPriority, percentage: total > 0 ? (highPriority / total) * 100 : 0, color: '#EF4444' },
      { name: 'Medium', count: mediumPriority, percentage: total > 0 ? (mediumPriority / total) * 100 : 0, color: '#F59E0B' },
      { name: 'Low', count: lowPriority, percentage: total > 0 ? (lowPriority / total) * 100 : 0, color: '#10B981' },
    ]

    // Get recent activities
    const recentActivities = await prisma.activity.findMany({
      take: 10,
      orderBy: {
        activityDate: 'desc',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      kpis,
      pipelineStages: stageData,
      insights,
      stageDistribution,
      topAgencies,
      priorityMix,

      // Summary metrics
      totalOpportunities: pipelineOpportunities.length,
      totalPipelineValue,
      activePipelineValue: totalPipelineValue,
      activeOpportunityCount: pipelineOpportunities.length,

      // SAM.gov metrics
      samGovTotal: samGovOpportunities.length,
      samGovPending: samGovNotAdded.length,
      samGovAdded: samGovAdded.length,

      // Win/Loss metrics
      wonCount: wonOpportunities.length,
      lostCount: lostOpportunities.length,
      conversionRate: winRate.toFixed(1),
      winRate: winRate.toFixed(1),

      // Contract metrics
      contractCount: contracts.length,
      contractValue: totalContractValue,

      recentActivities,
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
