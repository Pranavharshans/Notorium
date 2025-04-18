"use client";

import { Mic } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { recordingService } from "@/lib/recording-service";

interface AIVoiceInputProps {
  onStart?: () => void;
  onStop?: (duration: number, audioBlob: Blob) => void;
  visualizerBars?: number;
  demoMode?: boolean;
  demoInterval?: number;
  className?: string;
}

export function AIVoiceInput({
  onStart,
  onStop,
  visualizerBars = 48,
  demoMode = false,
  demoInterval = 3000,
  className,
}: AIVoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [time, setTime] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [isDemo, setIsDemo] = useState(demoMode);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRecording && !isDemo && !isPaused) {
      intervalId = setInterval(() => {
        const currentDuration = recordingService.getCurrentDuration();
        setTime(Math.floor(currentDuration));
      }, 1000);
    } else if (!isRecording) {
      setTime(0);
    }

    return () => clearInterval(intervalId);
  }, [isRecording, isDemo, isPaused]);

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

    if (isPaused) {
      return;
    }

    try {
      if (!isRecording) {
        await recordingService.startRecording();
        setIsRecording(true);
        setIsPaused(false);
        onStart?.();
      } else {
        const recordingData = await recordingService.stopRecording();
        setIsRecording(false);
        setIsPaused(false);
        onStop?.(recordingData.duration, recordingData.blob);
      }
    } catch (error) {
      console.error("Recording error:", error);
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const handlePauseResume = async () => {
    try {
      if (isRecording && !isPaused) {
        await recordingService.pauseRecording();
        setIsPaused(true);
      } else if (isPaused) {
        await recordingService.resumeRecording();
        setIsPaused(false);
      }
    } catch (error) {
      console.error("Pause/Resume error:", error);
    }
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        <button
          className={cn(
            "group w-16 h-16 rounded-xl flex items-center justify-center transition-colors",
            isRecording ? "bg-none" : "bg-none hover:bg-black/10 dark:hover:bg-white/10"
          )}
          type="button"
          onClick={handleClick}
        >
          {isRecording ? (
            <div
              className={cn(
                "w-6 h-6 rounded-sm bg-black dark:bg-white cursor-pointer pointer-events-auto",
                !isPaused && "animate-spin"
              )}
              style={{ animationDuration: "3s" }}
            />
          ) : (
            <Mic className="w-6 h-6 text-black/70 dark:text-white/70" />
          )}
        </button>
        {isRecording && (
          <button
            className={cn(
              "group px-4 py-2 rounded-lg flex items-center justify-center transition-colors",
              "bg-none hover:bg-black/10 dark:hover:bg-white/10"
            )}
            type="button"
            onClick={handlePauseResume}
          >
            {isPaused ? (
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 5.14v14l11-7-11-7z" fill="currentColor" className="text-black/70 dark:text-white/70" />
                </svg>
                <span className="text-sm text-black/70 dark:text-white/70">Resume</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"
                    fill="currentColor"
                    className="text-black/70 dark:text-white/70"
                  />
                </svg>
                <span className="text-sm text-black/70 dark:text-white/70">Pause</span>
              </div>
            )}
          </button>
        )}

        <span
          className={cn(
            "font-mono text-sm transition-opacity duration-300",
            isRecording ? "text-black/70 dark:text-white/70" : "text-black/30 dark:text-white/30"
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
                isRecording && !isPaused
                  ? "bg-black/50 dark:bg-white/50 animate-pulse"
                  : isRecording && isPaused
                  ? "bg-black/30 dark:bg-white/30"
                  : "bg-black/10 dark:bg-white/10 h-1"
              )}
              style={
                isRecording && isClient
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

        <p className="h-4 text-xs text-black/70 dark:text-white/70">
          {isRecording ? (isPaused ? "Paused" : "Listening...") : "Click to speak"}
        </p>
      </div>
    </div>
  );
}