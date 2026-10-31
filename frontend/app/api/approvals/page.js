import { store } from "@/lib/store";
import { createCheckout } from "@/lib/paypal";

export async function POST(req) {
  const { orderId, action } = await req.json();
  const order = store.orders.find((o) => o.id === orderId);
  if (!order || order.status !== "approval_needed") return Response.json({ error: "Not found" }, { status: 404 });

  if (action === "reject") {
    order.status = "rejected";
    return Response.json(order);
  }
  const { paypalOrderId, link } = await createCheckout(order.id, order.total, `${order.productName} x${order.qty}`);
  order.paypalOrderId = paypalOrderId;
  order.checkoutLink = link;
  order.status = "awaiting_payment";
  return Response.json(order);
}