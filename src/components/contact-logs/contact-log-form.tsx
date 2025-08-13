"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { contactLogSchema, type ContactLogFormData } from "@/lib/validation"
import { ContactLog } from "@/types"
import { useVendors, useOpportunities } from "@/hooks/use-data"

interface ContactLogFormProps {
  contactLog?: ContactLog
  onSubmit: (data: ContactLogFormData) => Promise<void>
  onCancel: () => void
  preselectedSubId?: string
  preselectedOppId?: string
  defaultVendorId?: string | null
}

export function ContactLogForm({ 
  contactLog, 
  onSubmit, 
  onCancel, 
  preselectedSubId, 
  preselectedOppId,
  defaultVendorId
}: ContactLogFormProps) {
  const { vendors } = useVendors()
  const { opportunities } = useOpportunities()
  
  const [formData, setFormData] = useState<ContactLogFormData>({
    subId: contactLog?.subId || preselectedSubId || defaultVendorId || "",
    oppId: contactLog?.oppId || preselectedOppId || "",
    date: contactLog?.date 
      ? new Date(contactLog.date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0],
    method: contactLog?.method || "EMAIL",
    status: contactLog?.status || "AWAITING_REPLY",
    notes: contactLog?.notes || "",
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    
    try {
      const validatedData = contactLogSchema.parse(formData)
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
          <Label htmlFor="subId">Subcontractor *</Label>
          <Select
            value={formData.subId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, subId: value }))}
          >
            <SelectTrigger className={errors.subId ? "border-red-500" : ""}>
              <SelectValue placeholder="Select a subcontractor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map(vendor => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.company} - {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subId && <p className="text-sm text-red-500 mt-1">{errors.subId}</p>}
        </div>
        
        <div>
          <Label htmlFor="oppId">Opportunity *</Label>
          <Select
            value={formData.oppId}
            onValueChange={(value) => setFormData(prev => ({ ...prev, oppId: value }))}
          >
            <SelectTrigger className={errors.oppId ? "border-red-500" : ""}>
              <SelectValue placeholder="Select an opportunity" />
            </SelectTrigger>
            <SelectContent>
              {opportunities.map(opp => (
                <SelectItem key={opp.id} value={opp.id}>
                  {opp.solNo} - {opp.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.oppId && <p className="text-sm text-red-500 mt-1">{errors.oppId}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="date">Contact Date *</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          className={errors.date ? "border-red-500" : ""}
        />
        {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="method">Contact Method *</Label>
          <Select
            value={formData.method}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, method: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EMAIL">Email</SelectItem>
              <SelectItem value="PHONE">Phone</SelectItem>
              <SelectItem value="PORTAL">Portal</SelectItem>
              <SelectItem value="IN_PERSON">In Person</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="status">Contact Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AWAITING_REPLY">Awaiting Reply</SelectItem>
              <SelectItem value="QUOTE_REQUESTED">Quote Requested</SelectItem>
              <SelectItem value="QUOTE_RECEIVED">Quote Received</SelectItem>
              <SelectItem value="DECLINED">Declined</SelectItem>
              <SelectItem value="NO_RESPONSE">No Response</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Add any relevant details about this contact..."
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : contactLog ? "Update Contact" : "Log Contact"}
        </Button>
      </div>
    </form>
  )
}