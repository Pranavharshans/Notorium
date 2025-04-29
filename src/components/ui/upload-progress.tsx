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

    // Set up beforeunload warning
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

  if (!isUploading && progress === 0) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-white/80 backdrop-blur-sm">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {progress < 100 ? 'Uploading...' : 'Processing...'}
          </span>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  )
}