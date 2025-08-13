"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { contractSchema, type ContractFormData } from "@/lib/validation"
import { Contract, Vendor } from "@/types"
import { useVendors } from "@/hooks/use-data"

interface ContractFormProps {
  contract?: Contract
  onSubmit: (data: ContractFormData) => Promise<void>
  onCancel: () => void
}

export function ContractForm({ contract, onSubmit, onCancel }: ContractFormProps) {
  const { vendors } = useVendors()
  const [formData, setFormData] = useState<ContractFormData>({
    contractNumber: contract?.contractNumber || "",
    title: contract?.title || "",
    description: contract?.description || "",
    vendorId: contract?.vendorId || "",
    agency: contract?.agency || "",
    value: contract?.value || 0,
    startDate: contract?.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : "",
    endDate: contract?.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : "",
    status: contract?.status || "PENDING",
    type: contract?.type || "FIRM_FIXED_PRICE",
    setAside: contract?.setAside || "",
    naicsCode: contract?.naicsCode || "",
    popLocation: contract?.popLocation || "",
    contactName: contract?.contactName || "",
    contactEmail: contract?.contactEmail || "",
    contactPhone: contract?.contactPhone || "",
    notes: contract?.notes || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    try {
      const validatedData = contractSchema.parse(formData)
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
          <Label htmlFor="contractNumber">Contract Number *</Label>
          <Input
            id="contractNumber"
            value={formData.contractNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, contractNumber: e.target.value }))}
            className={errors.contractNumber ? "border-red-500" : ""}
          />
          {errors.contractNumber && <p className="text-sm text-red-500 mt-1">{errors.contractNumber}</p>}
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
          <Label htmlFor="vendorId">Vendor *</Label>
          <Select
            value={formData.vendorId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, vendorId: value }))}
          >
            <SelectTrigger className={errors.vendorId ? "border-red-500" : ""}>
              <SelectValue placeholder="Select a vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map(vendor => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.vendorId && <p className="text-sm text-red-500 mt-1">{errors.vendorId}</p>}
        </div>
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
      </div>

      <div>
        <Label htmlFor="value">Contract Value ($) *</Label>
        <Input
          id="value"
          type="number"
          step="0.01"
          value={formData.value}
          onChange={(e) => setFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
          className={errors.value ? "border-red-500" : ""}
        />
        {errors.value && <p className="text-sm text-red-500 mt-1">{errors.value}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            className={errors.startDate ? "border-red-500" : ""}
          />
          {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>}
        </div>
        <div>
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            className={errors.endDate ? "border-red-500" : ""}
          />
          {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="type">Contract Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FIRM_FIXED_PRICE">Firm Fixed Price</SelectItem>
              <SelectItem value="COST_PLUS">Cost Plus</SelectItem>
              <SelectItem value="TIME_AND_MATERIALS">Time & Materials</SelectItem>
              <SelectItem value="IDIQ">IDIQ</SelectItem>
              <SelectItem value="BPA">BPA</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="setAside">Set-Aside</Label>
          <Input
            id="setAside"
            value={formData.setAside || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, setAside: e.target.value }))}
            placeholder="e.g., Small Business, 8(a)"
          />
        </div>
        <div>
          <Label htmlFor="naicsCode">NAICS Code</Label>
          <Input
            id="naicsCode"
            value={formData.naicsCode || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, naicsCode: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="popLocation">Place of Performance</Label>
        <Input
          id="popLocation"
          value={formData.popLocation || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, popLocation: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Point of Contact</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="contactName">Name</Label>
            <Input
              id="contactName"
              value={formData.contactName || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="contactEmail">Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={formData.contactEmail || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
              className={errors.contactEmail ? "border-red-500" : ""}
            />
            {errors.contactEmail && <p className="text-sm text-red-500 mt-1">{errors.contactEmail}</p>}
          </div>
          <div>
            <Label htmlFor="contactPhone">Phone</Label>
            <Input
              id="contactPhone"
              value={formData.contactPhone || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
            />
          </div>
        </div>
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
          {loading ? "Saving..." : contract ? "Update Contract" : "Add Contract"}
        </Button>
      </div>
    </form>
  )
}