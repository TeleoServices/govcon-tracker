"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Search, Filter, Phone, Mail, Globe, User } from "lucide-react"
import { ContactLogForm } from "@/components/contact-logs/contact-log-form"
import { useContactLogs } from "@/hooks/use-data"
import { type ContactLogFormData } from "@/lib/validation"
import { format } from "date-fns"
import { ContactMethod, ContactStatus } from "@/types"

export default function ContactLogPage() {
  const { contactLogs, loading, error, refetch } = useContactLogs()
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingContactLog, setEditingContactLog] = useState<any>(null)

  const filteredContactLogs = useMemo(() => {
    if (!searchTerm) return contactLogs
    
    const term = searchTerm.toLowerCase()
    return contactLogs.filter(log => 
      log.subcontractor?.company?.toLowerCase().includes(term) ||
      log.subcontractor?.name?.toLowerCase().includes(term) ||
      log.opportunity?.title?.toLowerCase().includes(term) ||
      log.opportunity?.solNo?.toLowerCase().includes(term) ||
      log.method.toLowerCase().includes(term) ||
      log.status.toLowerCase().includes(term) ||
      log.notes?.toLowerCase().includes(term)
    )
  }, [contactLogs, searchTerm])

  const handleAddContactLog = async (data: ContactLogFormData) => {
    try {
      const response = await fetch('/api/contact-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error('Failed to log contact')
      
      await refetch()
      setShowAddDialog(false)
    } catch (error) {
      console.error('Error logging contact:', error)
      alert('Failed to log contact')
    }
  }

  const handleUpdateContactLog = async (data: ContactLogFormData) => {
    if (!editingContactLog) return
    
    try {
      const response = await fetch(`/api/contact-logs/${editingContactLog.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error('Failed to update contact log')
      
      await refetch()
      setEditingContactLog(null)
    } catch (error) {
      console.error('Error updating contact log:', error)
      alert('Failed to update contact log')
    }
  }

  const getMethodIcon = (method: ContactMethod) => {
    switch (method) {
      case ContactMethod.EMAIL: return <Mail className="h-4 w-4" />
      case ContactMethod.PHONE: return <Phone className="h-4 w-4" />
      case ContactMethod.PORTAL: return <Globe className="h-4 w-4" />
      case ContactMethod.IN_PERSON: return <User className="h-4 w-4" />
      default: return <Mail className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: ContactStatus) => {
    switch (status) {
      case ContactStatus.AWAITING_REPLY: return 'bg-yellow-100 text-yellow-800'
      case ContactStatus.QUOTE_REQUESTED: return 'bg-blue-100 text-blue-800'
      case ContactStatus.QUOTE_RECEIVED: return 'bg-green-100 text-green-800'
      case ContactStatus.DECLINED: return 'bg-red-100 text-red-800'
      case ContactStatus.NO_RESPONSE: return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const mockContactLogs = [
    {
      id: "1",
      subcontractor: { company: "Tech Solutions Inc.", name: "John Smith" },
      opportunity: { solNo: "FA8773-24-R-0015", title: "Cloud Infrastructure" },
      date: new Date("2025-01-08"),
      method: "EMAIL" as ContactMethod,
      status: "QUOTE_REQUESTED" as ContactStatus,
      notes: "Sent RFQ for cloud infrastructure services. Expecting response by Friday.",
    },
    {
      id: "2", 
      subcontractor: { company: "BuildCorp Services", name: "Sarah Johnson" },
      opportunity: { solNo: "W91QF1-24-R-0008", title: "Professional Training" },
      date: new Date("2025-01-07"),
      method: "PHONE" as ContactMethod,
      status: "QUOTE_RECEIVED" as ContactStatus,
      notes: "Received verbal quote of $125k. Written quote to follow by Monday.",
    },
    {
      id: "3",
      subcontractor: { company: "SecureGuard LLC", name: "Mike Chen" },
      opportunity: { solNo: "HSHQDC-24-R-00012", title: "Cybersecurity Assessment" },
      date: new Date("2025-01-06"),
      method: "PORTAL" as ContactMethod,
      status: "AWAITING_REPLY" as ContactStatus,
      notes: "Posted teaming opportunity on company portal. Waiting for interest confirmation.",
    },
  ]

  const displayContactLogs = filteredContactLogs.length > 0 ? filteredContactLogs : mockContactLogs

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contact Log</h2>
          <p className="text-muted-foreground">
            Track all subcontractor outreach and communications
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Log Contact
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contact logs..."
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

      {loading && <p>Loading contact logs...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      <div className="grid gap-4">
        {displayContactLogs.map((log: any) => (
          <Card key={log.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setEditingContactLog(log)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getMethodIcon(log.method)}
                    {log.subcontractor?.company} - {log.subcontractor?.name}
                  </CardTitle>
                  <CardDescription>
                    {log.opportunity?.solNo} - {log.opportunity?.title}
                  </CardDescription>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(log.status)}`}>
                  {log.status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Contact Date:</span>
                  <span className="font-medium">{format(new Date(log.date), "MMM dd, yyyy")}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-medium capitalize">{log.method.replace(/_/g, ' ').toLowerCase()}</span>
                </div>

                {log.notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Notes:</p>
                    <p className="text-sm">{log.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Log New Contact</DialogTitle>
            <DialogDescription>
              Record outreach to a subcontractor for a specific opportunity.
            </DialogDescription>
          </DialogHeader>
          <ContactLogForm 
            onSubmit={handleAddContactLog}
            onCancel={() => setShowAddDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingContactLog} onOpenChange={(open) => !open && setEditingContactLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Contact Log</DialogTitle>
            <DialogDescription>
              Update contact log information.
            </DialogDescription>
          </DialogHeader>
          {editingContactLog && (
            <ContactLogForm 
              contactLog={editingContactLog}
              onSubmit={handleUpdateContactLog}
              onCancel={() => setEditingContactLog(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}