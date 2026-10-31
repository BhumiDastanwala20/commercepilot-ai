"use client";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import PromptChips from "./PromptChips";
import styles from "./ChatPanel.module.css";

const MAX_CHARS = 500;
const MAX_HISTORY = 20;
const GREETING = {
  id: "greeting",
  role: "assistant",
  content: "Hi! I'm your shopping assistant. Ask me about any product, and I'll help you find it and get the best price.",
};

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// `ref` exposes prefill(text) so product cards can drop a question into the input.
export default function ChatPanel({ ref }) {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const logRef = useRef(null);
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    prefill(text) {
      setInput(text.slice(0, MAX_CHARS));
      inputRef.current?.focus();
    },
  }));

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function request(convo) {
    setLoading(true);
    try {
      const history = convo
        .filter((m) => (m.role === "user" || m.role === "assistant") && m.id !== GREETING.id)
        .slice(-MAX_HISTORY)
        .map(({ role, content }) => ({ role, content }));

      let res;
      try {
        res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
        });
      } catch {
        throw new Error("Network error. Check your connection and try again.");
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");

      setMessages([...convo, { id: uid(), role: "assistant", content: data.reply || "…", order: data.order || null, at: Date.now() }]);
    } catch (e) {
      setMessages([...convo, { id: uid(), role: "error", content: e.message, at: Date.now() }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function send(text) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const convo = [...messages.filter((m) => m.role !== "error"), { id: uid(), role: "user", content: content.slice(0, MAX_CHARS), at: Date.now() }];
    setMessages(convo);
    setInput("");
    request(convo);
  }

  function retry() {
    if (loading) return;
    request(messages.filter((m) => m.role !== "error"));
  }

  const hasUserMessages = messages.some((m) => m.role === "user");
  const remaining = MAX_CHARS - input.length;

  return (
    <section className={`card ${styles.panel}`} aria-label="Chat with the sales assistant">
      <header className={styles.head}>
        <span className={`${styles.avatar} ${styles.avatarLg}`} aria-hidden="true">
          AI
        </span>
        <div>
          <h2 className={styles.title}>Sales assistant</h2>
          <p className={styles.status}>
            <span className="dot" /> Online · replies in seconds
          </p>
        </div>
      </header>

      <div ref={logRef} className={styles.log} role="log" aria-live="polite" aria-relevant="additions" aria-busy={loading}>
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} onRetry={retry} retryDisabled={loading} />
        ))}
        {loading && <TypingIndicator />}
      </div>

      <div className={styles.composer}>
        {!hasUserMessages && <PromptChips onPick={send} disabled={loading} />}
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label htmlFor="chat-input" className="sr-only">
            Message the sales assistant
          </label>
          <input
            id="chat-input"
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={loading ? "Assistant is replying…" : "Ask about a product or a deal…"}
            maxLength={MAX_CHARS}
            autoComplete="off"
            disabled={loading}
            aria-describedby={remaining < 100 ? "chat-count" : undefined}
          />
          <button type="submit" className={`btn btn-primary ${styles.send}`} disabled={loading || !input.trim()} aria-label="Send message">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </form>
        {remaining < 100 && (
          <p id="chat-count" className={styles.count}>
            {remaining} characters left
          </p>
        )}
      </div>
    </section>
  );
}
