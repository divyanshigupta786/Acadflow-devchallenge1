"use client";

import React, { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Layers,
} from "lucide-react";
import { ApiClient } from "@/lib/api";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  tools_executed?: string[];
  action_taken?: string;
  timestamp: string;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "assistant",
      text: "Hello Alex! I am your AcadFlow academic decision engine. I orchestrate verified tools to check your deadlines, estimate workloads, and adapt your study schedules. Ask me anything like: 'I have 2 hours free, what should I study?' or 'Replan because I lost time today.'",
      tools_executed: ["get_tasks()", "get_deadlines()", "get_student_preferences()"],
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input.trim();
    setInput("");
    setLoading(true);

    try {
      const res = await ApiClient.chatWithAssistant(currentInput);
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: res.response,
        tools_executed: res.tools_executed,
        action_taken: res.action_taken,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: "Could not reach the AI decision engine. Your local task database is intact.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "I have 2 hours free. What should I do?",
    "I couldn't finish DBMS. Replan my schedule.",
    "What do I need to study for the CN quiz?",
    "Which tasks are critical this week?",
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Bot className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">AI Academic Assistant</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Agent orchestrator invoking validated backend tools with full execution transparency.
          </p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-card border border-border">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-2xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                m.sender === "user"
                  ? "bg-primary text-white rounded-br-none"
                  : "bg-muted/40 border border-border text-foreground rounded-bl-none"
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>

              {/* Tool Execution Transparency Badges (Section 30 & 31) */}
              {m.tools_executed && m.tools_executed.length > 0 && (
                <div className="pt-2 border-t border-border/40 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase text-muted-foreground font-bold">
                    <Terminal className="h-3 w-3 text-primary" />
                    <span>Validated Tools Executed</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {m.tools_executed.map((tool, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-semibold"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground px-2 pt-1 font-mono">{m.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-start">
            <div className="p-4 rounded-2xl bg-muted/40 border border-border text-xs text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-spin" />
              <span>Orchestrating backend tools and analyzing deadlines...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex flex-wrap gap-1.5 shrink-0">
        {sampleQuestions.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setInput(q)}
            className="text-xs px-2.5 py-1 rounded-lg border border-border/80 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted transition-all truncate"
          >
            &ldquo;{q}&rdquo;
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your academic assistant (e.g., 'I have 2 hours free. What should I study?')..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 shadow-md shadow-primary/25 flex items-center gap-1.5 disabled:opacity-50 transition-all shrink-0"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
