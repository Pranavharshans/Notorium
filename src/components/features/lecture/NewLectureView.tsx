"use client";

import React, { useState } from 'react';
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { AIVoiceInput } from "@/components/ui/ai-voice-input";
import { groqService, TranscriptionResult } from "@/lib/groq-service";
import { aiProviderService, AIProvider } from "@/lib/ai-provider-service";
import { notesService } from "@/lib/notes-service";
import { Note } from "@/types/note";

interface NewLectureViewProps {
  setCurrentView: (view: string) => void;
  setGeneratedNotes: (notes: string | null) => void;
  user: any; // TODO: Type this properly with Firebase user type
  onNoteSelect?: (noteId: string, note: Note) => void;
}

export function NewLectureView({
  setCurrentView,
  setGeneratedNotes,
  user,
  onNoteSelect
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
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

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
      const { title: generatedTitle, content: generatedContent } = await aiProviderService.generateNotesFromTranscript(transcription.text);
      console.log("Generated notes:", { title: generatedTitle, content: generatedContent });
      
      if (user?.uid) {
        const finalTitle = title.trim() || generatedTitle;
        const noteTags = tags.length ? ['lecture', ...tags] : ['lecture', 'generated'];
        
        const noteId = await notesService.createNote({
          title: finalTitle,
          transcript: transcription.text,
          notes: generatedContent,
          userId: user.uid,
          tags: noteTags.filter(tag => tag.trim() !== '')  // Filter out empty tags
        });

        // Set the generated title if user hasn't provided one
        if (!title.trim()) {
          setTitle(generatedTitle);
        }

        // Get the newly created note and select it
        const notes = await notesService.getNotes(user.uid);
        const newNote = notes.find(note => note.id === noteId);
        if (newNote && onNoteSelect) {
          setGeneratedNotes(null); // Clear generated notes
          onNoteSelect(noteId, newNote); // Select the new note
        }

      } else {
        console.error("Cannot save note: User not logged in.");
      }
      
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
              <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Lecture Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter lecture title"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="tags" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setTags(tags.filter((_, i) => i !== index))}
                          className="ml-1 inline-flex items-center p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full"
                        >
                          <span className="sr-only">Remove tag</span>
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      id="tags"
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && tagInput.trim()) {
                          e.preventDefault();
                          const trimmedTag = tagInput.trim().toLowerCase(); // Normalize tags to lowercase
                          if (trimmedTag && !tags.includes(trimmedTag)) {
                            setTags([...tags, trimmedTag]);
                          }
                          setTagInput('');
                        }
                      }}
                      placeholder="Add tags (press Enter to add)"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end items-center gap-4">
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
                {notesError && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">{notesError}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}