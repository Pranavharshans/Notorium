"use client"

import React from "react"

interface AvatarProps {
  className?: string
  children: React.ReactNode
}

export const Avatar = ({ className, children }: AvatarProps) => (
  <div className={`relative inline-block rounded-full overflow-hidden ${className || ""}`}>{children}</div>
)

interface AvatarImageProps {
  src: string
  alt: string
}

export const AvatarImage = ({ src, alt }: AvatarImageProps) => (
  <img src={src || "/placeholder.svg"} alt={alt} className="h-full w-full object-cover" />
)

interface AvatarFallbackProps {
  className?: string
  children: React.ReactNode
}

export const AvatarFallback = ({ className, children }: AvatarFallbackProps) => (
  <div className={`flex h-full w-full items-center justify-center bg-gray-200 ${className || ""}`}>
    {children}
  </div>
)