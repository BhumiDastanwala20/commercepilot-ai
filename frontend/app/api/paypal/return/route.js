import { NextResponse } from "next/server";
import { findOrderByPaypalId, updateOrder } from "@/lib/store";
import { captureOrder } from "@/lib/paypal";
import { appUrl } from "@/lib/api";

// PayPal redirects the buyer here after approval with ?token=<paypalOrderId>.
export async function GET(req) {
  const base = appUrl(req);
  const paypalOrderId = new URL(req.url).searchParams.get("token");
  const order = findOrderByPaypalId(paypalOrderId);
  if (!order) return NextResponse.redirect(new URL("/shop?payment=unknown", base));

  try {
    if (order.status !== "paid") {
      const { ok } = await captureOrder(paypalOrderId);
      if (!ok) return NextResponse.redirect(new URL(`/shop?payment=failed&order=${order.id}`, base));
      updateOrder(order.id, { status: "paid", paidAt: new Date().toISOString() });
    }
    return NextResponse.redirect(new URL(`/shop?paid=1&order=${order.id}`, base));
  } catch (e) {
    console.error("GET /api/paypal/return", e);
    return NextResponse.redirect(new URL(`/shop?payment=failed&order=${order.id}`, base));
  }
}
