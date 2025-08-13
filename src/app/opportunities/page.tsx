"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tooltip } from "@/components/ui/tooltip"
import { Plus, Search, Filter, ExternalLink, Calendar, DollarSign, AlertCircle, FileText } from "lucide-react"
import { OpportunityForm } from "@/components/opportunities/opportunity-form"
import { StageManagement } from "@/components/opportunities/stage-management"
import { ContractForm } from "@/components/contracts/contract-form"
import { useOpportunities } from "@/hooks/use-data"
import { type OpportunityFormData, type ContractFormData } from "@/lib/validation"
import { format, differenceInDays } from "date-fns"
import { 
  OpportunityStage, 
  Priority, 
  ContractStatus,
  Contract,
  getStageColor, 
  getStageProgress, 
  getPriorityColor, 
  getDaysRemaining,
  getStageDescription
} from "@/types"

export default function OpportunitiesPage() {
  const { opportunities, loading, error, refetch } = useOpportunities()
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingOpportunity, setEditingOpportunity] = useState<any>(null)
  const [creatingContract, setCreatingContract] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    stage: "",
    priority: "",
    agency: "",
    type: "",
    status: ""
  })

  const filteredOpportunities = useMemo(() => {
    let filtered = opportunities
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(opp => 
        opp.title.toLowerCase().includes(term) ||
        opp.solNo.toLowerCase().includes(term) ||
        opp.agency.toLowerCase().includes(term) ||
        opp.stage.toLowerCase().includes(term)
      )
    }
    
    // Apply stage filter
    if (filters.stage) {
      filtered = filtered.filter(opp => opp.stage === filters.stage)
    }
    
    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter(opp => opp.priority === filters.priority)
    }
    
    // Apply agency filter
    if (filters.agency) {
      filtered = filtered.filter(opp => opp.agency === filters.agency)
    }
    
    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(opp => opp.type === filters.type)
    }
    
    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(opp => opp.status === filters.status)
    }
    
    return filtered
  }, [opportunities, searchTerm, filters])

  // Get unique values for filter dropdowns
  const uniqueStages = useMemo(() => 
    Array.from(new Set(opportunities.map(opp => opp.stage))).sort(), 
    [opportunities]
  )
  const uniquePriorities = useMemo(() => 
    Array.from(new Set(opportunities.map(opp => opp.priority))).sort(), 
    [opportunities]
  )
  const uniqueAgencies = useMemo(() => 
    Array.from(new Set(opportunities.map(opp => opp.agency))).sort(), 
    [opportunities]
  )
  const uniqueTypes = useMemo(() => 
    Array.from(new Set(opportunities.map(opp => opp.type))).sort(), 
    [opportunities]
  )
  const uniqueStatuses = useMemo(() => 
    Array.from(new Set(opportunities.map(opp => opp.status))).sort(), 
    [opportunities]
  )

  const clearFilters = () => {
    setFilters({
      stage: "",
      priority: "",
      agency: "",
      type: "",
      status: ""
    })
  }

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
      
      await refetch()
      setShowAddDialog(false)
    } catch (error) {
      console.error('Error adding opportunity:', error)
      alert('Failed to add opportunity')
    }
  }

  const handleUpdateOpportunity = async (data: OpportunityFormData) => {
    if (!editingOpportunity) return
    
    try {
      const response = await fetch(`/api/opportunities/${editingOpportunity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          postedDate: new Date(data.postedDate).toISOString(),
          dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        }),
      })
      
      if (!response.ok) throw new Error('Failed to update opportunity')
      
      await refetch()
      setEditingOpportunity(null)
    } catch (error) {
      console.error('Error updating opportunity:', error)
      alert('Failed to update opportunity')
    }
  }

  const handleStageChange = async (opportunityId: string, newStage: OpportunityStage) => {
    try {
      const opportunity = opportunities.find(opp => opp.id === opportunityId)
      if (!opportunity) return

      const response = await fetch(`/api/opportunities/${opportunityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...opportunity,
          stage: newStage,
        }),
      })
      
      if (!response.ok) throw new Error('Failed to update stage')
      
      await refetch()
    } catch (error) {
      console.error('Error updating stage:', error)
      alert('Failed to update stage')
    }
  }

  const handleCreateContract = async (data: ContractFormData) => {
    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
        }),
      })
      
      if (!response.ok) throw new Error('Failed to create contract')
      
      // Successfully created contract
      alert('Contract created successfully! You can view it in the Contracts tab.')
      setCreatingContract(null)
      
      // Optionally update the opportunity stage to mark it as contracted
      // await handleStageChange(creatingContract.id, OpportunityStage.AWARDED)
      
    } catch (error) {
      console.error('Error creating contract:', error)
      alert('Failed to create contract')
    }
  }

  const getUrgencyIndicator = (dueDate: Date | null) => {
    if (!dueDate) return { label: 'No deadline', color: 'text-gray-500' }
    
    const days = getDaysRemaining(dueDate)
    if (days === null) return { label: 'No deadline', color: 'text-gray-500' }
    if (days < 0) return { label: 'Past due', color: 'text-red-600' }
    if (days <= 3) return { label: 'Due soon', color: 'text-red-600' }
    if (days <= 7) return { label: `${days} days left`, color: 'text-orange-600' }
    return { label: `${days} days left`, color: 'text-green-600' }
  }

  const formatCurrency = (value: number | null) => {
    if (!value) return "TBD"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

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

  const mockOpportunities = [
    {
      id: "1",
      solNo: "FA8773-24-R-0015",
      title: "Cloud Infrastructure Modernization",
      agency: "Air Force",
      stage: "CAPTURE" as OpportunityStage,
      priority: "HIGH" as Priority,
      dueDate: new Date("2025-01-15"),
      estimatedValue: 1500000,
      type: "RFP",
      status: "OPEN",
      samUrl: "https://sam.gov/opp/123456",
    },
    {
      id: "2",
      solNo: "HSHQDC-24-R-00012",
      title: "Cybersecurity Assessment Services",
      agency: "DHS - CISA",
      stage: "PURSUIT" as OpportunityStage,
      priority: "MEDIUM" as Priority,
      dueDate: new Date("2025-01-20"),
      estimatedValue: null,
      type: "RFQ",
      status: "OPEN",
      setAside: "Small Business",
      samUrl: "https://sam.gov/opp/123457",
    },
    {
      id: "3",
      solNo: "W91QF1-24-R-0008",
      title: "Professional Training Services",
      agency: "Army - TRADOC",
      stage: "PROPOSAL_DEVELOPMENT" as OpportunityStage,
      priority: "LOW" as Priority,
      dueDate: new Date("2025-01-25"),
      estimatedValue: 750000,
      type: "SOURCES_SOUGHT",
      status: "OPEN",
      samUrl: "https://sam.gov/opp/123458",
    },
  ]

  // Use real data if available, otherwise show mock data during loading
  const displayOpportunities = !loading && opportunities.length > 0 
    ? filteredOpportunities 
    : (loading ? [] : mockOpportunities)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Opportunities</h2>
          <p className="text-muted-foreground">
            Track government contracting opportunities through each stage
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Opportunity
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search opportunities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Stage</label>
              <select
                value={filters.stage}
                onChange={(e) => setFilters({...filters, stage: e.target.value})}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Stages</option>
                {uniqueStages.map(stage => (
                  <option key={stage} value={stage}>{getStageDisplayName(stage as OpportunityStage)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Priorities</option>
                {uniquePriorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Agency</label>
              <select
                value={filters.agency}
                onChange={(e) => setFilters({...filters, agency: e.target.value})}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Agencies</option>
                {uniqueAgencies.map(agency => (
                  <option key={agency} value={agency}>{agency}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(false)}>
              Hide Filters
            </Button>
          </div>
        </Card>
      )}

      {loading && <p>Loading opportunities...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {/* Results count */}
      {!loading && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {displayOpportunities.length} of {opportunities.length} opportunities
          </span>
          {(Object.values(filters).some(f => f !== "") || searchTerm) && (
            <Button variant="ghost" size="sm" onClick={() => {setSearchTerm(""); clearFilters()}}>
              Clear all filters
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-4">
        {displayOpportunities.map((opportunity: any) => {
          const urgency = getUrgencyIndicator(opportunity.dueDate)
          const progress = getStageProgress(opportunity.stage)
          
          return (
            <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3">
                      <span>{opportunity.title}</span>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(opportunity.priority)}`}>
                        {opportunity.priority}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      {opportunity.solNo} • {opportunity.agency}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {urgency.label === 'Due soon' && (
                      <AlertCircle className={`h-4 w-4 ${urgency.color}`} />
                    )}
                    <StageManagement 
                      currentStage={opportunity.stage}
                      onStageChange={(newStage) => handleStageChange(opportunity.id, newStage)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-medium">{progress}% complete</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <p className="text-sm">{opportunity.type.replace(/_/g, ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Est. Value</p>
                      <p className="text-sm font-medium">
                        {opportunity.estimatedValue ? (
                          <span className="flex items-center">
                            <DollarSign className="h-3 w-3 mr-1" />
                            {formatCurrency(opportunity.estimatedValue)}
                          </span>
                        ) : (
                          "TBD"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                      <p className={`text-sm flex items-center gap-1 font-medium ${urgency.color}`}>
                        <Calendar className="h-3 w-3" />
                        {opportunity.dueDate 
                          ? format(new Date(opportunity.dueDate), "MMM dd, yyyy")
                          : "No deadline"
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <p className={`text-xs font-medium ${urgency.color}`}>
                        {urgency.label}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex gap-2">
                      {opportunity.samUrl && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(opportunity.samUrl, '_blank')
                          }}
                        >
                          <ExternalLink className="mr-2 h-3 w-3" />
                          View on SAM.gov
                        </Button>
                      )}
                      {opportunity.stage === OpportunityStage.AWARDED && (
                        <Button 
                          size="sm" 
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            setCreatingContract(opportunity)
                          }}
                        >
                          <FileText className="mr-2 h-3 w-3" />
                          Create Contract
                        </Button>
                      )}
                      <Button 
                        size="sm"
                        onClick={() => setEditingOpportunity(opportunity)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

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

      <Dialog open={!!editingOpportunity} onOpenChange={(open) => !open && setEditingOpportunity(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Opportunity</DialogTitle>
            <DialogDescription>
              Update opportunity information and manage stage progression.
            </DialogDescription>
          </DialogHeader>
          {editingOpportunity && (
            <OpportunityForm 
              opportunity={editingOpportunity}
              onSubmit={handleUpdateOpportunity}
              onCancel={() => setEditingOpportunity(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Contract Dialog */}
      <Dialog open={!!creatingContract} onOpenChange={(open) => !open && setCreatingContract(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Contract from Opportunity</DialogTitle>
            <DialogDescription>
              Convert the awarded opportunity "{creatingContract?.title}" into a contract for tracking.
            </DialogDescription>
          </DialogHeader>
          {creatingContract && (
            <ContractForm 
              contract={{
                contractNumber: creatingContract.solNo,
                title: creatingContract.title,
                description: creatingContract.description || "",
                agency: creatingContract.agency,
                value: creatingContract.estimatedValue || 0,
                type: creatingContract.type,
                setAside: creatingContract.setAside,
                naicsCode: creatingContract.naics,
                popLocation: creatingContract.placeOfPerformance,
                status: ContractStatus.ACTIVE,
                startDate: new Date(), // Default to today
                endDate: new Date(), // User will fill this
                vendorId: creatingContract.vendorId || "",
                // Required but not relevant for pre-filling
                id: "",
                contactName: "",
                contactEmail: "",
                contactPhone: "",
                notes: "",
                createdAt: new Date(),
                updatedAt: new Date()
              } as Contract}
              onSubmit={handleCreateContract}
              onCancel={() => setCreatingContract(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}