"use client";

import { useEffect, useRef } from "react";

interface ScribeCardProps {
  transcript: string;
  isRecording: boolean;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
}

export function ScribeCard({
  transcript,
  isRecording,
  error,
  onStart,
  onStop,
}: ScribeCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as transcript grows
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div className={`card p-4 flex flex-col gap-3 transition-all ${isRecording ? "border-red-300 bg-red-50" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎙️</span>
          <div>
            <p className="font-semibold text-slate-900 text-sm">Medical Scribe</p>
            <p className="text-xs text-slate-500">Record the appointment conversation</p>
          </div>
        </div>
        {isRecording && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Recording
          </span>
        )}
      </div>

      {/* Transcript area */}
      <div
        ref={scrollRef}
        className={`min-h-[80px] max-h-[160px] overflow-y-auto rounded-lg p-3 text-xs leading-relaxed ${
          isRecording
            ? "bg-white border border-red-200"
            : transcript
            ? "bg-slate-50 border border-slate-200"
            : "bg-slate-50"
        }`}
      >
        {error ? (
          <span className="text-red-600">{error}</span>
        ) : transcript ? (
          <span className={`text-slate-700 ${isRecording ? "cursor-blink" : ""}`}>
            {transcript}
          </span>
        ) : (
          <span className="text-slate-400 italic">
            {isRecording ? "Listening…" : "Transcript will appear here as you speak."}
          </span>
        )}
      </div>

      {/* Record / Stop button */}
      <button
        onClick={isRecording ? onStop : onStart}
        className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${
          isRecording
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-slate-900 hover:bg-slate-700 text-white"
        }`}
      >
        {isRecording ? "⏹ Stop Recording" : "⏺ Start Recording"}
      </button>
    </div>
  );
}
