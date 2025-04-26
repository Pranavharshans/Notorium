"use client"

import React from "react"

interface ProgressProps {
  value: number
  className?: string
}

export const Progress = ({ value, className }: ProgressProps) => (
  <div className={`relative h-4 w-full overflow-hidden rounded-full bg-gray-200 ${className || ""}`}>
    <div 
      className="h-full bg-gray-900 transition-all" 
      style={{ width: `${value}%` }} 
    />
  </div>
)