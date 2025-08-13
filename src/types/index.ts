export interface Vendor {
  id: string
  name: string
  company: string
  trade: string
  duns: string | null
  cageCode: string | null
  samRegistered: boolean
  capabilities: string[]
  naicsCode: string[]
  address: string | null
  contactEmail: string | null
  contactPhone: string | null
  website: string | null
  location: string | null
  certifications: string[]
  createdAt: Date
  updatedAt: Date
  contracts?: Contract[]
  opportunities?: Opportunity[]
  contactLogs?: ContactLog[]
}

export interface Contract {
  id: string
  contractNumber: string
  title: string
  description: string | null
  vendorId: string
  agency: string
  value: number
  startDate: Date
  endDate: Date
  status: ContractStatus
  type: ContractType
  setAside: string | null
  naicsCode: string | null
  popLocation: string | null
  contactName: string | null
  contactEmail: string | null
  contactPhone: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  vendor?: Vendor
  modifications?: Modification[]
}

export interface Opportunity {
  id: string
  solNo: string
  title: string
  description: string | null
  agency: string
  naics: string | null
  stage: OpportunityStage
  dueDate: Date | null
  priority: Priority
  postedDate: Date
  estimatedValue: number | null
  type: OpportunityType
  setAside: string | null
  placeOfPerformance: string | null
  status: OpportunityStatus
  samUrl: string | null
  attachments: string[]
  vendorId: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  vendor?: Vendor
  contactLogs?: ContactLog[]
}

export interface ContactLog {
  id: string
  subId: string
  oppId: string
  date: Date
  method: ContactMethod
  status: ContactStatus
  notes: string | null
  createdAt: Date
  updatedAt: Date
  subcontractor?: Vendor
  opportunity?: Opportunity
}

export interface Modification {
  id: string
  contractId: string
  modNumber: string
  description: string
  value: number | null
  effectiveDate: Date
  createdAt: Date
  contract?: Contract
}

export enum ContractStatus {
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  PENDING = "PENDING"
}

export enum ContractType {
  FIRM_FIXED_PRICE = "FIRM_FIXED_PRICE",
  COST_PLUS = "COST_PLUS",
  TIME_AND_MATERIALS = "TIME_AND_MATERIALS",
  IDIQ = "IDIQ",
  BPA = "BPA",
  OTHER = "OTHER"
}

export enum OpportunityType {
  RFP = "RFP",
  RFQ = "RFQ",
  RFI = "RFI",
  SOURCES_SOUGHT = "SOURCES_SOUGHT",
  PRESOLICITATION = "PRESOLICITATION",
  COMBINED_SYNOPSIS = "COMBINED_SYNOPSIS",
  OTHER = "OTHER"
}

export enum OpportunityStatus {
  OPEN = "OPEN",
  CLOSED = "CLOSED",
  AWARDED = "AWARDED",
  CANCELLED = "CANCELLED",
  DRAFT = "DRAFT"
}

export enum OpportunityStage {
  IDENTIFIED = "IDENTIFIED",
  PURSUIT = "PURSUIT", 
  CAPTURE = "CAPTURE",
  PROPOSAL_DEVELOPMENT = "PROPOSAL_DEVELOPMENT",
  SUBMITTED = "SUBMITTED",
  AWARDED = "AWARDED",
  LOST = "LOST"
}

export enum Priority {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW"
}

export enum ContactMethod {
  EMAIL = "EMAIL",
  PHONE = "PHONE", 
  PORTAL = "PORTAL",
  IN_PERSON = "IN_PERSON"
}

export enum ContactStatus {
  AWAITING_REPLY = "AWAITING_REPLY",
  QUOTE_REQUESTED = "QUOTE_REQUESTED",
  QUOTE_RECEIVED = "QUOTE_RECEIVED",
  DECLINED = "DECLINED",
  NO_RESPONSE = "NO_RESPONSE"
}

// Utility functions
export const getStageProgress = (stage: OpportunityStage): number => {
  const stages = Object.values(OpportunityStage)
  const currentIndex = stages.indexOf(stage)
  return Math.round((currentIndex / (stages.length - 1)) * 100)
}

export const getDaysRemaining = (dueDate: Date | null): number | null => {
  if (!dueDate) return null
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const getStageColor = (stage: OpportunityStage): string => {
  switch (stage) {
    case OpportunityStage.IDENTIFIED: return 'bg-gray-100 text-gray-800'
    case OpportunityStage.PURSUIT: return 'bg-blue-100 text-blue-800'
    case OpportunityStage.CAPTURE: return 'bg-purple-100 text-purple-800'
    case OpportunityStage.PROPOSAL_DEVELOPMENT: return 'bg-orange-100 text-orange-800'
    case OpportunityStage.SUBMITTED: return 'bg-yellow-100 text-yellow-800'
    case OpportunityStage.AWARDED: return 'bg-green-100 text-green-800'
    case OpportunityStage.LOST: return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case Priority.HIGH: return 'bg-red-100 text-red-800'
    case Priority.MEDIUM: return 'bg-yellow-100 text-yellow-800'
    case Priority.LOW: return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export const getStageDescription = (stage: OpportunityStage): string => {
  switch (stage) {
    case OpportunityStage.IDENTIFIED:
      return "Initial opportunity identification - evaluating if this aligns with company capabilities and strategy"
    case OpportunityStage.PURSUIT:
      return "Active pursuit phase - developing competitive intelligence, building relationships, and assessing win probability"
    case OpportunityStage.CAPTURE:
      return "Capture planning - creating win strategy, identifying key personnel, and building the capture team"
    case OpportunityStage.PROPOSAL_DEVELOPMENT:
      return "Proposal development - writing, reviewing, and preparing the formal response to the solicitation"
    case OpportunityStage.SUBMITTED:
      return "Proposal submitted - waiting for government evaluation and award decision"
    case OpportunityStage.AWARDED:
      return "Contract awarded - successful bid, moving to contract execution phase"
    case OpportunityStage.LOST:
      return "Opportunity lost - conducting lessons learned and debriefing for future improvements"
    default:
      return "Opportunity stage"
  }
}