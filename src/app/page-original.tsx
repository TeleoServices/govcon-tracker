"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tooltip } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Activity, Briefcase, Building2, TrendingUp, Phone, Mail, Globe, Plus, Calendar, AlertCircle, Eye } from "lucide-react"
import { useOpportunities, useVendors, useContactLogs } from "@/hooks/use-data"
import { useRouter } from "next/navigation"
import { 
  OpportunityStage, 
  ContactMethod,
  getStageColor, 
  getStageProgress, 
  getDaysRemaining,
  getStageDescription
} from "@/types"
import { format } from "date-fns"
import { OpportunityForm } from "@/components/opportunities/opportunity-form"
import { ContactLogForm } from "@/components/contact-logs/contact-log-form"
import { type OpportunityFormData, type ContactLogFormData } from "@/lib/validation"

export default function Home() {
  const router = useRouter()
  const { opportunities, refetch: refetchOpportunities } = useOpportunities()
  const { vendors } = useVendors()
  const { contactLogs, refetch: refetchContactLogs } = useContactLogs()
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showLogContactDialog, setShowLogContactDialog] = useState(false)
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null)
  const [phoneTooltip, setPhoneTooltip] = useState<{ [key: string]: boolean }>({}) 

  const mockOpportunities = [
    {
      id: "1",
      solNo: "FA8773-24-R-0015",
      title: "Cloud Infrastructure",
      stage: "CAPTURE" as OpportunityStage,
      dueDate: new Date("2025-01-15"),
      priority: "HIGH",
    },
    {
      id: "2", 
      solNo: "HSHQDC-24-R-00012",
      title: "Cybersecurity Assessment",
      stage: "PURSUIT" as OpportunityStage,
      dueDate: new Date("2025-01-20"),
      priority: "MEDIUM",
    },
    {
      id: "3",
      solNo: "W91QF1-24-R-0008", 
      title: "Professional Training",
      stage: "PROPOSAL_DEVELOPMENT" as OpportunityStage,
      dueDate: new Date("2025-01-25"),
      priority: "LOW",
    },
  ]

  const mockContactLogs = [
    {
      id: "1",
      subcontractor: { company: "Tech Solutions Inc.", name: "John Smith" },
      opportunity: { solNo: "FA8773-24-R-0015", title: "Cloud Infrastructure" },
      date: new Date("2025-01-08"),
      method: "EMAIL" as ContactMethod,
      status: "QUOTE_REQUESTED",
    },
    {
      id: "2",
      subcontractor: { company: "BuildCorp Services", name: "Sarah Johnson" },
      opportunity: { solNo: "W91QF1-24-R-0008", title: "Professional Training" },
      date: new Date("2025-01-07"),
      method: "PHONE" as ContactMethod,
      status: "QUOTE_RECEIVED",
    },
  ]

  const mockVendors = [
    {
      id: "1",
      company: "Tech Solutions Inc.",
      name: "John Smith",
      contactEmail: "john@techsolutions.com",
      contactPhone: "(555) 123-4567",
    },
    {
      id: "2",
      company: "BuildCorp Services", 
      name: "Sarah Johnson",
      contactEmail: "sarah@buildcorp.com",
      contactPhone: "(555) 987-6543",
    },
  ]

  // Use real data if available and not loading, otherwise show mock data
  const displayOpportunities = opportunities.length > 0 ? opportunities : mockOpportunities
  const displayContactLogs = contactLogs.length > 0 ? contactLogs : mockContactLogs
  const displayVendors = vendors.length > 0 ? vendors : mockVendors

  const handleAddOpportunity = async (data: OpportunityFormData) => {
    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          postedDate: new Date(data.postedDate).toISOString(),
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        }),
      })
      
      if (!response.ok) throw new Error('Failed to add opportunity')
      
      await refetchOpportunities()
      setShowAddDialog(false)
    } catch (error) {
      console.error('Error adding opportunity:', error)
      alert('Failed to add opportunity')
    }
  }

  const handleLogContact = async (data: ContactLogFormData) => {
    try {
      const response = await fetch('/api/contact-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error('Failed to log contact')
      
      await refetchContactLogs()
      setShowLogContactDialog(false)
    } catch (error) {
      console.error('Error logging contact:', error)
      alert('Failed to log contact')
    }
  }

  // Calculate stage counts
  const stageCounts = useMemo(() => {
    const counts = {
      IDENTIFIED: 0,
      PURSUIT: 0,
      CAPTURE: 0,
      PROPOSAL_DEVELOPMENT: 0,
      SUBMITTED: 0,
      AWARDED: 0,
      LOST: 0,
    }
    
    displayOpportunities.forEach(opp => {
      if (counts.hasOwnProperty(opp.stage)) {
        counts[opp.stage as OpportunityStage]++
      }
    })
    
    return counts
  }, [displayOpportunities])

  const getStageDisplayName = (stage: OpportunityStage): string => {
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

  const getMethodIcon = (method: ContactMethod) => {
    switch (method) {
      case ContactMethod.EMAIL: return <Mail className="h-3 w-3" />
      case ContactMethod.PHONE: return <Phone className="h-3 w-3" />
      case ContactMethod.PORTAL: return <Globe className="h-3 w-3" />
      default: return <Mail className="h-3 w-3" />
    }
  }

  const getUrgencyColor = (dueDate: Date | null) => {
    if (!dueDate) return 'text-gray-500'
    const days = getDaysRemaining(dueDate)
    if (days === null) return 'text-gray-500'
    if (days < 0) return 'text-red-600'
    if (days <= 3) return 'text-red-600'
    if (days <= 7) return 'text-orange-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-blue-900">Dashboard</h2>
            <p className="text-blue-700">
              TELEO Services Contract Management - Overview of your government contracting pipeline
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-600">Welcome to</p>
            <p className="text-lg font-semibold text-blue-900">TELEO Services Platform</p>
          </div>
        </div>
      </div>

      {/* Stage Chips */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Opportunity Stages</h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(stageCounts).map(([stage, count]) => (
            <Tooltip key={stage} content={getStageDescription(stage as OpportunityStage)} position="bottom">
              <div 
                className={`rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 cursor-help ${getStageColor(stage as OpportunityStage)}`}
              >
                <span>{getStageDisplayName(stage as OpportunityStage)}</span>
                <span className="bg-black/10 rounded-full px-2 py-0.5 text-xs">
                  {count}
                </span>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Active Opportunities Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Active Opportunities</h3>
          <Button variant="outline" size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Opportunity
          </Button>
        </div>
        
        <div className="grid gap-3">
          {displayOpportunities.slice(0, 5).map((opp: any) => {
            const progress = getStageProgress(opp.stage)
            const urgencyColor = getUrgencyColor(opp.dueDate)
            const daysRemaining = opp.dueDate ? getDaysRemaining(opp.dueDate) : null
            
            return (
              <Card key={opp.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{opp.title}</h4>
                      <Tooltip content={getStageDescription(opp.stage)} position="top">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium cursor-help ${getStageColor(opp.stage)}`}>
                          {getStageDisplayName(opp.stage)}
                        </span>
                      </Tooltip>
                    </div>
                    <p className="text-sm text-muted-foreground">{opp.solNo}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {opp.dueDate ? (
                      <div className={`text-sm font-medium ${urgencyColor}`}>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(opp.dueDate), "MMM dd")}
                        </div>
                        <div className="text-xs">
                          {daysRemaining !== null && daysRemaining >= 0 
                            ? `${daysRemaining} days left`
                            : 'Past due'
                          }
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No deadline</div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent Subcontractor Contacts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Subcontractor Contacts</h3>
            <Button variant="outline" size="sm" onClick={() => setShowLogContactDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Log Contact
            </Button>
          </div>
          
          <div className="space-y-3">
            {displayContactLogs.slice(0, 5).map((log: any) => (
              <Card key={log.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getMethodIcon(log.method)}
                      <span className="font-medium">{log.subcontractor?.company}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(log.date), "MMM dd")}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {log.opportunity?.solNo} - {log.opportunity?.title}
                  </p>
                  <span className="inline-block rounded-full bg-blue-100 text-blue-800 px-2 py-1 text-xs font-medium">
                    {log.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Access Subcontractors */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Access Subcontractors</h3>
          
          <div className="space-y-3">
            {displayVendors.slice(0, 6).map((vendor: any) => (
              <Card key={vendor.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{vendor.company}</h4>
                    <p className="text-sm text-muted-foreground">{vendor.name}</p>
                  </div>
                  <div className="flex gap-1">
                    {vendor.contactEmail && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="p-1 h-auto"
                        onClick={() => window.open(`mailto:${vendor.contactEmail}`, '_blank')}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                    {vendor.contactPhone && (
                      <Tooltip 
                        content={vendor.contactPhone}
                        show={phoneTooltip[vendor.id]}
                      >
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="p-1 h-auto"
                          onClick={() => setPhoneTooltip(prev => ({ ...prev, [vendor.id]: !prev[vendor.id] }))}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => {
                      setSelectedVendorId(vendor.id)
                      setShowLogContactDialog(true)
                    }}
                  >
                    Log Contact
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-xs"
                    onClick={() => router.push(`/vendors?id=${vendor.id}`)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Add Opportunity Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Opportunity</DialogTitle>
            <DialogDescription>
              Enter opportunity details to track it through the capture process.
            </DialogDescription>
          </DialogHeader>
          <OpportunityForm 
            onSubmit={handleAddOpportunity}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Log Contact Dialog */}
      <Dialog open={showLogContactDialog} onOpenChange={setShowLogContactDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Log New Contact</DialogTitle>
            <DialogDescription>
              Record outreach to a subcontractor for a specific opportunity.
            </DialogDescription>
          </DialogHeader>
          <ContactLogForm 
            onSubmit={handleLogContact}
            onCancel={() => {
              setShowLogContactDialog(false)
              setSelectedVendorId(null)
            }}
            defaultVendorId={selectedVendorId}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}