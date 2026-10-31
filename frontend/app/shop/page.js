"use client";
import { useState, useRef, useEffect } from "react";

export default function Shop() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! Looking for something today? I can help you find it and sort out the best price.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState({});
  const [paid, setPaid] = useState(false);
  const bottom = useRef(null);

  // Check if the buyer just came back from PayPal
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("paid")) {
      setPaid(true);
    }
  }, []);

  // Auto-scroll to the newest message (braces = nothing returned, no error)
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    if (!input.trim() || loading) return;

    const next = [...messages, { role: "user", content: input }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      // The API needs history to start with a user message,
      // so skip the first assistant greeting
      const history = next.filter((_, i) => i > 0);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();

      const idx = next.length; // index of the assistant reply we are adding
      setMessages([...next, { role: "assistant", content: data.reply }]);
      if (data.checkoutLink) {
        setLinks((l) => ({ ...l, [idx]: data.checkoutLink }));
      }
    } catch (e) {
      setMessages([
        ...next,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: 20, fontFamily: "system-ui" }}>
      <h1>CommercePilot Shop</h1>

      {paid && (
        <div style={{ background: "#d1fae5", padding: 12, borderRadius: 8, marginBottom: 12 }}>
          Payment received. Thank you! Your order is confirmed.
        </div>
      )}

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 12,
          height: 480,
          overflowY: "auto",
          padding: 12,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{ textAlign: m.role === "user" ? "right" : "left", margin: "8px 0" }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 12,
                maxWidth: "85%",
                whiteSpace: "pre-wrap",
                background: m.role === "user" ? "#2563eb" : "#f1f5f9",
                color: m.role === "user" ? "#fff" : "#111",
              }}
            >
              {m.content}
            </span>

            {links[i] && (
              <div style={{ marginTop: 6 }}>
                <a
                  href={links[i]}
                  style={{
                    background: "#ffc439",
                    padding: "8px 16px",
                    borderRadius: 20,
                    fontWeight: 700,
                    color: "#111",
                    textDecoration: "none",
                  }}
                >
                  Pay with PayPal
                </a>
              </div>
            )}
          </div>
        ))}

        {loading && <div style={{ color: "#888" }}>Typing...</div>}
        <div ref={bottom} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about a product..."
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
        />
        <button
          onClick={send}
          disabled={loading}
          style={{ padding: "10px 18px", borderRadius: 8 }}
        >
          Send
        </button>
      </div>
    </main>
  );
}