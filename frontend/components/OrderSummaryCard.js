"use client";
import { useEffect, useState } from "react";
import ProductArt from "./ProductArt";
import styles from "./OrderSummaryCard.module.css";

export const money = (n) => `$${Number(n || 0).toFixed(2)}`;

const STATUS = {
  awaiting_payment: { label: "Ready to pay", tone: "accent" },
  approval_needed: { label: "Awaiting owner approval", tone: "warning" },
  paid: { label: "Paid", tone: "success" },
  rejected: { label: "Not approved", tone: "danger" },
};

export function OrderLines({ order }) {
  return (
    <>
      <ul className={styles.items}>
        {order.items.map((i) => (
          <li key={i.productId} className={styles.item}>
            <ProductArt product={{ id: i.productId, category: i.category }} size="sm" />
            <div className={styles.itemInfo}>
              <span className={styles.itemName}>{i.name}</span>
              <span className={styles.itemMeta}>
                {i.qty} × {money(i.unitPrice)}
                {i.unitPrice < i.listPrice && <s className={styles.strike}>{money(i.listPrice)}</s>}
              </span>
            </div>
            <span className={styles.lineTotal}>{money(i.unitPrice * i.qty)}</span>
          </li>
        ))}
      </ul>
      <dl className={styles.totals}>
        <div>
          <dt>Subtotal</dt>
          <dd>{money(order.subtotal)}</dd>
        </div>
        {order.discount > 0 && (
          <div className={styles.saving}>
            <dt>Discount ({order.discountPercent}%)</dt>
            <dd>−{money(order.discount)}</dd>
          </div>
        )}
        <div className={styles.grand}>
          <dt>Total</dt>
          <dd>
            {money(order.total)} <span className={styles.currency}>{order.currency}</span>
          </dd>
        </div>
      </dl>
    </>
  );
}

export function PayPalWordmark() {
  return (
    <span className={styles.wordmark} aria-hidden="true">
      <span className={styles.pay}>Pay</span>
      <span className={styles.pal}>Pal</span>
    </span>
  );
}

export default function OrderSummaryCard({ initialOrder }) {
  const [order, setOrder] = useState(initialOrder);

  // While the owner reviews a large order, poll so the Pay button appears once approved.
  useEffect(() => {
    if (order.status !== "approval_needed") return;
    const t = setInterval(() => {
      fetch(`/api/orders/${order.id}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((o) => {
          if (o && o.status !== "approval_needed") setOrder(o);
        })
        .catch(() => {});
    }, 4000);
    return () => clearInterval(t);
  }, [order.id, order.status]);

  const status = STATUS[order.status] || { label: order.status, tone: "accent" };

  return (
    <div className={styles.card} aria-label={`Order summary ${order.id}`} role="group">
      <div className={styles.head}>
        <span className={styles.heading}>Order summary</span>
        <span className={`badge badge-${status.tone}`}>
          <span className="dot" /> {status.label}
        </span>
      </div>

      <OrderLines order={order} />

      <div className={styles.foot}>
        {order.status === "awaiting_payment" && order.checkoutLink && (
          <>
            <a href={order.checkoutLink} className="btn btn-paypal" aria-label={`Pay ${money(order.total)} with PayPal`}>
              Pay with <PayPalWordmark />
            </a>
            <p className={styles.note}>
              <LockIcon /> Secure checkout · PayPal Sandbox
            </p>
          </>
        )}
        {order.status === "approval_needed" && (
          <p className={`${styles.notice} ${styles.noticeWarning}`}>
            This is a large order, so the shop owner needs to approve it. The Pay button will appear here automatically.
          </p>
        )}
        {order.status === "paid" && <p className={`${styles.notice} ${styles.noticeSuccess}`}>Payment received. Thank you!</p>}
        {order.status === "rejected" && (
          <p className={`${styles.notice} ${styles.noticeDanger}`}>The owner couldn&apos;t approve this order. Ask the assistant for another option.</p>
        )}
        <p className={styles.orderId}>Order {order.id}</p>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
