"use client"

import React, { useState } from "react"

interface TabsProps {
  defaultValue: string
  className?: string
  children: React.ReactNode
}

interface TabsListProps {
  className?: string
  children: React.ReactNode
  activeTab?: string
  setActiveTab?: (tab: string) => void
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  activeTab?: string
  setActiveTab?: (tab: string) => void
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  activeTab?: string
}

export const Tabs = ({ defaultValue, className, children }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <div className={`${className || ""}`} data-active-tab={activeTab}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
            activeTab,
            setActiveTab,
          })
        }
        return child
      })}
    </div>
  )
}

export const TabsList = ({ className, children, activeTab, setActiveTab }: TabsListProps) => (
  <div className={`inline-flex items-center justify-center rounded-md bg-gray-100 p-1 ${className || ""}`}>
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
          activeTab,
          setActiveTab,
        })
      }
      return child
    })}
  </div>
)

export const TabsTrigger = ({ value, children, activeTab, setActiveTab }: TabsTriggerProps) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      activeTab === value ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-900"
    }`}
    onClick={() => setActiveTab && setActiveTab(value)}
  >
    {children}
  </button>
)

export const TabsContent = ({ value, children, activeTab }: TabsContentProps) => {
  if (activeTab !== value) return null

  return (
    <div className="mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2">
      {children}
    </div>
  )
}