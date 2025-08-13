"use client"

import { Button } from "@/components/ui/button"
import { Tooltip } from "@/components/ui/tooltip"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { OpportunityStage, getStageColor, getStageProgress, getStageDescription } from "@/types"

interface StageManagementProps {
  currentStage: OpportunityStage
  onStageChange: (newStage: OpportunityStage) => Promise<void>
  disabled?: boolean
}

const STAGE_ORDER = [
  OpportunityStage.IDENTIFIED,
  OpportunityStage.PURSUIT,
  OpportunityStage.CAPTURE,
  OpportunityStage.PROPOSAL_DEVELOPMENT,
  OpportunityStage.SUBMITTED,
  OpportunityStage.AWARDED,
  OpportunityStage.LOST,
]

export function StageManagement({ currentStage, onStageChange, disabled = false }: StageManagementProps) {
  const currentIndex = STAGE_ORDER.indexOf(currentStage)
  const canAdvance = currentIndex < STAGE_ORDER.length - 1 && currentStage !== OpportunityStage.LOST
  const canRevert = currentIndex > 0

  const handleAdvance = async () => {
    if (canAdvance) {
      await onStageChange(STAGE_ORDER[currentIndex + 1])
    }
  }

  const handleRevert = async () => {
    if (canRevert) {
      await onStageChange(STAGE_ORDER[currentIndex - 1])
    }
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

  const progress = getStageProgress(currentStage)

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRevert}
        disabled={!canRevert || disabled}
        className="p-2"
      >
        <ChevronLeft className="h-3 w-3" />
      </Button>
      
      <div className="flex items-center gap-2 min-w-[120px]">
        <Tooltip content={getStageDescription(currentStage)}>
          <span className={`rounded-full px-2 py-1 text-xs font-medium cursor-help ${getStageColor(currentStage)}`}>
            {getStageDisplayName(currentStage)}
          </span>
        </Tooltip>
        <span className="text-xs text-muted-foreground">
          {progress}%
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleAdvance}
        disabled={!canAdvance || disabled}
        className="p-2"
      >
        <ChevronRight className="h-3 w-3" />
      </Button>
    </div>
  )
}