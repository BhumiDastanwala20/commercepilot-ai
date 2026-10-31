import { getOrder, toCustomerOrder } from "@/lib/store";
import { jsonError } from "@/lib/api";

// Customer-facing order lookup (used by the chat card and the payment confirmation screen).
export async function GET(_req, { params }) {
  try {
    const { id } = await params;
    if (!/^ord_[a-z0-9]{1,20}$/.test(id || "")) return jsonError("Invalid order id.");
    const order = getOrder(id);
    if (!order) return jsonError("Order not found.", 404);
    return Response.json(toCustomerOrder(order));
  } catch (e) {
    console.error("GET /api/orders/[id]", e);
    return jsonError("Could not load order.", 500);
  }
}
