"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { opportunitySchema, type OpportunityFormData } from "@/lib/validation"
import { Opportunity } from "@/types"
import { useVendors } from "@/hooks/use-data"

interface OpportunityFormProps {
  opportunity?: Opportunity
  onSubmit: (data: OpportunityFormData) => Promise<void>
  onCancel: () => void
}

export function OpportunityForm({ opportunity, onSubmit, onCancel }: OpportunityFormProps) {
  const { vendors } = useVendors()
  const [formData, setFormData] = useState<OpportunityFormData>({
    solNo: opportunity?.solNo || "",
    title: opportunity?.title || "",
    description: opportunity?.description || "",
    agency: opportunity?.agency || "",
    naics: opportunity?.naics || "",
    stage: opportunity?.stage || "IDENTIFIED",
    dueDate: opportunity?.dueDate ? new Date(opportunity.dueDate).toISOString().split('T')[0] : "",
    priority: opportunity?.priority || "MEDIUM",
    postedDate: opportunity?.postedDate ? new Date(opportunity.postedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    estimatedValue: opportunity?.estimatedValue || null,
    type: opportunity?.type || "RFP",
    setAside: opportunity?.setAside || "",
    placeOfPerformance: opportunity?.placeOfPerformance || "",
    status: opportunity?.status || "OPEN",
    samUrl: opportunity?.samUrl || "",
    attachments: opportunity?.attachments || [],
    vendorId: opportunity?.vendorId || "",
    notes: opportunity?.notes || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    try {
      const validatedData = opportunitySchema.parse(formData)
      setLoading(true)
      await onSubmit(validatedData)
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message
        })
        setErrors(newErrors)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="solNo">Solicitation Number *</Label>
          <Input
            id="solNo"
            value={formData.solNo}
            onChange={(e) => setFormData(prev => ({ ...prev, solNo: e.target.value }))}
            className={errors.solNo ? "border-red-500" : ""}
          />
          {errors.solNo && <p className="text-sm text-red-500 mt-1">{errors.solNo}</p>}
        </div>
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="agency">Agency *</Label>
          <Input
            id="agency"
            value={formData.agency}
            onChange={(e) => setFormData(prev => ({ ...prev, agency: e.target.value }))}
            className={errors.agency ? "border-red-500" : ""}
          />
          {errors.agency && <p className="text-sm text-red-500 mt-1">{errors.agency}</p>}
        </div>
        <div>
          <Label htmlFor="naics">NAICS Code</Label>
          <Input
            id="naics"
            value={formData.naics || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, naics: e.target.value }))}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="stage">Stage *</Label>
          <Select
            value={formData.stage}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, stage: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IDENTIFIED">Identified</SelectItem>
              <SelectItem value="PURSUIT">Pursuit</SelectItem>
              <SelectItem value="CAPTURE">Capture</SelectItem>
              <SelectItem value="PROPOSAL_DEVELOPMENT">Proposal Development</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="AWARDED">Awarded</SelectItem>
              <SelectItem value="LOST">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="priority">Priority *</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
              <SelectItem value="AWARDED">Awarded</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postedDate">Posted Date *</Label>
          <Input
            id="postedDate"
            type="date"
            value={formData.postedDate}
            onChange={(e) => setFormData(prev => ({ ...prev, postedDate: e.target.value }))}
            className={errors.postedDate ? "border-red-500" : ""}
          />
          {errors.postedDate && <p className="text-sm text-red-500 mt-1">{errors.postedDate}</p>}
        </div>
        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
        <Input
          id="estimatedValue"
          type="number"
          step="0.01"
          value={formData.estimatedValue || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, estimatedValue: e.target.value ? parseFloat(e.target.value) : null }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Opportunity Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RFP">RFP</SelectItem>
              <SelectItem value="RFQ">RFQ</SelectItem>
              <SelectItem value="RFI">RFI</SelectItem>
              <SelectItem value="SOURCES_SOUGHT">Sources Sought</SelectItem>
              <SelectItem value="PRESOLICITATION">Presolicitation</SelectItem>
              <SelectItem value="COMBINED_SYNOPSIS">Combined Synopsis</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="setAside">Set-Aside</Label>
          <Input
            id="setAside"
            value={formData.setAside || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, setAside: e.target.value }))}
            placeholder="e.g., Small Business, 8(a)"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="placeOfPerformance">Place of Performance</Label>
        <Input
          id="placeOfPerformance"
          value={formData.placeOfPerformance || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, placeOfPerformance: e.target.value }))}
        />
      </div>

      <div>
        <Label htmlFor="samUrl">SAM.gov URL</Label>
        <Input
          id="samUrl"
          type="url"
          value={formData.samUrl || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, samUrl: e.target.value }))}
          className={errors.samUrl ? "border-red-500" : ""}
        />
        {errors.samUrl && <p className="text-sm text-red-500 mt-1">{errors.samUrl}</p>}
      </div>

      <div>
        <Label htmlFor="vendorId">Assigned Vendor (Optional)</Label>
        <Select
          value={formData.vendorId || "none"}
          onValueChange={(value) => setFormData(prev => ({ ...prev, vendorId: value === "none" ? "" : value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a vendor (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {vendors.map(vendor => (
              <SelectItem key={vendor.id} value={vendor.id}>
                {vendor.company}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : opportunity ? "Update Opportunity" : "Add Opportunity"}
        </Button>
      </div>
    </form>
  )
}