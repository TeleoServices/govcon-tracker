"use client"

import React from "react"
import { TeleoLogo } from "@/components/teleo-logo"

export function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 flex items-center justify-center z-50">
      <div className="text-center animate-pulse">
        <div className="mb-8 flex justify-center">
          <TeleoLogo size={120} />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">TELEO Services</h1>
        <p className="text-xl text-blue-200">Government Contract Management Platform</p>
        <div className="mt-8">
          <div className="inline-flex items-center gap-2 text-white">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
        <p className="text-sm text-blue-300 mt-8">Initializing System...</p>
      </div>
    </div>
  )
}