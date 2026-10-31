"use client";
import Link from "next/link";
import ProductArt from "./ProductArt";
import StockBadge from "./StockBadge";
import styles from "./ProductCard.module.css";

export const formatPrice = (n) => `$${Number(n).toFixed(2)}`;

// Pass `onAsk` to prefill the chat on the same page, or `askHref` to link to /shop.
export default function ProductCard({ product, onAsk, askHref }) {
  const soldOut = product.stock <= 0;
  const label = `Ask AI about ${product.name}`;

  return (
    <article className={`card ${styles.card}`}>
      <div className={styles.artWrap}>
        <ProductArt product={product} />
        <span className={`badge ${styles.category}`}>{product.category}</span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.desc}>{product.description}</p>
        <div className={styles.meta}>
          <span className={styles.price}>{formatPrice(product.price)}</span>
          <StockBadge stock={product.stock} />
        </div>
        {onAsk ? (
          <button type="button" className={`btn btn-soft btn-sm ${styles.ask}`} onClick={() => onAsk(product)} disabled={soldOut} aria-label={label}>
            <SparkIcon /> Ask AI about this
          </button>
        ) : (
          <Link href={askHref || `/shop?ask=${product.id}`} className={`btn btn-soft btn-sm ${styles.ask}`} aria-label={label}>
            <SparkIcon /> Ask AI for a deal
          </Link>
        )}
      </div>
    </article>
  );
}

export function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2zM19 14l.9 2.6 2.6.9-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14z" />
    </svg>
  );
}
