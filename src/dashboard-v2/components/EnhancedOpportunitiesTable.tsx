"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  Clock,
  ExternalLink
} from "lucide-react"
import { getStageDisplayName } from "../adapters/dataAdapter"
import { getStageColor, getPriorityColor } from "@/types"

interface EnhancedOpportunitiesTableProps {
  opportunities: any[]
  data: any
}

export const EnhancedOpportunitiesTable = ({ opportunities, data }: EnhancedOpportunitiesTableProps) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState("dueDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [stageFilter, setStageFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const filteredAndSortedOpportunities = useMemo(() => {
    let filtered = opportunities.filter(opp => {
      const matchesSearch = !searchTerm || 
        opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.solNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.agency.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStage = stageFilter === "all" || opp.stage === stageFilter
      const matchesPriority = priorityFilter === "all" || opp.priority === priorityFilter

      return matchesSearch && matchesStage && matchesPriority
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortField) {
        case "title":
          aValue = a.title
          bValue = b.title
          break
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0
          break
        case "estimatedValue":
          aValue = a.estimatedValue || 0
          bValue = b.estimatedValue || 0
          break
        case "stage":
          aValue = a.stage
          bValue = b.stage
          break
        case "priority":
          aValue = a.priority
          bValue = b.priority
          break
        default:
          aValue = a[sortField]
          bValue = b[sortField]
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }, [opportunities, searchTerm, sortField, sortDirection, stageFilter, priorityFilter])

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getDaysRemaining = (dueDate: Date | null) => {
    if (!dueDate) return null
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days
  }

  const getDeadlineColor = (dueDate: Date | null) => {
    const days = getDaysRemaining(dueDate)
    if (days === null) return "text-gray-500"
    if (days < 0) return "text-red-600"
    if (days <= 7) return "text-amber-600"
    return "text-green-600"
  }

  const getDeadlineIcon = (dueDate: Date | null) => {
    const days = getDaysRemaining(dueDate)
    if (days === null) return Clock
    if (days < 0) return AlertCircle
    if (days <= 7) return AlertCircle
    return CheckCircle
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

  const uniqueStages = Array.from(new Set(opportunities.map(opp => opp.stage)))
  const uniquePriorities = Array.from(new Set(opportunities.map(opp => opp.priority)))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          Opportunities Pipeline
        </CardTitle>
        <CardDescription>
          Detailed view of all opportunities with advanced filtering and sorting
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Stages</option>
            {uniqueStages.map(stage => (
              <option key={stage} value={stage}>
                {getStageDisplayName(stage)}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Priorities</option>
            {uniquePriorities.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>

          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            Showing {filteredAndSortedOpportunities.length} of {opportunities.length} opportunities
          </p>
          <div className="flex gap-2">
            <Badge variant="outline">
              {formatCurrency(filteredAndSortedOpportunities.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0))} Total Value
            </Badge>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort("title")}
                    className="h-auto p-0 font-semibold"
                  >
                    Opportunity
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </th>
                <th className="text-left py-3 px-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort("stage")}
                    className="h-auto p-0 font-semibold"
                  >
                    Stage
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </th>
                <th className="text-left py-3 px-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort("estimatedValue")}
                    className="h-auto p-0 font-semibold"
                  >
                    Value
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </th>
                <th className="text-left py-3 px-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort("dueDate")}
                    className="h-auto p-0 font-semibold"
                  >
                    Due Date
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </th>
                <th className="text-left py-3 px-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSort("priority")}
                    className="h-auto p-0 font-semibold"
                  >
                    Priority
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </th>
                <th className="text-center py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedOpportunities.map((opportunity) => {
                const DeadlineIcon = getDeadlineIcon(opportunity.dueDate)
                const daysRemaining = getDaysRemaining(opportunity.dueDate)
                
                return (
                  <tr key={opportunity.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 mb-1">
                          {opportunity.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {opportunity.solNo} • {opportunity.agency}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`${getStageColor(opportunity.stage)} border-0`}>
                        {getStageDisplayName(opportunity.stage)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="font-medium">
                          {formatCurrency(opportunity.estimatedValue)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`flex items-center gap-2 ${getDeadlineColor(opportunity.dueDate)}`}>
                        <DeadlineIcon className="h-4 w-4" />
                        <div>
                          <div className="text-sm font-medium">
                            {opportunity.dueDate 
                              ? new Date(opportunity.dueDate).toLocaleDateString()
                              : "No deadline"
                            }
                          </div>
                          {daysRemaining !== null && (
                            <div className="text-xs">
                              {daysRemaining < 0 
                                ? `${Math.abs(daysRemaining)} days overdue`
                                : `${daysRemaining} days left`
                              }
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`${getPriorityColor(opportunity.priority)} border-0`}>
                        {opportunity.priority}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredAndSortedOpportunities.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No opportunities found matching your filters.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => {
                  setSearchTerm("")
                  setStageFilter("all")
                  setPriorityFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}