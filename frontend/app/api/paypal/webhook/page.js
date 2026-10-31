import { store } from "@/lib/store";
import { verifyWebhook } from "@/lib/paypal";

export async function POST(req) {
  const raw = await req.text();
  const event = JSON.parse(raw);

  const valid = await verifyWebhook(req.headers, event);
  if (!valid) return new Response("Invalid signature", { status: 400 });

  if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
    const paypalOrderId = event.resource?.supplementary_data?.related_ids?.order_id;
    const order = store.orders.find((o) => o.paypalOrderId === paypalOrderId);
    if (order && order.status !== "paid") {
      order.status = "paid";
      order.paidAt = new Date().toISOString();
    }
  }
  return new Response("ok");
}