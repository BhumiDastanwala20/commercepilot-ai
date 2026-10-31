import { getOrder, updateOrder } from "@/lib/store";
import { createCheckout } from "@/lib/paypal";
import { appUrl, isNonEmptyString, jsonError, readJson } from "@/lib/api";

const ACTIONS = new Set(["approve", "reject"]);

export async function POST(req) {
  const body = await readJson(req);
  if (!body) return jsonError("Request body must be a JSON object.");

  const { orderId, action } = body;
  if (!isNonEmptyString(orderId, 40)) return jsonError("orderId is required.");
  if (!ACTIONS.has(action)) return jsonError('action must be "approve" or "reject".');

  const order = getOrder(orderId);
  if (!order) return jsonError("Order not found.", 404);
  if (order.status !== "approval_needed") return jsonError(`Order is ${order.status}, not awaiting approval.`, 409);

  if (action === "reject") {
    return Response.json(updateOrder(order.id, { status: "rejected" }));
  }

  try {
    const { paypalOrderId, link } = await createCheckout(order.id, order.total, `${order.productName} x${order.qty}`, appUrl(req));
    return Response.json(updateOrder(order.id, { paypalOrderId, checkoutLink: link, status: "awaiting_payment" }));
  } catch (e) {
    console.error("POST /api/approvals", e);
    return jsonError("Could not create the PayPal checkout. Check PayPal credentials and try again.", 502);
  }
}
