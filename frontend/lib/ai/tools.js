import { store } from "../store";
import { checkDiscount } from "../policy";
import { createCheckout } from "../paypal";

export const tools = [
  {
    name: "search_products",
    description: "Search the shop catalog by keyword. Returns matching products with list prices and stock.",
    input_schema: { type: "object", properties: { query: { type: "string" } }, required: ["query"] },
  },
  {
    name: "check_discount",
    description: "Ask the policy engine what price is allowed. ALWAYS call this before promising any price other than list price.",
    input_schema: {
      type: "object",
      properties: {
        productId: { type: "string" },
        qty: { type: "integer" },
        requestedUnitPrice: { type: "number" },
      },
      required: ["productId", "qty", "requestedUnitPrice"],
    },
  },
  {
    name: "create_checkout",
    description: "Create a PayPal checkout link once the customer has clearly agreed to buy. Price is re-validated by the system.",
    input_schema: {
      type: "object",
      properties: {
        productId: { type: "string" },
        qty: { type: "integer" },
        agreedUnitPrice: { type: "number" },
        reasoning: { type: "string", description: "One sentence on why this price was offered." },
      },
      required: ["productId", "qty", "agreedUnitPrice", "reasoning"],
    },
  },
];

export async function runTool(name, input) {
  if (name === "search_products") {
    const q = input.query.toLowerCase();
    const hits = store.products.filter((p) =>
      (p.name + " " + p.description).toLowerCase().split(/\s+/).some((w) => q.includes(w) && w.length > 2) ||
      (p.name + p.description).toLowerCase().includes(q)
    );
    const list = hits.length ? hits : store.products;
    return list.map(({ id, name, description, price, stock }) => ({ id, name, description, price, stock }));
  }

  if (name === "check_discount") {
    return checkDiscount(input.productId, input.qty, input.requestedUnitPrice);
  }

  if (name === "create_checkout") {
    // Never trust the AI's price: re-run the policy.
    const verdict = checkDiscount(input.productId, input.qty, input.agreedUnitPrice);
    if (verdict.status === "rejected") return { error: verdict.reason };

    const product = store.products.find((p) => p.id === input.productId);
    const order = {
      id: "ord_" + Math.random().toString(36).slice(2, 8),
      productId: product.id,
      productName: product.name,
      qty: input.qty,
      unitPrice: verdict.unitPrice,
      total: verdict.total,
      status: "awaiting_payment",
      reasoning: input.reasoning,
      paypalOrderId: null,
      checkoutLink: null,
      createdAt: new Date().toISOString(),
    };

    if (verdict.status === "needs_approval") {
      order.status = "approval_needed";
      store.orders.unshift(order);
      return { status: "needs_approval", orderId: order.id, message: "Sent to the owner for approval. The customer will get a link once approved." };
    }

    const { paypalOrderId, link } = await createCheckout(order.id, order.total, `${product.name} x${order.qty}`);
    order.paypalOrderId = paypalOrderId;
    order.checkoutLink = link;
    store.orders.unshift(order);
    return { status: "ready", orderId: order.id, total: order.total, unitPrice: order.unitPrice, checkoutLink: link };
  }

  return { error: "Unknown tool" };
}