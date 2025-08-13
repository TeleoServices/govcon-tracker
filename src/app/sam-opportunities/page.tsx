"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Search, 
  RefreshCw as Sync, 
  Filter, 
  ExternalLink, 
  Calendar, 
  Building, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Plus
} from "lucide-react"

interface SAMOpportunity {
  notice_id: string
  title: string
  solicitation_number?: string
  description?: string
  opportunity_type?: string
  active: boolean
  posted_date: string
  response_deadline?: string | null
  award_date?: string | null
  award_amount?: number | null
  award_number?: string | null
  department_name?: string
  office_name?: string | null
  location?: string | null
  zip_code?: string | null
  naics_code?: string | null
  classification_code?: string | null
  set_aside_description?: string | null
  ui_link?: string | null
  created_at?: string
  updated_at?: string
}

interface PaginationInfo {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface SyncStats {
  lastSyncAt: string | null
  totalOpportunities: number
  activeOpportunities: number
  isRunning: boolean
  lastError: string | null
  progress?: {
    current: number
    total: number
    percentage: number
  }
}

export default function SAMOpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<SAMOpportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null)
  const [lastSyncCompleted, setLastSyncCompleted] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 25,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [naicsCode, setNaicsCode] = useState("")
  const [activeOnly, setActiveOnly] = useState(true)
  const [state, setState] = useState("")
  const [setAsideType, setSetAsideType] = useState("all")
  const [postedDateFrom, setPostedDateFrom] = useState("")
  const [postedDateTo, setPostedDateTo] = useState("")
  const [responseDueFrom, setResponseDueFrom] = useState("")
  const [responseDueTo, setResponseDueTo] = useState("")

  // Sync dialog states
  const [syncDialogOpen, setSyncDialogOpen] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [syncDateFrom, setSyncDateFrom] = useState(() => {
    // Default to 7 days ago from today (August 2025)
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date.toISOString().split('T')[0]
  })
  const [syncDateTo, setSyncDateTo] = useState(() => {
    // Default to yesterday (data is usually a day behind)
    const date = new Date()
    date.setDate(date.getDate() - 1)
    return date.toISOString().split('T')[0]
  })
  const [syncActiveOnly, setSyncActiveOnly] = useState(true)
  const [syncResponseDueDateFrom, setSyncResponseDueDateFrom] = useState("")
  const [syncResponseDueDateTo, setSyncResponseDueDateTo] = useState("")
  
  // Conversion states
  const [convertingIds, setConvertingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchOpportunities()
    fetchSyncStats()
  }, [])

  const fetchOpportunities = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.pageSize.toString(),
        activeOnly: activeOnly.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(naicsCode && { naicsCode }),
        ...(state && { state }),
        ...(setAsideType && setAsideType !== 'all' && { setAsideType }),
        ...(postedDateFrom && { postedDateFrom }),
        ...(postedDateTo && { postedDateTo }),
        ...(responseDueFrom && { responseDueFrom }),
        ...(responseDueTo && { responseDueTo })
      })

      const response = await fetch(`/api/sam-opportunities?${params}`)
      const data = await response.json()

      if (data.success) {
        setOpportunities(data.data)
        setPagination(data.pagination)
      } else {
        console.error('Failed to fetch opportunities:', data.error)
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSyncStats = async () => {
    try {
      const response = await fetch('/api/sam-sync/stats')
      const data = await response.json()
      
      if (data.success) {
        setSyncStats(data.data)
      } else {
        // Set default stats if API fails
        setSyncStats({
          lastSyncAt: null,
          totalOpportunities: 0,
          activeOpportunities: 0,
          isRunning: false,
          lastError: data.error || 'Database tables not yet created'
        })
      }
    } catch (error) {
      console.error('Error fetching sync stats:', error)
      // Set default stats if request fails
      setSyncStats({
        lastSyncAt: null,
        totalOpportunities: 0,
        activeOpportunities: 0,
        isRunning: false,
        lastError: 'Failed to connect to database'
      })
    }
  }

  const handleSearch = () => {
    setSearching(true)
    fetchOpportunities(1).finally(() => setSearching(false))
  }

  const handleSync = async () => {
    if (!syncDateFrom || !syncDateTo) {
      alert('Please select both start and end dates for sync')
      return
    }

    // Convert dates from yyyy-MM-dd to MM/dd/yyyy format
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr + 'T00:00:00') // Add time to avoid timezone issues
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${month}/${day}/${year}`
    }

    const formattedDateFrom = formatDate(syncDateFrom)
    const formattedDateTo = formatDate(syncDateTo)
    
    console.log('Original dates:', { syncDateFrom, syncDateTo })
    console.log('Formatted dates:', { formattedDateFrom, formattedDateTo })

    setSyncLoading(true)
    try {
      const response = await fetch('/api/sam-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dateFrom: formattedDateFrom,
          dateTo: formattedDateTo,
          activeOnly: syncActiveOnly,
          ...(naicsCode && { naicsCode }),
          ...(state && { state }),
          ...(setAsideType && setAsideType !== 'all' && { setAsideType }),
          ...(syncResponseDueDateFrom && { responseDueDateFrom: formatDate(syncResponseDueDateFrom) }),
          ...(syncResponseDueDateTo && { responseDueDateTo: formatDate(syncResponseDueDateTo) })
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSyncDialogOpen(false)
        setLastSyncCompleted(null) // Reset completion status
        
        // Start monitoring immediately without alert
        // Start polling for completion
        const pollForCompletion = async () => {
          const checkInterval = setInterval(async () => {
            try {
              const statsResponse = await fetch('/api/sam-sync/stats')
              const statsData = await statsResponse.json()
              
              if (statsData.success) {
                setSyncStats(statsData.data)
                
                // Check if sync completed - more reliable logic
                if (!statsData.data.isRunning) {
                  // If we were previously running and now we're not, sync completed
                  if (syncStats?.isRunning && statsData.data.lastSyncAt) {
                    setLastSyncCompleted(statsData.data.lastSyncAt)
                    fetchOpportunities() // Refresh opportunities
                    clearInterval(checkInterval)
                  }
                  // If sync never started running, stop polling after 30 seconds
                  else if (!syncStats?.isRunning) {
                    clearInterval(checkInterval)
                  }
                }
              }
            } catch (error) {
              console.error('Error checking sync status:', error)
            }
          }, 3000) // Check every 3 seconds
          
          // Stop polling after 5 minutes
          setTimeout(() => {
            clearInterval(checkInterval)
          }, 300000)
        }
        
        pollForCompletion()
      } else {
        alert(`Sync failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Sync error:', error)
      alert('Failed to start sync')
    } finally {
      setSyncLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const handleConvertToOpportunity = async (opportunity: SAMOpportunity) => {
    if (convertingIds.has(opportunity.notice_id)) return

    setConvertingIds(prev => new Set(prev).add(opportunity.notice_id))

    try {
      const response = await fetch('/api/sam-opportunities/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noticeId: opportunity.notice_id
        })
      })

      const data = await response.json()

      if (data.success) {
        alert(`Successfully converted "${opportunity.title}" to local opportunity!\n\nYou can now find it in the Opportunities tab.`)
      } else {
        alert(`Failed to convert opportunity: ${data.error}`)
      }
    } catch (error) {
      console.error('Error converting opportunity:', error)
      alert('Failed to convert opportunity. Please try again.')
    } finally {
      setConvertingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(opportunity.notice_id)
        return newSet
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">SAM.gov Opportunities</h1>
          <p className="text-gray-600">
            Government contract opportunities from SAM.gov
          </p>
        </div>
        
        <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Sync className="mr-2 h-4 w-4" />
              Sync Opportunities
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sync SAM.gov Opportunities</DialogTitle>
              <DialogDescription>
                Import government contracting opportunities from SAM.gov. The sync will run in the background and you can monitor progress in the status section above.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateFrom">Posted Date From</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={syncDateFrom}
                    onChange={(e) => setSyncDateFrom(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Earliest date opportunities were posted</p>
                </div>
                <div>
                  <Label htmlFor="dateTo">Posted Date To</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={syncDateTo}
                    onChange={(e) => setSyncDateTo(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Latest date opportunities were posted</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responseDueDateFrom">Response Due Date From (Optional)</Label>
                  <Input
                    id="responseDueDateFrom"
                    type="date"
                    value={syncResponseDueDateFrom}
                    onChange={(e) => setSyncResponseDueDateFrom(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Earliest response deadline</p>
                </div>
                <div>
                  <Label htmlFor="responseDueDateTo">Response Due Date To (Optional)</Label>
                  <Input
                    id="responseDueDateTo"
                    type="date"
                    value={syncResponseDueDateTo}
                    onChange={(e) => setSyncResponseDueDateTo(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">Latest response deadline</p>
                </div>
              </div>

              <div>
                <Label htmlFor="syncActiveOnly">Import Options</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="checkbox"
                    id="syncActiveOnly"
                    checked={syncActiveOnly}
                    onChange={(e) => setSyncActiveOnly(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="syncActiveOnly" className="text-sm">
                    Import active opportunities only (recommended)
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Unchecking will import both active and inactive opportunities
                </p>
              </div>
              
              {/* Sync Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-800">What to expect:</p>
                    <ul className="text-blue-700 mt-1 space-y-1">
                      <li>• Sync runs in background - you can continue using the app</li>
                      <li>• Large date ranges may take 5-15 minutes</li>
                      <li>• Progress will be shown in the status section above</li>
                      <li>• Duplicate opportunities are automatically updated</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={handleSync} 
                  disabled={syncLoading || syncStats?.isRunning}
                  className="flex-1"
                >
                  {syncLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting Sync...
                    </>
                  ) : syncStats?.isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sync Already Running
                    </>
                  ) : (
                    <>
                      <Sync className="mr-2 h-4 w-4" />
                      Start Sync
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSyncDialogOpen(false)}
                  disabled={syncLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sync Completion Banner */}
      {lastSyncCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-800">Sync Completed Successfully!</h4>
              <p className="text-sm text-green-700">
                Latest data from SAM.gov has been imported. Found {syncStats?.totalOpportunities || 0} total opportunities.
                Completed at {formatDate(lastSyncCompleted)}.
              </p>
            </div>
            <button
              onClick={() => setLastSyncCompleted(null)}
              className="text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Sync Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Progress Bar for Active Sync */}
          {syncStats?.isRunning && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Sync in Progress</span>
                <span className="text-sm text-blue-600">
                  {syncStats.progress ? 
                    `${syncStats.progress.current}/${syncStats.progress.total} records` : 
                    'Processing...'
                  }
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ 
                    width: syncStats.progress ? 
                      `${Math.min(syncStats.progress.percentage, 100)}%` : 
                      '10%' 
                  }}
                />
              </div>
              <p className="text-xs text-blue-700 mt-1">
                This may take several minutes for large datasets
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Last Sync</p>
              <p className="font-semibold">
                {syncStats?.lastSyncAt 
                  ? formatDateTime(syncStats.lastSyncAt)
                  : 'Never'
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Opportunities</p>
              <p className="font-semibold">{(syncStats?.totalOpportunities || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Opportunities</p>
              <p className="font-semibold">{(syncStats?.activeOpportunities || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <div className="flex items-center gap-2">
                {syncStats?.isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-blue-600">Syncing...</span>
                  </>
                ) : lastSyncCompleted ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Sync Complete!</span>
                  </>
                ) : syncStats?.lastError ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-600">Error</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Ready</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {syncStats?.lastError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Last Error:</strong> {syncStats.lastError}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search title, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div>
              <Label htmlFor="naics">NAICS Code</Label>
              <Input
                id="naics"
                placeholder="e.g., 541511"
                value={naicsCode}
                onChange={(e) => setNaicsCode(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="e.g., VA, CA, TX"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="setAside">Set Aside Type</Label>
              <Select value={setAsideType} onValueChange={setSetAsideType}>
                <SelectTrigger>
                  <SelectValue placeholder="All set-asides" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="SBA">Small Business</SelectItem>
                  <SelectItem value="8A">8(a)</SelectItem>
                  <SelectItem value="SDVOSB">SDVOSB</SelectItem>
                  <SelectItem value="WOSB">WOSB</SelectItem>
                  <SelectItem value="HUBZone">HUBZone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="active">Status</Label>
              <Select value={activeOnly.toString()} onValueChange={(value) => setActiveOnly(value === 'true')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active Only</SelectItem>
                  <SelectItem value="false">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="postedDateFrom">Posted Date From</Label>
              <Input
                id="postedDateFrom"
                type="date"
                value={postedDateFrom}
                onChange={(e) => setPostedDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="postedDateTo">Posted Date To</Label>
              <Input
                id="postedDateTo"
                type="date"
                value={postedDateTo}
                onChange={(e) => setPostedDateTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="responseDueFrom">Response Due From</Label>
              <Input
                id="responseDueFrom"
                type="date"
                value={responseDueFrom}
                onChange={(e) => setResponseDueFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="responseDueTo">Response Due To</Label>
              <Input
                id="responseDueTo"
                type="date"
                value={responseDueTo}
                onChange={(e) => setResponseDueTo(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSearch} 
                disabled={searching}
                className="w-full"
              >
                {searching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {opportunities.length} of {pagination.totalCount.toLocaleString()} opportunities
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOpportunities(pagination.page - 1)}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              <span className="px-3 py-1 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchOpportunities(pagination.page + 1)}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          </div>

          {opportunities.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">No opportunities found. Try adjusting your search criteria or sync new data.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {opportunities.map((opportunity) => (
                <Card key={opportunity.notice_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{opportunity.title}</h3>
                        {opportunity.solicitation_number && (
                          <p className="text-sm text-blue-600 font-medium mb-2">
                            Solicitation: {opportunity.solicitation_number}
                          </p>
                        )}
                        <p className="text-gray-600 text-sm mb-3">
                          Type: {opportunity.opportunity_type || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {opportunity.active ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Closed
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleConvertToOpportunity(opportunity)}
                          disabled={convertingIds.has(opportunity.notice_id)}
                          title="Convert to local opportunity for tracking"
                        >
                          {convertingIds.has(opportunity.notice_id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                        {opportunity.ui_link && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(opportunity.ui_link!, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <Building className="h-3 w-3" />
                          <span>Agency</span>
                        </div>
                        <p className="font-medium">{opportunity.department_name || 'N/A'}</p>
                        {opportunity.office_name && (
                          <p className="text-gray-600">{opportunity.office_name}</p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <Calendar className="h-3 w-3" />
                          <span>Posted</span>
                        </div>
                        <p className="font-medium">{formatDate(opportunity.posted_date)}</p>
                        {opportunity.response_deadline && (
                          <p className="text-gray-600">
                            Due: {formatDate(opportunity.response_deadline)}
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <DollarSign className="h-3 w-3" />
                          <span>Award</span>
                        </div>
                        <p className="font-medium">
                          {formatCurrency(opportunity.award_amount || null)}
                        </p>
                        {opportunity.award_number && (
                          <p className="text-gray-600">{opportunity.award_number}</p>
                        )}
                      </div>

                      <div>
                        <div className="text-gray-600 mb-1">NAICS</div>
                        <p className="font-medium">{opportunity.naics_code || 'N/A'}</p>
                        {opportunity.set_aside_description && (
                          <Badge variant="outline" className="text-xs">
                            {opportunity.set_aside_description}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {opportunity.location && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600">
                          <strong>Location:</strong> {opportunity.location}
                          {opportunity.zip_code && ` ${opportunity.zip_code}`}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Bottom Pagination Controls */}
          {opportunities.length > 0 && (
            <div className="flex justify-between items-center pt-6 border-t">
              <p className="text-sm text-gray-600">
                Showing {opportunities.length} of {pagination.totalCount.toLocaleString()} opportunities
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchOpportunities(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchOpportunities(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}