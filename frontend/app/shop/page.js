"use client";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ChatPanel from "@/components/ChatPanel";
import ProductCard from "@/components/ProductCard";
import PaymentStatus from "@/components/PaymentStatus";
import useProducts from "@/components/useProducts";
import styles from "./shop.module.css";

// Handles links like /shop?ask=mug from the home page by prefilling the chat once.
function AskFromUrl({ products, onAsk }) {
  const params = useSearchParams();
  const askId = params.get("ask");
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !askId || products.length === 0) return;
    const p = products.find((x) => x.id === askId);
    if (p) {
      done.current = true;
      onAsk(p);
    }
  }, [askId, products, onAsk]);

  return null;
}

export default function ShopPage() {
  const { products, status } = useProducts();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const chatRef = useRef(null);
  const chatColRef = useRef(null);

  const categories = useMemo(() => ["All", ...new Set(products.map((p) => p.category).filter(Boolean))], [products]);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (category === "All" || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q))
    );
  }, [products, query, category]);

  const onAsk = useCallback((p) => {
    chatRef.current?.prefill(`Tell me about the ${p.name}. Is there a deal if I buy a few?`);
    // On stacked (mobile) layouts the chat is off-screen, so bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches) {
      chatColRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className={`container ${styles.page}`}>
      <Suspense fallback={null}>
        <PaymentStatus />
        <AskFromUrl products={products} onAsk={onAsk} />
      </Suspense>

      <div className={styles.layout}>
        <section className={styles.catalog} aria-labelledby="catalog-title">
          <div className={styles.catalogHead}>
            <div>
              <h1 id="catalog-title" className={styles.title}>
                Shop
              </h1>
              <p className={styles.sub}>Browse the catalog, or ask the assistant for recommendations and bulk deals.</p>
            </div>
            <label className={styles.search}>
              <span className="sr-only">Search products</span>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products" />
            </label>
          </div>

          <div className={styles.filters} role="group" aria-label="Filter by category">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.filter} ${category === c ? styles.filterActive : ""}`}
                aria-pressed={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>

          {status === "error" && <p role="alert">Could not load products. Please refresh the page.</p>}
          <div className={styles.grid} aria-busy={status === "loading"}>
            {status === "loading"
              ? Array.from({ length: 6 }, (_, i) => <div key={i} className="skeleton" style={{ height: 320 }} />)
              : visible.map((p) => <ProductCard key={p.id} product={p} onAsk={onAsk} />)}
          </div>
          {status === "ready" && visible.length === 0 && (
            <p className={styles.empty}>No products match. Try another search, or ask the assistant.</p>
          )}
        </section>

        <aside ref={chatColRef} className={styles.chatCol}>
          <ChatPanel ref={chatRef} />
        </aside>
      </div>
    </div>
  );
}
