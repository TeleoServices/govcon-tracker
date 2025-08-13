import { OpportunityStage } from "@/types"

interface Opportunity {
  id: string
  title: string
  stage: OpportunityStage
  estimatedValue: number | null
  dueDate: Date | null
  createdAt: Date
  priority: string
  agency: string
  solNo: string
  type: string
  status: string
}

interface KPIData {
  totalContractValue: number
  winRate: number
  pipelineHealth: number
  avgDealCycle: number
  activeOpportunities: number
}

interface PipelineStageData {
  stage: OpportunityStage
  count: number
  value: number
  percentage: number
}

export const transformOpportunityData = (rawData: Opportunity[]) => {
  const kpis = calculateKPIs(rawData)
  const pipeline = groupByStage(rawData)
  const opportunities = formatForTable(rawData)
  
  return {
    kpis,
    pipeline,
    opportunities,
    rawData
  }
}

const calculateKPIs = (opportunities: Opportunity[]): KPIData => {
  // Total Contract Value
  const totalContractValue = opportunities.reduce((sum, opp) => {
    return sum + (opp.estimatedValue || 0)
  }, 0)

  // Win Rate Calculation
  const closedOpportunities = opportunities.filter(opp => 
    opp.stage === OpportunityStage.AWARDED || opp.stage === OpportunityStage.LOST
  )
  const wonOpportunities = opportunities.filter(opp => 
    opp.stage === OpportunityStage.AWARDED
  )
  const winRate = closedOpportunities.length > 0 
    ? (wonOpportunities.length / closedOpportunities.length) * 100 
    : 0

  // Pipeline Health (weighted by stage probability)
  const stageWeights = {
    [OpportunityStage.IDENTIFIED]: 0.1,
    [OpportunityStage.PURSUIT]: 0.2,
    [OpportunityStage.CAPTURE]: 0.4,
    [OpportunityStage.PROPOSAL_DEVELOPMENT]: 0.6,
    [OpportunityStage.SUBMITTED]: 0.8,
    [OpportunityStage.AWARDED]: 1.0,
    [OpportunityStage.LOST]: 0.0,
  }

  const weightedValue = opportunities.reduce((sum, opp) => {
    const weight = stageWeights[opp.stage] || 0
    const value = opp.estimatedValue || 0
    return sum + (value * weight)
  }, 0)

  const pipelineHealth = totalContractValue > 0 
    ? (weightedValue / totalContractValue) * 100 
    : 0

  // Average Deal Cycle
  const closedOppsWithDates = closedOpportunities.filter(opp => 
    opp.createdAt && opp.dueDate
  )
  const avgDealCycle = closedOppsWithDates.length > 0
    ? closedOppsWithDates.reduce((sum, opp) => {
        const days = Math.abs(
          new Date(opp.dueDate!).getTime() - new Date(opp.createdAt).getTime()
        ) / (1000 * 60 * 60 * 24)
        return sum + days
      }, 0) / closedOppsWithDates.length
    : 0

  // Active Opportunities
  const activeOpportunities = opportunities.filter(opp => 
    opp.stage !== OpportunityStage.AWARDED && opp.stage !== OpportunityStage.LOST
  ).length

  return {
    totalContractValue,
    winRate,
    pipelineHealth,
    avgDealCycle,
    activeOpportunities
  }
}

const groupByStage = (opportunities: Opportunity[]): PipelineStageData[] => {
  const stageOrder = [
    OpportunityStage.IDENTIFIED,
    OpportunityStage.PURSUIT,
    OpportunityStage.CAPTURE,
    OpportunityStage.PROPOSAL_DEVELOPMENT,
    OpportunityStage.SUBMITTED,
    OpportunityStage.AWARDED,
  ]

  const stageData = stageOrder.map(stage => {
    const stageOpps = opportunities.filter(opp => opp.stage === stage)
    const count = stageOpps.length
    const value = stageOpps.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0)
    
    return {
      stage,
      count,
      value,
      percentage: 0 // Will be calculated below
    }
  })

  // Calculate percentages for funnel visualization
  const maxCount = Math.max(...stageData.map(s => s.count))
  stageData.forEach(stage => {
    stage.percentage = maxCount > 0 ? (stage.count / maxCount) * 100 : 0
  })

  return stageData
}

const formatForTable = (opportunities: Opportunity[]) => {
  return opportunities.map(opp => ({
    ...opp,
    daysRemaining: opp.dueDate 
      ? Math.ceil((new Date(opp.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null,
    formattedValue: opp.estimatedValue 
      ? new Intl.NumberFormat('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(opp.estimatedValue)
      : 'TBD'
  }))
}

export const getStageDisplayName = (stage: OpportunityStage): string => {
  switch (stage) {
    case OpportunityStage.IDENTIFIED: return "Identified"
    case OpportunityStage.PURSUIT: return "Pursuit"
    case OpportunityStage.CAPTURE: return "Capture"
    case OpportunityStage.PROPOSAL_DEVELOPMENT: return "Proposal Dev"
    case OpportunityStage.SUBMITTED: return "Submitted"
    case OpportunityStage.AWARDED: return "Awarded"
    case OpportunityStage.LOST: return "Lost"
    default: return stage
  }
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`
}