"use client";

import { useEffect, useRef, useState } from "react";
import {
  Plus,
  Send,
  Mic,
  Menu,
  X,
  LogOut,
  Download,
  FileText,
  FileDown,
  Volume2,
  Square,
  Mail,
  Lightbulb,
  Sparkles,
  FileSearch,
} from "lucide-react";
import type { Conversation, ChatMessage } from "@/lib/types";
import { useSpeechToText, useTextToSpeech } from "@/lib/useVoice";
import { exportAsTxt, exportAsMarkdown, exportAsPdf } from "@/lib/exportChat";

const STORAGE_KEY = "nexora:conversations";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function newConversation(): Conversation {
  return { id: uid(), title: "New chat", messages: [], createdAt: Date.now() };
}

function titleFrom(text: string) {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length > 42 ? clean.slice(0, 42) + "…" : clean || "New chat";
}

function firstName(name: string) {
  return name.trim().split(" ")[0];
}

const SUGGESTIONS = [
  { text: "Draft a professional email to a client", icon: Mail },
  { text: "Explain a complex topic simply", icon: Lightbulb },
  { text: "Brainstorm names for a new project", icon: Sparkles },
  { text: "Summarize a long document for me", icon: FileSearch },
];

export default function ChatApp({ name, onSignOut }: { name: string; onSignOut: () => void }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [errorNotice, setErrorNotice] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { listening, supported: micSupported, toggle: toggleMic } = useSpeechToText((text) =>
    setInput((prev) => (prev ? `${prev} ${text}` : text))
  );
  const { speak, stop, speakingId } = useTextToSpeech();

  // Load conversations once, and always open into a fresh new chat —
  // history stays one click away in the sidebar.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved: Conversation[] = raw ? JSON.parse(raw) : [];
      setConversations(saved);
    } catch {
      setConversations([]);
    }
    const fresh = newConversation();
    setActiveId(fresh.id);
    setConversations((prev) => [fresh, ...prev]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (conversations.length === 0) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.slice(0, 50)));
  }, [conversations]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [conversations, activeId, sending]);

  const active = conversations.find((c) => c.id === activeId) || null;

  function updateActive(updater: (c: Conversation) => Conversation) {
    setConversations((prev) => prev.map((c) => (c.id === activeId ? updater(c) : c)));
  }

  function handleNewChat() {
    const fresh = newConversation();
    setConversations((prev) => [fresh, ...prev]);
    setActiveId(fresh.id);
    setSidebarOpen(false);
    setInput("");
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || !active || sending) return;
    setErrorNotice("");

    const userMsg: ChatMessage = { id: uid(), role: "user", content: text, createdAt: Date.now() };
    const isFirstMessage = active.messages.length === 0;

    updateActive((c) => ({
      ...c,
      title: isFirstMessage ? titleFrom(text) : c.title,
      messages: [...c.messages, userMsg],
    }));
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setSending(true);

    try {
      const history = [...(active.messages || []), userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, userName: firstName(name) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");

      const assistantMsg: ChatMessage = {
        id: uid(),
        role: "assistant",
        content: data.reply || "…",
        createdAt: Date.now(),
      };
      updateActive((c) => ({ ...c, messages: [...c.messages, assistantMsg] }));
    } catch (err: any) {
      setErrorNotice(
        err.message === "Failed to fetch"
          ? "Can't reach the server. Check your connection and try again."
          : err.message || "Something went wrong. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function autoGrow(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }

  const isEmpty = !active || active.messages.length === 0;

  return (
    <div className="shell">
      <div
        className={`sidebar-backdrop ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand-row">
          <div className="aurora-orb-sm" />
          <span className="brand-name">Nexora</span>
        </div>

        <button className="new-chat-btn" onClick={handleNewChat}>
          <Plus size={16} /> New chat
        </button>

        <div className="history-label">Recent</div>
        <div style={{ overflowY: "auto", flex: 1 }}>
          {conversations.map((c) => (
            <button
              key={c.id}
              className={`history-item ${c.id === activeId ? "active" : ""}`}
              onClick={() => {
                setActiveId(c.id);
                setSidebarOpen(false);
              }}
            >
              {c.title}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="user-pill" onClick={onSignOut} style={{ width: "100%", border: "none" }}>
            <span className="user-avatar">{firstName(name)[0]?.toUpperCase()}</span>
            <span style={{ flex: 1, textAlign: "left" }}>{name}</span>
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <button className="icon-btn" onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle sidebar">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className="topbar-title">{active?.title || "New chat"}</span>
          <span style={{ width: 32 }} />
        </div>

        <div className="chat-scroll" ref={scrollRef}>
          {isEmpty ? (
            <>
              <div className="aurora-field">
                <span /><span /><span />
              </div>
              <div className="welcome-wrap">
                <h1 className="welcome-greeting">
                  Hello, <span className="aurora-text">{firstName(name)}</span>
                </h1>
                <p className="welcome-sub">What would you like to work on today?</p>
                <div className="suggestion-grid">
                  {SUGGESTIONS.map(({ text, icon: Icon }) => (
                    <button key={text} className="suggestion-card" onClick={() => setInput(text)}>
                      <Icon size={16} />
                      <span>{text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="chat-inner">
              {active!.messages.map((m) => (
                <div key={m.id} className={`msg-row ${m.role}`}>
                  {m.role === "assistant" && <div className="aurora-orb-sm msg-avatar" />}
                  <div>
                    <div className="msg-content">
                      {m.content.split("\n").map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                    {m.role === "assistant" && (
                      <button
                        className="icon-btn"
                        style={{ marginTop: 4 }}
                        onClick={() => (speakingId === m.id ? stop() : speak(m.id, m.content))}
                        aria-label="Read aloud"
                      >
                        {speakingId === m.id ? <Square size={14} /> : <Volume2 size={14} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="typing-row">
                  <div className="aurora-orb-sm" />
                  <div className="typing-dots">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              {errorNotice && <div className="auth-error">{errorNotice}</div>}
            </div>
          )}
        </div>

        <div className="composer-wrap" style={{ position: "relative" }}>
          {exportOpen && active && active.messages.length > 0 && (
            <div className="export-menu">
              <button onClick={() => { exportAsTxt(active); setExportOpen(false); }}>
                <FileText size={14} /> Export as .txt
              </button>
              <button onClick={() => { exportAsMarkdown(active); setExportOpen(false); }}>
                <FileText size={14} /> Export as .md
              </button>
              <button onClick={() => { exportAsPdf(active); setExportOpen(false); }}>
                <FileDown size={14} /> Export as .pdf
              </button>
            </div>
          )}
          <div className="composer">
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Message Nexora…"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoGrow(e.target);
              }}
              onKeyDown={handleKeyDown}
            />
            <div className="composer-actions">
              {active && active.messages.length > 0 && (
                <button
                  className="icon-btn"
                  onClick={() => setExportOpen((v) => !v)}
                  aria-label="Export conversation"
                >
                  <Download size={17} />
                </button>
              )}
              {micSupported && (
                <button
                  className={`mic-btn ${listening ? "listening" : ""}`}
                  onClick={toggleMic}
                  aria-label="Voice input"
                  type="button"
                >
                  <Mic size={16} />
                </button>
              )}
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={!input.trim() || sending}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
          <div className="composer-hint">Nexora can make mistakes. Check important info.</div>
        </div>
      </main>
    </div>
  );
}
