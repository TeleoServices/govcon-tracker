"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Search, Filter, Calendar, DollarSign, Undo2 } from "lucide-react"
import { ContractForm } from "@/components/contracts/contract-form"
import { useContracts } from "@/hooks/use-data"
import { type ContractFormData } from "@/lib/validation"
import { format } from "date-fns"

export default function ContractsPage() {
  const { contracts, loading, error, refetch } = useContracts()
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingContract, setEditingContract] = useState<any>(null)

  const filteredContracts = useMemo(() => {
    if (!searchTerm) return contracts
    
    const term = searchTerm.toLowerCase()
    return contracts.filter(contract => 
      contract.title.toLowerCase().includes(term) ||
      contract.contractNumber.toLowerCase().includes(term) ||
      contract.agency.toLowerCase().includes(term) ||
      contract.vendor?.name?.toLowerCase().includes(term)
    )
  }, [contracts, searchTerm])

  const handleAddContract = async (data: ContractFormData) => {
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
      
      if (!response.ok) throw new Error('Failed to add contract')
      
      await refetch()
      setShowAddDialog(false)
    } catch (error) {
      console.error('Error adding contract:', error)
      alert('Failed to add contract')
    }
  }

  const handleUpdateContract = async (data: ContractFormData) => {
    if (!editingContract) return
    
    try {
      const response = await fetch(`/api/contracts/${editingContract.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
        }),
      })
      
      if (!response.ok) throw new Error('Failed to update contract')
      
      await refetch()
      setEditingContract(null)
    } catch (error) {
      console.error('Error updating contract:', error)
      alert('Failed to update contract')
    }
  }

  const handleRevertToOpportunity = async (contract: any) => {
    if (!confirm(`Are you sure you want to revert "${contract.title}" back to an opportunity? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch('/api/contracts/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: contract.id }),
      })
      
      if (!response.ok) throw new Error('Failed to revert contract')
      
      await refetch()
      alert('Contract successfully reverted to opportunity! You can view it in the Opportunities tab.')
    } catch (error) {
      console.error('Error reverting contract:', error)
      alert('Failed to revert contract to opportunity')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const mockContracts = [
    {
      id: "1",
      contractNumber: "W52P1J-24-C-0001",
      title: "IT Support Services",
      agency: "Department of Defense",
      vendor: { name: "Tech Solutions Inc." },
      value: 450000,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      status: "ACTIVE",
      type: "FIRM_FIXED_PRICE",
    },
    {
      id: "2",
      contractNumber: "W52P1J-24-C-0002",
      title: "Facility Maintenance",
      agency: "General Services Admin",
      vendor: { name: "BuildCorp Services" },
      value: 280000,
      startDate: new Date("2024-02-15"),
      endDate: new Date("2025-03-15"),
      status: "ACTIVE",
      type: "TIME_AND_MATERIALS",
    },
    {
      id: "3",
      contractNumber: "W52P1J-24-C-0003",
      title: "Security Services",
      agency: "Department of Homeland Security",
      vendor: { name: "SecureGuard LLC" },
      value: 625000,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      status: "PENDING",
      type: "IDIQ",
    },
  ]

  const displayContracts = filteredContracts.length > 0 ? filteredContracts : mockContracts

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contracts</h2>
          <p className="text-muted-foreground">
            Manage and track your government contracts
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Contract
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contracts..."
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

      {loading && <p>Loading contracts...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="grid gap-4">
        {displayContracts.map((contract: any) => (
          <Card key={contract.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{contract.title}</CardTitle>
                  <CardDescription>Contract #{contract.contractNumber}</CardDescription>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(contract.status)}`}>
                  {contract.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vendor</p>
                  <p className="text-sm">{contract.vendor?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Agency</p>
                  <p className="text-sm">{contract.agency}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Value</p>
                  <p className="text-sm font-medium flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {formatCurrency(contract.value)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                  <p className="text-sm flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(contract.startDate), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">End Date</p>
                  <p className="text-sm flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(contract.endDate), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
              {contract.type && (
                <div className="mt-3 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">Type: </span>
                  <span className="text-xs font-medium">
                    {contract.type.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t mt-3">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRevertToOpportunity(contract)
                    }}
                  >
                    <Undo2 className="mr-2 h-3 w-3" />
                    Revert to Opportunity
                  </Button>
                </div>
                <Button 
                  size="sm"
                  onClick={() => setEditingContract(contract)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Contract</DialogTitle>
            <DialogDescription>
              Enter contract details to add it to the tracking system.
            </DialogDescription>
          </DialogHeader>
          <ContractForm 
            onSubmit={handleAddContract}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingContract} onOpenChange={(open) => !open && setEditingContract(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Contract</DialogTitle>
            <DialogDescription>
              Update contract information.
            </DialogDescription>
          </DialogHeader>
          {editingContract && (
            <ContractForm 
              contract={editingContract}
              onSubmit={handleUpdateContract}
              onCancel={() => setEditingContract(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}