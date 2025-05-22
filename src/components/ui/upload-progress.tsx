"use client"

import React, { useEffect } from 'react'
import { Progress } from './progress'
import { recordingService } from '@/lib/recording-service'

export const UploadProgress = () => {
  const [progress, setProgress] = React.useState(0)
  const [isUploading, setIsUploading] = React.useState(false)

  useEffect(() => {
    // Set up upload progress callback
    recordingService.setUploadProgressCallback((uploadProgress) => {
      setProgress(uploadProgress)
      setIsUploading(uploadProgress < 100)
    })

    // Set up beforeunload
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading) {
        e.preventDefault()
        e.returnValue = 'Upload in progress. Are you sure you want to leave?' // Required for Chrome
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isUploading])

  if (!isUploading) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-2 flex items-center gap-2" style={{ maxWidth: '200px' }}>
      <Progress value={progress} className="h-1.5 w-16" />
      <span className="text-xs font-medium text-gray-600">
        {Math.round(progress)}%
      </span>
    </div>
  )
}