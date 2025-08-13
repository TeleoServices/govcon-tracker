"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Search, Filter, Building2, Award, Globe, ShieldCheck } from "lucide-react"
import { VendorForm } from "@/components/vendors/vendor-form"
import { SAMVerification } from "@/components/vendors/sam-verification"
import { useVendors } from "@/hooks/use-data"
import { type VendorFormData } from "@/lib/validation"

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

export default function VendorsPage() {
  const { vendors, loading, error, refetch } = useVendors()
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [editingVendor, setEditingVendor] = useState<any>(null)
  const [prefilledVendorData, setPrefilledVendorData] = useState<any>(null)

  const filteredVendors = useMemo(() => {
    if (!searchTerm) return vendors
    
    const term = searchTerm.toLowerCase()
    return vendors.filter(vendor => {
      const capabilities = parseJSONArray(vendor.capabilities)
      const certifications = parseJSONArray(vendor.certifications)
      
      return vendor.name.toLowerCase().includes(term) ||
        vendor.duns?.toLowerCase().includes(term) ||
        vendor.cageCode?.toLowerCase().includes(term) ||
        capabilities.some(cap => cap.toLowerCase().includes(term)) ||
        certifications.some(cert => cert.toLowerCase().includes(term))
    })
  }, [vendors, searchTerm])

  const handleAddVendor = async (data: VendorFormData) => {
    try {
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error('Failed to add vendor')
      
      await refetch()
      setShowAddDialog(false)
    } catch (error) {
      console.error('Error adding vendor:', error)
      alert('Failed to add vendor')
    }
  }

  const handleUpdateVendor = async (data: VendorFormData) => {
    if (!editingVendor) return
    
    try {
      const response = await fetch(`/api/vendors/${editingVendor.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error('Failed to update vendor')
      
      await refetch()
      setEditingVendor(null)
    } catch (error) {
      console.error('Error updating vendor:', error)
      alert('Failed to update vendor')
    }
  }

  const handleEntityFound = (entityData: any) => {
    // Map SAM.gov data to vendor form data
    const mappedData = {
      name: entityData.legalBusinessName,
      dbaName: entityData.dbaName || '',
      contactName: entityData.pointsOfContact?.[0]?.firstName + ' ' + entityData.pointsOfContact?.[0]?.lastName || '',
      contactEmail: entityData.pointsOfContact?.[0]?.email || '',
      contactPhone: entityData.pointsOfContact?.[0]?.phone || '',
      address: entityData.physicalAddress.street,
      city: entityData.physicalAddress.city,
      state: entityData.physicalAddress.state,
      zipCode: entityData.physicalAddress.zipCode,
      country: entityData.physicalAddress.country || 'US',
      website: '',
      // SAM.gov specific fields
      uei: entityData.ueiSAM,
      cageCode: entityData.cageCode,
      duns: '', // Not provided by current API
      // Set certifications based on socioeconomic categories
      certifications: JSON.stringify(getSAMCertifications(entityData.socioeconomicCategories)),
      // Set capabilities from NAICS codes
      capabilities: JSON.stringify(entityData.naicsCodes?.slice(0, 5).map((n: any) => n.description) || []),
      notes: `Verified in SAM.gov on ${new Date().toLocaleDateString()}. Registration Status: ${entityData.registrationStatus}. Expires: ${entityData.expirationDate ? new Date(entityData.expirationDate).toLocaleDateString() : 'N/A'}`
    }
    
    setPrefilledVendorData(mappedData)
    setShowVerificationDialog(false)
    setShowAddDialog(true)
  }

  const handleEntityNotFound = () => {
    // User can still add manually
    console.log('Entity not found in SAM.gov, user can add manually')
  }

  const getSAMCertifications = (categories: any) => {
    const certs = []
    if (categories.isSmallBusiness) certs.push('Small Business')
    if (categories.isWomanOwned) certs.push('Woman Owned Small Business (WOSB)')
    if (categories.isVeteranOwned) certs.push('Veteran Owned Small Business (VOSB)')
    if (categories.isServiceDisabledVeteranOwned) certs.push('Service-Disabled Veteran Owned Small Business (SDVOSB)')
    if (categories.is8aCertified) certs.push('8(a) Business Development Program')
    if (categories.isHUBZone) certs.push('Historically Underutilized Business Zone (HUBZone)')
    if (categories.isMinorityOwned) certs.push('Minority Business Enterprise (MBE)')
    return certs
  }

  const mockVendors = [
    {
      id: "1",
      name: "Tech Solutions Inc.",
      duns: "123456789",
      cageCode: "1ABC2",
      samRegistered: true,
      capabilities: ["IT Services", "Cloud", "Cybersecurity"],
      certifications: ["8(a)", "SDVOSB"],
      contractCount: 3,
      contractValue: 1200000,
    },
    {
      id: "2",
      name: "BuildCorp Services",
      duns: "987654321",
      cageCode: "2DEF3",
      samRegistered: true,
      capabilities: ["Construction", "Maintenance", "Engineering"],
      certifications: ["Small Business", "HUBZone"],
      contractCount: 2,
      contractValue: 580000,
    },
    {
      id: "3",
      name: "SecureGuard LLC",
      duns: "456789123",
      cageCode: "3GHI4",
      samRegistered: false,
      capabilities: ["Security", "Risk Assessment", "Compliance"],
      certifications: ["WOSB", "ISO 27001"],
      contractCount: 1,
      contractValue: 625000,
    },
  ]

  const displayVendors = filteredVendors.length > 0 ? filteredVendors : mockVendors

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subcontractors</h2>
          <p className="text-muted-foreground">
            Manage subcontractor information and capabilities
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowVerificationDialog(true)}
            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            Verify in SAM.gov
          </Button>
          <Button onClick={() => {
            setPrefilledVendorData(null)
            setShowAddDialog(true)
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subcontractor
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search subcontractors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {loading && <p>Loading vendors...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayVendors.map((vendor: any) => (
          <Card key={vendor.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Building2 className="h-8 w-8 text-muted-foreground" />
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                  vendor.samRegistered 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {vendor.samRegistered ? "SAM Registered" : "Pending SAM"}
                </span>
              </div>
              <CardTitle>{vendor.name}</CardTitle>
              <CardDescription>
                {vendor.duns && `DUNS: ${vendor.duns}`}
                {vendor.duns && vendor.cageCode && " | "}
                {vendor.cageCode && `CAGE: ${vendor.cageCode}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Capabilities</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {parseJSONArray(vendor.capabilities).map((cap: string, i: number) => (
                      <span key={i} className="rounded-full bg-secondary px-2 py-1 text-xs">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Certifications</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{parseJSONArray(vendor.certifications).join(", ")}</span>
                  </div>
                </div>
                {vendor.contractCount !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Contracts</p>
                    <p className="text-sm font-bold">
                      {vendor.contractCount} contracts • ${(vendor.contractValue / 1000000).toFixed(1)}M total
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setEditingVendor(vendor)}
                  >
                    View Details
                  </Button>
                  {vendor.website && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open(vendor.website, '_blank')}
                    >
                      <Globe className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Vendor</DialogTitle>
            <DialogDescription>
              Enter vendor information to add them to the database.
            </DialogDescription>
          </DialogHeader>
          <VendorForm 
            vendor={prefilledVendorData}
            onSubmit={handleAddVendor}
            onCancel={() => {
              setShowAddDialog(false)
              setPrefilledVendorData(null)
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingVendor} onOpenChange={(open) => !open && setEditingVendor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
            <DialogDescription>
              Update vendor information.
            </DialogDescription>
          </DialogHeader>
          {editingVendor && (
            <VendorForm 
              vendor={editingVendor}
              onSubmit={handleUpdateVendor}
              onCancel={() => setEditingVendor(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showVerificationDialog} onOpenChange={setShowVerificationDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>SAM.gov Verification</DialogTitle>
            <DialogDescription>
              Search for and verify a business in SAM.gov before adding them to your database
            </DialogDescription>
          </DialogHeader>
          <SAMVerification 
            onEntityFound={handleEntityFound}
            onEntityNotFound={handleEntityNotFound}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}