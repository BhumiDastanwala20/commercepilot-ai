"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 24, fontFamily: "system-ui" }}>
      {/* Hero */}
      <section style={{ textAlign: "center", padding: "48px 0 32px" }}>
        <h1 style={{ fontSize: 42, margin: 0 }}>CommercePilot AI</h1>
        <p style={{ fontSize: 18, color: "#475569", maxWidth: 560, margin: "12px auto 24px" }}>
          An AI sales agent that answers customers, negotiates within your rules,
          and sends a PayPal checkout link, 24/7.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/shop"
            style={{ background: "#2563eb", color: "#fff", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}
          >
            Chat with the sales agent
          </Link>
          <Link
            href="/dashboard"
            style={{ background: "#f1f5f9", color: "#111", padding: "12px 24px", borderRadius: 8, textDecoration: "none", fontWeight: 600 }}
          >
            Owner dashboard
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, margin: "16px 0 40px" }}>
        {[
          ["1. Ask", "Customer chats about products"],
          ["2. Negotiate", "AI haggles, code enforces your limits"],
          ["3. Pay", "PayPal checkout link in the chat"],
          ["4. Track", "Sale appears live on your dashboard"],
        ].map(([title, text]) => (
          <div key={title} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
            <b>{title}</b>
            <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>{text}</p>
          </div>
        ))}
      </section>

      {/* Product grid */}
      <h2>Our products</h2>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {products.map((p) => (
          <div key={p.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 16 }}>
            <div style={{ height: 90, background: "#f8fafc", borderRadius: 8, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
              🛍️
            </div>
            <b>{p.name}</b>
            <p style={{ color: "#64748b", fontSize: 13, margin: "6px 0" }}>{p.description}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700 }}>${p.price}</span>
              <Link href="/shop" style={{ fontSize: 13, color: "#2563eb" }}>
                Ask AI for a deal →
              </Link>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}