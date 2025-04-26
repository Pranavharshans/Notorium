"use client"

import React from "react"

interface CardProps {
  className?: string
  children: React.ReactNode
}

export const Card = ({ className, children }: CardProps) => (
  <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className || ""}`}>
    {children}
  </div>
)

export const CardHeader = ({ className, children }: CardProps) => (
  <div className={`px-6 py-5 ${className || ""}`}>{children}</div>
)

export const CardTitle = ({ className, children }: CardProps) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className || ""}`}>
    {children}
  </h3>
)

export const CardDescription = ({ className, children }: CardProps) => (
  <p className={`text-sm text-gray-500 ${className || ""}`}>{children}</p>
)

export const CardContent = ({ className, children }: CardProps) => (
  <div className={`px-6 py-5 ${className || ""}`}>{children}</div>
)

export const CardFooter = ({ className, children }: CardProps) => (
  <div className={`px-6 py-5 ${className || ""}`}>{children}</div>
)