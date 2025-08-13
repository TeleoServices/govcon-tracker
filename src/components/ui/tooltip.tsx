"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  content: string
  children: React.ReactNode
  className?: string
  show?: boolean
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ content, children, className, show, position = 'top' }: TooltipProps) {
  const shouldShow = show !== undefined ? show : undefined
  
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return {
          tooltip: "top-full left-1/2 transform -translate-x-1/2 mt-2",
          arrow: "bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"
        }
      case 'left':
        return {
          tooltip: "right-full top-1/2 transform -translate-y-1/2 mr-2",
          arrow: "left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900"
        }
      case 'right':
        return {
          tooltip: "left-full top-1/2 transform -translate-y-1/2 ml-2",
          arrow: "right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"
        }
      default: // 'top'
        return {
          tooltip: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
          arrow: "top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
        }
    }
  }
  
  const { tooltip: tooltipClasses, arrow: arrowClasses } = getPositionClasses()
  
  return (
    <div className={cn("relative inline-block group", className)}>
      {children}
      <div className={cn(
        "absolute px-3 py-2 bg-gray-900 text-white text-sm rounded-md transition-all duration-200 z-[100] max-w-sm whitespace-normal break-words shadow-lg",
        tooltipClasses,
        shouldShow === undefined 
          ? "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
          : shouldShow 
            ? "opacity-100 visible"
            : "opacity-0 invisible"
      )}>
        {content}
        <div className={cn("absolute", arrowClasses)}></div>
      </div>
    </div>
  )
}