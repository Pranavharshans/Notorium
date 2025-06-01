"use client";

import { Mic } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { recordingService } from "@/lib/recording-service";
import { getAuth } from "firebase/auth";
import { toast } from "sonner";
import { useQuotaPopup } from "@/context/QuotaPopupContext";
// import { RecordingQuotaExhaustedError, quotaService } from "@/lib/quota-service"; // Commented out RecordingQuotaExhaustedError as it is unused - @typescript-eslint/no-unused-vars
import { quotaService } from "@/lib/quota-service";

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (recordingData: { duration: number; blob: Blob; downloadURL?: string }) => void;
  visualizerBars?: number;
  demoMode?: boolean;
  demoInterval?: number;
  className?: string;
  disabled?: boolean;
}

export function AIVoiceInput({
  onStart,
  onStop,
  visualizerBars = 48,
  demoMode = false,
  demoInterval = 3000,
  className,
  disabled = false,
}: AIVoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(demoMode);
  const [isPaused, setIsPaused] = useState(false);
  const [isApproachingLimit, setIsApproachingLimit] = useState(false);
  const [isProcessingRecording, setIsProcessingRecording] = useState(false);
  const { showQuotaPopup } = useQuotaPopup();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRecording && !isDemo && !isPaused) {
      intervalId = setInterval(() => {
        const currentDuration = recordingService.getCurrentDuration();
        const durationInSeconds = Math.floor(currentDuration);
        setTime(durationInSeconds);
        setIsApproachingLimit(durationInSeconds >= 1740); // 29 minutes
      }, 1000);
    } else if (!isRecording && !isProcessingRecording) {
      setTime(0);
    }

    return () => clearInterval(intervalId);
  }, [isRecording, isDemo, isPaused, isProcessingRecording]);

  useEffect(() => {
    if (!isDemo) return;

    let timeoutId: NodeJS.Timeout;
    const runAnimation = () => {
      setIsRecording(true);
      timeoutId = setTimeout(() => {
        setIsRecording(false);
        timeoutId = setTimeout(runAnimation, 1000);
      }, demoInterval);
    };

    const initialTimeout = setTimeout(runAnimation, 100);
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(initialTimeout);
    };
  }, [isDemo, demoInterval]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleClick = async () => {
    if (isDemo) {
      setIsDemo(false);
      setIsRecording(false);
      return;
    }

    if (disabled || isProcessingRecording) {
      return;
    }

    setIsProcessingRecording(true);
    
    try {
      if (!isRecording) {
        const user = await getAuth().currentUser;
        if (!user) {
          throw new Error("User not authenticated");
        }
        
        // Check quota silently before starting recording
        const quotaStatus = await quotaService.silentCheckRecordingQuota(user.uid);
        if (quotaStatus.isExhausted || !quotaStatus.hasQuota) {
          showQuotaPopup('recording');
          return;
        }
        
        recordingService.setUserId(user.uid);
        recordingService.setQuotaWarningCallback((type) => {
          if (type === 'duration') {
            const currentDuration = recordingService.getCurrentDuration();
            if (currentDuration >= 1800) { // Only stop if we've hit 30 minutes
              toast.warning("Recording time limit reached");
              // Don't pass isQuotaExhausted flag for time limit
              recordingService.stopRecording().then(recordingData => {
                setIsRecording(false);
                setIsPaused(false);
                setIsProcessingRecording(false);
                onStop?.(recordingData);
              }).catch(error => {
                setIsRecording(false);
                setIsPaused(false);
                setIsProcessingRecording(false);
              });
            } else {
              // Just show warning at 29 minutes
              toast.warning("Recording will end in 1 minute");
            }
          }
        });
        await recordingService.startRecording();
        setIsRecording(true);
        setIsPaused(false);
        onStart?.();
      } else {
        const recordingData = await recordingService.stopRecording();
        setIsRecording(false);
        setIsPaused(false);
        onStop?.(recordingData);
      }
    } catch (error) {
      // We no longer need to check for RecordingQuotaExhaustedError
      // since we're handling quota with the isExhausted flag
      setIsRecording(false);
      setIsPaused(false);
    } finally {
      setIsProcessingRecording(false);
    }
  };

  const handlePauseResume = async () => {
    if (disabled || isProcessingRecording) {
      return;
    }

    try {
      if (isRecording && !isPaused) {
        await recordingService.pauseRecording();
        setIsPaused(true);
      } else if (isPaused) {
        await recordingService.resumeRecording();
        setIsPaused(false);
      }
    } catch (error) {
      // Error handling without console log
    }
  };

  // Determine current state for styling
  const getCurrentState = () => {
    if (disabled) return 'processing';
    if (isProcessingRecording) return 'processing';
    if (isRecording && isPaused) return 'paused';
    if (isRecording) return 'recording';
    return 'idle';
  };

  const currentState = getCurrentState();

  // State-based styling with softer red colors
  const getButtonStyles = (state: string) => {
    const baseStyles = "group w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300";
    
    switch (state) {
      case 'idle':
        return cn(baseStyles, "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600");
      case 'recording':
        return cn(baseStyles, "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900 border-2 border-rose-300 dark:border-rose-700 shadow-lg shadow-rose-100 dark:shadow-rose-950");
      case 'paused':
        return cn(baseStyles, "bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 border-2 border-yellow-400 dark:border-yellow-500 shadow-lg shadow-yellow-200 dark:shadow-yellow-900");
      case 'processing':
        return cn(baseStyles, "bg-blue-100 dark:bg-blue-900 border-2 border-blue-400 dark:border-blue-500 opacity-75 cursor-not-allowed shadow-lg shadow-blue-200 dark:shadow-blue-900");
      default:
        return baseStyles;
    }
  };

  const getIconColor = (state: string) => {
    switch (state) {
      case 'idle':
        return "text-gray-600 dark:text-gray-400";
      case 'recording':
        return "text-rose-600 dark:text-rose-400";
      case 'paused':
        return "text-yellow-600 dark:text-yellow-400";
      case 'processing':
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getTimerColor = (state: string) => {
    switch (state) {
      case 'recording':
        return isApproachingLimit ? "text-orange-600 dark:text-orange-400" : "text-rose-600 dark:text-rose-400";
      case 'paused':
        return "text-yellow-600 dark:text-yellow-400";
      case 'processing':
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-400 dark:text-gray-500";
    }
  };

  const getStatusText = () => {
    if (disabled) return "Processing...";
    if (isProcessingRecording) return "Starting...";
    if (isRecording) {
      if (isPaused) return "Paused";
      if (time >= 1740) return "Recording will end in 1 minute...";
      return "Listening...";
    }
    return "Click to speak";
  };

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'recording':
        return isApproachingLimit ? "text-orange-600 dark:text-orange-400" : "text-rose-600 dark:text-rose-400";
      case 'paused':
        return "text-yellow-600 dark:text-yellow-400";
      case 'processing':
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        <button
          className={getButtonStyles(currentState)}
          type="button"
          onClick={handleClick}
          disabled={disabled || isProcessingRecording}
        >
          {isRecording && !isProcessingRecording ? (
            <div
              className={cn(
                "w-6 h-6 rounded-sm cursor-pointer pointer-events-auto",
                currentState === 'recording' ? "bg-rose-500 dark:bg-rose-400" : "bg-yellow-600 dark:bg-yellow-400",
                currentState === 'recording' && !isPaused && "animate-pulse"
              )}
              style={{ animationDuration: "2s" }}
            />
          ) : isProcessingRecording ? (
            <div className="w-6 h-6 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Mic className={cn("w-6 h-6", getIconColor(currentState))} />
          )}
        </button>
        
        {isRecording && !disabled && (
          <button
            className={cn(
              "group px-4 py-2 rounded-lg flex items-center justify-center transition-colors",
              currentState === 'paused' 
                ? "bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800" 
                : "bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900"
            )}
            type="button"
            onClick={handlePauseResume}
            disabled={isProcessingRecording}
          >
            {isPaused ? (
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" className="text-yellow-600 dark:text-yellow-400" />
                </svg>
                <span className="text-sm text-yellow-600 dark:text-yellow-400">Resume</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"
                    fill="currentColor"
                    className="text-rose-600 dark:text-rose-400"
                  />
                </svg>
                <span className="text-sm text-rose-600 dark:text-rose-400">Pause</span>
              </div>
            )}
          </button>
        )}

        <span
          className={cn(
            "font-mono text-sm transition-opacity duration-300",
            getTimerColor(currentState)
          )}
        >
          {formatTime(time)}
        </span>

        <div className="h-4 w-64 flex items-center justify-center gap-0.5">
          {[...Array(visualizerBars)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-all duration-300",
                currentState === 'recording' && !isPaused
                  ? "bg-rose-300 dark:bg-rose-500 animate-pulse"
                  : currentState === 'paused'
                  ? "bg-yellow-400 dark:bg-yellow-500"
                  : currentState === 'processing'
                  ? "bg-blue-400 dark:bg-blue-500 animate-pulse"
                  : "bg-gray-300 dark:bg-gray-600 h-1"
              )}
              style={
                (currentState === 'recording' || currentState === 'processing' || currentState === 'paused') && isClient
                  ? {
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                      animationPlayState: isPaused ? "paused" : "running"
                    }
                  : undefined
              }
            />
          ))}
        </div>

        <p className={cn(
          "h-4 text-xs",
          getStatusColor(currentState)
        )}>
          {getStatusText()}
        </p>
      </div>
    </div>
  );
}