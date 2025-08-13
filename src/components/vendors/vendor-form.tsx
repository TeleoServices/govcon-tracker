"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { vendorSchema, type VendorFormData } from "@/lib/validation"
import { Vendor } from "@/types"

// Helper function to safely parse JSON strings back to arrays
const parseJSONArray = (jsonString: string | string[]): string[] => {
  if (Array.isArray(jsonString)) return jsonString
  if (!jsonString) return []
  try {
    const parsed = JSON.parse(jsonString)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

interface VendorFormProps {
  vendor?: Vendor
  onSubmit: (data: VendorFormData) => Promise<void>
  onCancel: () => void
}

export function VendorForm({ vendor, onSubmit, onCancel }: VendorFormProps) {
  const [formData, setFormData] = useState<VendorFormData>({
    name: vendor?.name || "",
    company: vendor?.company || "",
    trade: vendor?.trade || "",
    duns: vendor?.duns || "",
    cageCode: vendor?.cageCode || "",
    samRegistered: vendor?.samRegistered || false,
    capabilities: parseJSONArray(vendor?.capabilities || ""),
    naicsCode: parseJSONArray(vendor?.naicsCode || ""),
    address: vendor?.address || "",
    contactEmail: vendor?.contactEmail || "",
    contactPhone: vendor?.contactPhone || "",
    website: vendor?.website || "",
    location: vendor?.location || "",
    certifications: parseJSONArray(vendor?.certifications || ""),
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    try {
      const validatedData = vendorSchema.parse(formData)
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

  const handleArrayInput = (field: 'capabilities' | 'naicsCode' | 'certifications', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(Boolean)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company">Company Name *</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
            className={errors.company ? "border-red-500" : ""}
          />
          {errors.company && <p className="text-sm text-red-500 mt-1">{errors.company}</p>}
        </div>
        <div>
          <Label htmlFor="name">Contact Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="trade">Trade/Business Type</Label>
        <Input
          id="trade"
          value={formData.trade}
          onChange={(e) => setFormData(prev => ({ ...prev, trade: e.target.value }))}
          placeholder="IT Services, Construction, Consulting, etc."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duns">DUNS Number</Label>
          <Input
            id="duns"
            value={formData.duns || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, duns: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="cageCode">CAGE Code</Label>
          <Input
            id="cageCode"
            value={formData.cageCode || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, cageCode: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="samRegistered">SAM Registration Status</Label>
        <Select
          value={formData.samRegistered ? "true" : "false"}
          onValueChange={(value) => setFormData(prev => ({ ...prev, samRegistered: value === "true" }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="true">Registered</SelectItem>
            <SelectItem value="false">Not Registered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="capabilities">Capabilities (comma-separated)</Label>
        <Input
          id="capabilities"
          value={formData.capabilities.join(", ")}
          onChange={(e) => handleArrayInput('capabilities', e.target.value)}
          placeholder="IT Services, Cloud Computing, Cybersecurity"
        />
      </div>

      <div>
        <Label htmlFor="naicsCode">NAICS Codes (comma-separated)</Label>
        <Input
          id="naicsCode"
          value={formData.naicsCode.join(", ")}
          onChange={(e) => handleArrayInput('naicsCode', e.target.value)}
          placeholder="541511, 541512, 541519"
        />
      </div>

      <div>
        <Label htmlFor="certifications">Certifications (comma-separated)</Label>
        <Input
          id="certifications"
          value={formData.certifications.join(", ")}
          onChange={(e) => handleArrayInput('certifications', e.target.value)}
          placeholder="8(a), SDVOSB, HUBZone"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="location">Location/City</Label>
          <Input
            id="location"
            value={formData.location || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            placeholder="Washington, DC"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contactEmail">Contact Email</Label>
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
          <Label htmlFor="contactPhone">Contact Phone</Label>
          <Input
            id="contactPhone"
            value={formData.contactPhone || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={formData.website || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
          className={errors.website ? "border-red-500" : ""}
        />
        {errors.website && <p className="text-sm text-red-500 mt-1">{errors.website}</p>}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : vendor ? "Update Vendor" : "Add Vendor"}
        </Button>
      </div>
    </form>
  )
}