import { findOrderByPaypalId, updateOrder } from "@/lib/store";
import { verifyWebhook } from "@/lib/paypal";
import { jsonError } from "@/lib/api";

export async function POST(req) {
  let event;
  try {
    event = JSON.parse(await req.text());
  } catch {
    return jsonError("Invalid JSON.", 400);
  }
  if (!event || typeof event.event_type !== "string") return jsonError("Invalid webhook event.", 400);

  try {
    const valid = await verifyWebhook(req.headers, event);
    if (!valid) return jsonError("Invalid signature.", 400);

    if (event.event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const paypalOrderId = event.resource?.supplementary_data?.related_ids?.order_id;
      const order = findOrderByPaypalId(paypalOrderId);
      if (order && order.status !== "paid") {
        updateOrder(order.id, { status: "paid", paidAt: new Date().toISOString() });
      }
    }
    return Response.json({ received: true });
  } catch (e) {
    console.error("POST /api/paypal/webhook", e);
    // 500 tells PayPal to retry later.
    return jsonError("Webhook processing failed.", 500);
  }
}
