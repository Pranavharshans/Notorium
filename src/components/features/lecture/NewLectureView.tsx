"use client";

import React, { useState } from 'react';
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { groqService, TranscriptionResult } from "@/lib/groq-service";
import { aiProviderService, AIProvider } from "@/lib/ai-provider-service";
import { notesService } from "@/lib/notes-service";

interface NewLectureViewProps {
  setCurrentView: (view: string) => void;
  setGeneratedNotes: (notes: string | null) => void;
  user: any; // TODO: Type this properly with Firebase user type
}

export function NewLectureView({
  setCurrentView,
  setGeneratedNotes,
  user
}: NewLectureViewProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [provider, setProvider] = useState<AIProvider>('gemini');

  const handleRecordingStart = () => {
    setIsRecording(true);
    setError(null);
    setTranscription(null);
    setCopySuccess(false);
  };

  const handleRecordingStop = async (duration: number, audioBlob: Blob) => {
    setRecordingDuration(duration);
    setIsRecording(false);
    setIsProcessing(true);
    setError(null);

    try {
      const result = await groqService.transcribeAudio(audioBlob);
      setTranscription(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to process the recording. Please try again.";
      setError(errorMessage);
      console.error("Transcription error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (transcription?.text) {
      navigator.clipboard.writeText(transcription.text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleGenerateNotes = async () => {
    if (!transcription?.text) {
      console.log("No transcription available for generating notes");
      return;
    }
    setNotesLoading(true);
    setNotesError(null);
    try {
      console.log("Generating notes with transcript:", transcription.text);
      aiProviderService.setProvider(provider);
      const generatedNotes = await aiProviderService.generateNotesFromTranscript(transcription.text);
      console.log("Generated notes:", generatedNotes);
      
      if (user?.uid) {
        await notesService.createNote({
          transcript: transcription.text,
          notes: generatedNotes,
          userId: user.uid,
          tags: ['lecture', 'generated'] 
        });
      } else {
        console.error("Cannot save note: User not logged in.");
      }
      
      setGeneratedNotes(generatedNotes);
      setCurrentView('notes');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate notes";
      console.error("Error generating notes:", errorMessage);
      setNotesError(errorMessage);
    } finally {
      setNotesLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center pt-8 md:pt-12"> 
      <div className="w-full max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">Record Live Lecture</h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
          Transform your lectures into comprehensive notes instantly with our AI-powered recording system.
        </p>
        
        {error && (
          <div className="mb-8 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-12">
          <AIVoiceInput
            className="w-full scale-110 md:scale-125 transform"
            onStart={handleRecordingStart}
            onStop={handleRecordingStop}
          />
        </div>

        {isProcessing && (
          <div className="text-center space-y-4">
            <div className="inline-block px-6 py-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <p className="text-blue-600 dark:text-blue-300 font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/>
                Processing your lecture recording...
              </p>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Our AI is analyzing your lecture. This may take a few minutes.
            </p>
          </div>
        )}

        {transcription && (
          <div className="mt-8 text-left w-full bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Lecture Transcription</h3>
              <button
                onClick={handleCopyToClipboard}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center gap-1"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                {copySuccess ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="space-y-6">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {transcription.text}
              </p>
              
              <div className="mt-4 flex justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      const newProvider = provider === 'gemini' ? 'groq' : 'gemini';
                      setProvider(newProvider);
                      aiProviderService.setProvider(newProvider);
                    }}
                    className="px-4 py-2 rounded text-sm flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
                    disabled={notesLoading}
                  >
                    <RefreshCw size={16} />
                    {provider === 'gemini' ? 'Using Gemini' : 'Using Groq'}
                  </button>

                  <button
                    onClick={handleGenerateNotes}
                    disabled={notesLoading}
                    className={cn(
                      "px-4 py-2 rounded text-sm font-semibold flex items-center gap-2",
                      "bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {notesLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                        Generating...
                      </>
                    ) : (
                      "Generate & Save Notes"
                    )}
                  </button>
                </div>
              </div>
              {notesError && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">{notesError}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}