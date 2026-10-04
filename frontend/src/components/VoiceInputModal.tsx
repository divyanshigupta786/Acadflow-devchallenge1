"use client";

import React, { useState, useEffect } from "react";
import { Mic, MicOff, X, Sparkles, AlertCircle } from "lucide-react";

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptReady: (transcript: string) => void;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onTranscriptReady,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      return;
    }

    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. You can type or use the sample prompts.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      let current = "";
      for (let i = 0; i < event.results.length; i++) {
        current += event.results[i][0].transcript + " ";
      }
      setTranscript(current.trim());
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isOpen) {
      try {
        recognition.start();
      } catch (_) {}
    }

    return () => {
      try {
        recognition.stop();
      } catch (_) {}
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (transcript.trim()) {
      onTranscriptReady(transcript.trim());
      onClose();
    }
  };

  const sampleVoicePrompts = [
    "I have a DBMS viva tomorrow and my CN assignment is due Friday.",
    "CN quiz Wednesday on chapters 3 and 4, project presentation tomorrow at 3 PM.",
    "Operating Systems lab submission due next Monday with full concurrency test suite.",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Mic className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Voice Academic Input</h3>
              <p className="text-xs text-muted-foreground">Speak assignments, exams, or study plans</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div
            className={`h-20 w-20 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? "bg-red-500/10 text-red-500 border-2 border-red-500 shadow-lg shadow-red-500/20 animate-pulse scale-105"
                : "bg-muted text-muted-foreground border border-border"
            }`}
          >
            {isListening ? <Mic className="h-8 w-8" /> : <MicOff className="h-8 w-8" />}
          </div>

          <p className="text-xs font-medium text-muted-foreground">
            {isListening
              ? "Listening... Speak naturally about your academic deadlines"
              : "Microphone idle. You can edit the transcript below."}
          </p>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Live transcript will appear here..."
            className="w-full h-24 p-3 rounded-xl bg-muted/40 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none text-left"
          />

          {error && (
            <div className="w-full p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-xs text-orange-500 text-left flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick presets */}
          <div className="w-full text-left">
            <span className="text-[11px] text-muted-foreground block mb-1.5 font-medium">
              Or test with sample voice transcript:
            </span>
            <div className="space-y-1">
              {sampleVoicePrompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTranscript(p)}
                  className="w-full text-left text-xs p-2 rounded-lg border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all truncate"
                >
                  &ldquo;{p}&rdquo;
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-muted/20 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!transcript.trim()}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-white hover:bg-primary/90 flex items-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Process into Academic Inbox</span>
          </button>
        </div>
      </div>
    </div>
  );
};
