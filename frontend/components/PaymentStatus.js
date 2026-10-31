"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { OrderLines } from "./OrderSummaryCard";
import styles from "./PaymentStatus.module.css";

const BANNERS = {
  cancelled: { tone: "warning", text: "Payment cancelled. No money was taken. Ask the assistant whenever you're ready to try again." },
  failed: { tone: "danger", text: "We couldn't complete your PayPal payment. Please try again or ask the assistant for help." },
  unknown: { tone: "danger", text: "We couldn't find that order. Please start a new checkout from the chat." },
};

// Handles the PayPal return: ?paid=1&order=<id> shows a confirmation dialog,
// ?payment=cancelled|failed|unknown shows a banner.
export default function PaymentStatus() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("paid") ? params.get("order") : null;
  const payment = params.get("payment");
  const [loaded, setLoaded] = useState({ id: null, order: null, error: false });
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!orderId) return;
    let alive = true;
    fetch(`/api/orders/${encodeURIComponent(orderId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("not found"))))
      .then((order) => alive && setLoaded({ id: orderId, order, error: false }))
      .catch(() => alive && setLoaded({ id: orderId, order: null, error: true }));
    return () => {
      alive = false;
    };
  }, [orderId]);

  useEffect(() => {
    const d = dialogRef.current;
    if (orderId && d && !d.open) d.showModal();
  }, [orderId]);

  const clear = () => router.replace("/shop", { scroll: false });

  const banner = BANNERS[payment];
  const order = loaded.id === orderId ? loaded.order : null;
  const paid = order?.status === "paid";

  return (
    <>
      {banner && (
        <div className={`${styles.banner} ${styles[banner.tone]}`} role="status">
          <span>{banner.text}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={clear} aria-label="Dismiss message">
            ✕
          </button>
        </div>
      )}

      {orderId && (
        <dialog ref={dialogRef} className={styles.dialog} onClose={clear} aria-labelledby="pay-title">
          <div className={styles.check} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </div>
          <h2 id="pay-title" className={styles.title}>
            {order && !paid ? "We're confirming your payment" : "Payment received. Thank you!"}
          </h2>
          <p className={styles.sub}>
            {order && !paid
              ? "PayPal is finalizing your payment. This page will show it as paid in a moment."
              : "Your order is confirmed and the shop owner has been notified."}
          </p>

          {!order && !loaded.error && <div className="skeleton" style={{ height: 160 }} />}
          {loaded.error && loaded.id === orderId && <p className={styles.sub}>Order {orderId} is confirmed. Summary details are unavailable right now.</p>}
          {order && (
            <div className={styles.summary}>
              <div className={styles.ids}>
                <div>
                  <span>Order ID</span>
                  <code>{order.id}</code>
                </div>
                {order.paypalOrderId && (
                  <div>
                    <span>PayPal order</span>
                    <code>{order.paypalOrderId}</code>
                  </div>
                )}
              </div>
              <OrderLines order={order} />
            </div>
          )}

          <div className={styles.actions}>
            <button type="button" className="btn btn-primary" onClick={() => dialogRef.current?.close()} autoFocus>
              Continue shopping
            </button>
            <Link href="/" className="btn btn-secondary">
              Back to home
            </Link>
          </div>
        </dialog>
      )}
    </>
  );
}
