"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Upload,
  Search,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Trash2,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import { ApiClient } from "@/lib/api";
import { Document, RAGQueryResponse } from "@/lib/types";

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  // RAG query state
  const [query, setQuery] = useState("What do I need to study for the CN quiz?");
  const [querying, setQuerying] = useState(false);
  const [ragResult, setRagResult] = useState<RAGQueryResponse | null>(null);

  // Document Upload
  const [uploading, setUploading] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      const res = await ApiClient.getDocuments();
      setDocuments(res);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setQuerying(true);
    try {
      const res = await ApiClient.queryKnowledge(query);
      setRagResult(res);
    } catch (err) {
      console.error("RAG query failed:", err);
    } finally {
      setQuerying(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (docTitle.trim()) {
        formData.append("title", docTitle.trim());
      }
      const newDoc = await ApiClient.uploadDocument(formData);
      setDocuments([newDoc, ...documents]);
      setDocTitle("");
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Knowledge Base & RAG</h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Index syllabus documents, PDFs, and assignment guides. Ask questions with grounded source citations.
        </p>
      </div>

      {/* Grounded RAG Query Section */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Semantic Knowledge Query</span>
          </span>
          <span className="text-[11px] text-muted-foreground font-mono">Grounded Q&A</span>
        </div>

        <form onSubmit={handleQuery} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your syllabus or uploaded lecture notes..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/40 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={querying || !query.trim()}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 shadow-md shadow-primary/25 flex items-center gap-1.5 disabled:opacity-50 transition-all shrink-0"
          >
            <Sparkles className={`h-3.5 w-3.5 ${querying ? "animate-spin" : ""}`} />
            <span>{querying ? "Retrieving..." : "Ask RAG"}</span>
          </button>
        </form>

        {/* Quick Question Suggestions */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            "What do I need to study for the CN quiz?",
            "What are the 7 layers of the OSI model?",
            "Explain TCP three-way handshake and packet flags.",
            "What are the requirements for IPv4 CIDR subnetting?",
          ].map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setQuery(prompt)}
              className="text-xs px-2.5 py-1 rounded-lg border border-border/80 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Grounded Result Display */}
        {ragResult && (
          <div className="pt-4 border-t border-border space-y-4 animate-in fade-in">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-primary flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Grounded Course Answer
                </span>
                <span className="text-muted-foreground font-mono text-[10px]">
                  Engine: {ragResult.ai_provider}
                </span>
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {ragResult.answer}
              </p>
            </div>

            {/* Citations list */}
            {ragResult.citations && ragResult.citations.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Verified Source Citations ({ragResult.citations.length})
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ragResult.citations.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-muted/30 border border-border text-xs space-y-1"
                    >
                      <div className="font-bold text-foreground flex items-center justify-between">
                        <span className="truncate">{c.document_title}</span>
                        <span className="text-primary font-mono text-[10px]">Page {c.page_number}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                        &ldquo;{c.excerpt}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Library and Upload */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h2 className="font-bold text-base text-foreground">Indexed Document Library</h2>
            <p className="text-xs text-muted-foreground">
              {documents.length} document(s) chunked and ready for semantic retrieval.
            </p>
          </div>

          <label className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 shadow-sm shadow-primary/20 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-all">
            <Upload className="h-3.5 w-3.5" />
            <span>{uploading ? "Chunking & Indexing..." : "Upload Notes / PDF"}</span>
            <input
              type="file"
              accept=".pdf,.txt,.docx,.md"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {uploadError && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-500 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl border border-border bg-muted/20 flex items-start justify-between gap-3 hover:border-primary/40 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-bold text-xs sm:text-sm text-foreground">{doc.title}</h4>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                    <span className="uppercase font-mono">{doc.file_type}</span>
                    <span>•</span>
                    <span>{doc.chunk_count} Chunks</span>
                    <span>•</span>
                    <span>{Math.round(doc.file_size_bytes / 1024)} KB</span>
                  </div>
                  {doc.summary && (
                    <p className="text-[11px] text-muted-foreground pt-1 leading-relaxed line-clamp-2">
                      {doc.summary}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
