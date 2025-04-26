"use client"

import React from "react"

interface ButtonProps {
  variant?: "default" | "outline"
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export const Button = ({ variant = "default", className, children, onClick }: ButtonProps) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
  
  const variantStyles = {
    default: "bg-gray-900 text-white hover:bg-gray-800",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-100"
  }

  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className || ""}`} 
      onClick={onClick}
    >
      {children}
    </button>
  )
}
