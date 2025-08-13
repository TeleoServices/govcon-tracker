"use client"

import React from "react"

interface TeleoLogoProps {
  className?: string
  size?: number
}

export function TeleoLogo({ className = "", size = 40 }: TeleoLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circle - Navy Blue */}
      <circle cx="50" cy="50" r="45" fill="#1e3a8a" />
      
      {/* Inner circle - Light Blue */}
      <circle cx="50" cy="50" r="35" fill="#3b82f6" />
      
      {/* Letter T - White */}
      <g fill="white">
        <rect x="25" y="25" width="50" height="8" />
        <rect x="46" y="25" width="8" height="50" />
      </g>
      
      {/* Decorative elements - Gold accents */}
      <circle cx="50" cy="50" r="30" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.8" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#fbbf24" strokeWidth="0.5" opacity="0.6" />
    </svg>
  )
}

export function TeleoLogoWithText({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <TeleoLogo size={40} />
      <div className="flex flex-col">
        <span className="text-xl font-bold text-blue-900">TELEO Services</span>
        <span className="text-xs text-blue-600">Government Contract Management</span>
      </div>
    </div>
  )
}