import { store } from "@/lib/store";
import { captureOrder } from "@/lib/paypal";
import { NextResponse } from "next/server";

export async function GET(req) {
  const paypalOrderId = new URL(req.url).searchParams.get("token");
  const order = store.orders.find((o) => o.paypalOrderId === paypalOrderId);

  if (order && order.status !== "paid") {
    const { ok } = await captureOrder(paypalOrderId);
    if (ok) {
      order.status = "paid";
      order.paidAt = new Date().toISOString();
    }
  }
  return NextResponse.redirect(new URL("/shop?paid=1", process.env.APP_URL));
}