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

const POLL_MS = 2000;
const MAX_POLLS = 30;

// Handles the PayPal return: ?paid=1&order=<id> shows a confirmation dialog,
// ?payment=cancelled|failed|unknown shows a banner.
export default function PaymentStatus() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get("paid") ? params.get("order") : null;
  const payment = params.get("payment");
  const [loaded, setLoaded] = useState({ id: null, order: null, error: false });
  const dialogRef = useRef(null);

  // Fetch the order, then keep polling while PayPal/webhook finalizes the capture.
  useEffect(() => {
    if (!orderId) return;
    let alive = true;
    let tries = 0;
    let timer;
    const load = () => {
      tries += 1;
      fetch(`/api/orders/${encodeURIComponent(orderId)}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error("not found"))))
        .then((order) => {
          if (!alive) return;
          setLoaded({ id: orderId, order, error: false });
          if (order.status !== "paid" && tries < MAX_POLLS) timer = setTimeout(load, POLL_MS);
        })
        .catch(() => alive && setLoaded({ id: orderId, order: null, error: true }));
    };
    load();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [orderId]);

  useEffect(() => {
    const d = dialogRef.current;
    if (orderId && d && !d.open) d.showModal();
  }, [orderId]);

  const clear = () => router.replace("/shop", { scroll: false });

  const banner = BANNERS[payment];
  const current = loaded.id === orderId ? loaded : { order: null, error: false };
  const order = current.order;
  const notFound = current.error;
  const paid = order?.status === "paid";
  const state = notFound ? "missing" : !order ? "loading" : paid ? "paid" : "pending";
  const COPY = {
    loading: { title: "Checking your payment…", sub: "One moment while we look up your order." },
    paid: { title: "Payment received. Thank you!", sub: "Your order is confirmed and the shop owner has been notified." },
    pending: { title: "We're confirming your payment", sub: "PayPal is finalizing your payment. This updates automatically." },
    missing: {
      title: "We couldn't find this order",
      sub: `We couldn't confirm order ${orderId}. If PayPal charged you, contact the shop with this order ID.`,
    },
  }[state];

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
          <div className={`${styles.check} ${state === "paid" ? "" : styles[`icon_${state}`]}`} aria-hidden="true">
            {state === "paid" ? (
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            ) : state === "missing" ? (
              <span className={styles.glyph}>!</span>
            ) : (
              <span className={styles.spinner} />
            )}
          </div>
          <h2 id="pay-title" className={styles.title}>
            {COPY.title}
          </h2>
          <p className={styles.sub} role="status">
            {COPY.sub}
          </p>

          {state === "loading" && <div className="skeleton" style={{ height: 160 }} />}
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
