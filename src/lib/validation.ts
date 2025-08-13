import { z } from "zod"

export const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().min(1, "Company is required"),
  trade: z.string().min(1, "Trade is required"),
  duns: z.string().optional().nullable(),
  cageCode: z.string().optional().nullable(),
  samRegistered: z.boolean().default(false),
  capabilities: z.array(z.string()).default([]),
  naicsCode: z.array(z.string()).default([]),
  address: z.string().optional().nullable(),
  contactEmail: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  contactPhone: z.string().optional().nullable(),
  website: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  location: z.string().optional().nullable(),
  certifications: z.array(z.string()).default([]),
})

export const contractSchema = z.object({
  contractNumber: z.string().min(1, "Contract number is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  vendorId: z.string().min(1, "Vendor is required"),
  agency: z.string().min(1, "Agency is required"),
  value: z.number().positive("Value must be positive"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED", "PENDING"]),
  type: z.enum(["FIRM_FIXED_PRICE", "COST_PLUS", "TIME_AND_MATERIALS", "IDIQ", "BPA", "OTHER"]),
  setAside: z.string().optional().nullable(),
  naicsCode: z.string().optional().nullable(),
  popLocation: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  contactEmail: z.string().email("Invalid email").optional().nullable().or(z.literal("")),
  contactPhone: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const opportunitySchema = z.object({
  solNo: z.string().min(1, "Solicitation number is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().nullable(),
  agency: z.string().min(1, "Agency is required"),
  naics: z.string().optional().nullable(),
  stage: z.enum(["IDENTIFIED", "PURSUIT", "CAPTURE", "PROPOSAL_DEVELOPMENT", "SUBMITTED", "AWARDED", "LOST"]),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  postedDate: z.string().min(1, "Posted date is required"),
  estimatedValue: z.number().positive("Value must be positive").optional().nullable(),
  type: z.enum(["RFP", "RFQ", "RFI", "SOURCES_SOUGHT", "PRESOLICITATION", "COMBINED_SYNOPSIS", "OTHER"]),
  setAside: z.string().optional().nullable(),
  placeOfPerformance: z.string().optional().nullable(),
  status: z.enum(["OPEN", "CLOSED", "AWARDED", "CANCELLED", "DRAFT"]),
  samUrl: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  attachments: z.array(z.string()).default([]),
  vendorId: z.string().optional().nullable().transform(val => val === "none" ? null : val),
  notes: z.string().optional().nullable(),
})

export const contactLogSchema = z.object({
  subId: z.string().min(1, "Subcontractor is required"),
  oppId: z.string().min(1, "Opportunity is required"),
  date: z.string().min(1, "Contact date is required"),
  method: z.enum(["EMAIL", "PHONE", "PORTAL", "IN_PERSON"]),
  status: z.enum(["AWAITING_REPLY", "QUOTE_REQUESTED", "QUOTE_RECEIVED", "DECLINED", "NO_RESPONSE"]),
  notes: z.string().optional().nullable(),
})

export type VendorFormData = z.infer<typeof vendorSchema>
export type ContractFormData = z.infer<typeof contractSchema>
export type OpportunityFormData = z.infer<typeof opportunitySchema>
export type ContactLogFormData = z.infer<typeof contactLogSchema>