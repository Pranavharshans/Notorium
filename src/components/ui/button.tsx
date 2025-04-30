"use client"

import React from "react"

interface ButtonProps {
  variant?: "default" | "outline"
  className?: string
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean // Added disabled prop
}

export const Button = ({ variant = "default", className, children, onClick, disabled }: ButtonProps) => { // Destructure disabled
  const baseStyles = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
  
  const variantStyles = {
    default: "bg-blue-600 text-white hover:bg-blue-700 shadow-md border-0",
    outline: "border border-gray-300 border-[0.5px] bg-transparent hover:bg-gray-200"
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className || ""}`}
      onClick={onClick}
      disabled={disabled} // Pass disabled prop to button element
    >
      {children}
    </button>
  )
}
