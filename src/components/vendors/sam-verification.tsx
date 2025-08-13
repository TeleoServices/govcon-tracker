"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Building, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  Award,
  Loader2
} from "lucide-react"

interface SAMVerificationProps {
  onEntityFound?: (entityData: any) => void
  onEntityNotFound?: () => void
}

interface EntityData {
  found: boolean
  active: boolean
  data: {
    legalBusinessName: string
    dbaName: string
    ueiSAM: string
    cageCode: string
    registrationStatus: string
    registrationDate: string | null
    expirationDate: string | null
    lastUpdateDate: string | null
    entityStructure: string
    entityType: string
    physicalAddress: {
      street: string
      street2: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    businessTypes: string[]
    naicsCodes: Array<{
      code: string
      description: string
      isPrimary: boolean
    }>
    socioeconomicCategories: {
      isSmallBusiness: boolean
      isWomanOwned: boolean
      isVeteranOwned: boolean
      isServiceDisabledVeteranOwned: boolean
      is8aCertified: boolean
      isHUBZone: boolean
      isMinorityOwned: boolean
    }
    pointsOfContact: Array<{
      firstName: string
      lastName: string
      title: string
      email: string
      phone: string
      type: string
    }>
  }
}

export function SAMVerification({ onEntityFound, onEntityNotFound }: SAMVerificationProps) {
  const [businessName, setBusinessName] = useState("")
  const [ueiSAM, setUeiSAM] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EntityData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVerification = async () => {
    if (!businessName.trim() && !ueiSAM.trim()) {
      setError("Please enter either a business name or UEI SAM number")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/sam-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessName.trim() || undefined,
          ueiSAM: ueiSAM.trim() || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      setResult(data)

      // Don't automatically trigger callbacks - let user see results first

    } catch (err: any) {
      setError(err.message || 'Failed to verify entity in SAM.gov')
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address: any) => {
    const parts = [
      address.street,
      address.street2,
      [address.city, address.state].filter(Boolean).join(', '),
      address.zipCode
    ].filter(Boolean)
    
    return parts.join(', ')
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const getSocioeconomicBadges = (categories: any) => {
    const badges = []
    
    if (categories.isSmallBusiness) badges.push('Small Business')
    if (categories.isWomanOwned) badges.push('Woman Owned')
    if (categories.isVeteranOwned) badges.push('Veteran Owned')
    if (categories.isServiceDisabledVeteranOwned) badges.push('SDVOSB')
    if (categories.is8aCertified) badges.push('8(a) Certified')
    if (categories.isHUBZone) badges.push('HUBZone')
    if (categories.isMinorityOwned) badges.push('Minority Owned')
    
    return badges
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            SAM.gov Verification
          </CardTitle>
          <CardDescription>
            Verify if a business is registered and active in SAM.gov before adding them to your database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Legal Business Name</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter exact business name"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="ueiSAM">UEI SAM Number (preferred)</Label>
              <Input
                id="ueiSAM"
                value={ueiSAM}
                onChange={(e) => setUeiSAM(e.target.value)}
                placeholder="12-character UEI SAM"
                maxLength={12}
                disabled={loading}
              />
            </div>
          </div>

          <Button 
            onClick={handleVerification} 
            disabled={loading || (!businessName.trim() && !ueiSAM.trim())}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying in SAM.gov...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Verify in SAM.gov
              </>
            )}
          </Button>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.found && result.active ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : result.found && !result.active ? (
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Verification Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!result.found ? (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  No entity found in SAM.gov with the provided information. Please verify the business name or UEI SAM number.
                </AlertDescription>
              </Alert>
            ) : !result.active ? (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Entity found but registration is not active. Status: {result.data.registrationStatus}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    ✅ Entity is registered and active in SAM.gov
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Business Information
                    </h3>
                    
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Legal Business Name</Label>
                        <p className="font-medium">{result.data.legalBusinessName}</p>
                      </div>
                      
                      {result.data.dbaName && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">DBA Name</Label>
                          <p>{result.data.dbaName}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">UEI SAM</Label>
                          <p className="font-mono text-sm">{result.data.ueiSAM}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">CAGE Code</Label>
                          <p className="font-mono text-sm">{result.data.cageCode || 'N/A'}</p>
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-gray-600">Entity Structure</Label>
                        <p>{result.data.entityStructure}</p>
                      </div>
                    </div>
                  </div>

                  {/* Registration Status */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Registration Status
                    </h3>
                    
                    <div className="space-y-2">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Status</Label>
                        <Badge className="bg-green-100 text-green-800 border-0">
                          {result.data.registrationStatus}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Registration Date</Label>
                          <p className="text-sm">{formatDate(result.data.registrationDate)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Expiration Date</Label>
                          <p className="text-sm">{formatDate(result.data.expirationDate)}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                          <p className="text-sm">{formatDate(result.data.lastUpdateDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4" />
                    Physical Address
                  </h3>
                  <p>{formatAddress(result.data.physicalAddress)}</p>
                </div>

                {/* Socioeconomic Categories */}
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2 mb-3">
                    <Award className="h-4 w-4" />
                    Business Classifications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getSocioeconomicBadges(result.data.socioeconomicCategories).map((badge, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* NAICS Codes */}
                {result.data.naicsCodes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">NAICS Codes</h3>
                    <div className="space-y-2">
                      {result.data.naicsCodes.slice(0, 3).map((naics, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-mono text-sm font-medium">{naics.code}</span>
                            {naics.isPrimary && (
                              <Badge className="ml-2 bg-green-100 text-green-800 border-0 text-xs">
                                Primary
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 flex-1 ml-4">
                            {naics.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Points of Contact */}
                {result.data.pointsOfContact.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Points of Contact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {result.data.pointsOfContact.slice(0, 2).map((contact, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded">
                          <div className="font-medium">
                            {contact.firstName} {contact.lastName}
                          </div>
                          {contact.title && (
                            <div className="text-sm text-gray-600">{contact.title}</div>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            {contact.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {contact.email}
                              </div>
                            )}
                            {contact.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {contact.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}