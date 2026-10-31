// In-memory data store. All data access goes through the functions below so a
// real database can replace this module later without touching routes or the AI layer.
const g = globalThis;

if (!g.__store) {
  g.__store = {
    rules: { maxDiscountPercent: 10, bulkThreshold: 10, bulkDiscountPercent: 15, approvalAbove: 500 },
    orders: [],
    products: [
      { id: "mug", name: "Ceramic Coffee Mug", category: "Kitchen", description: "350ml handmade mug, blue/white/black", price: 18, minPrice: 13, stock: 200 },
      { id: "notebook", name: "Leather Notebook", category: "Stationery", description: "A5 refillable, brown leather", price: 32, minPrice: 24, stock: 80 },
      { id: "tote", name: "Canvas Tote Bag", category: "Accessories", description: "Heavy cotton tote, natural", price: 15, minPrice: 10, stock: 150 },
      { id: "candle", name: "Scented Soy Candle", category: "Home", description: "Lavender or vanilla, 40hr burn", price: 22, minPrice: 16, stock: 120 },
      { id: "organizer", name: "Wooden Desk Organizer", category: "Desk", description: "Walnut finish, 5 compartments", price: 45, minPrice: 34, stock: 40 },
      { id: "stand", name: "Phone Stand", category: "Tech", description: "Aluminum adjustable, silver/black", price: 25, minPrice: 18, stock: 90 },
      { id: "charger", name: "Wireless Charging Pad", category: "Tech", description: "15W Qi charger", price: 29, minPrice: 21, stock: 60 },
      { id: "giftbox", name: "Gift Box Set", category: "Gifts", description: "Mug + candle + notebook, gift wrapped", price: 60, minPrice: 48, stock: 30 },
    ],
  };
}

const db = g.__store;

// Products (server-side: includes minPrice)
export function listProducts() {
  return db.products;
}

export function getProduct(id) {
  return db.products.find((p) => p.id === id) || null;
}

// Browser-safe view: never expose minPrice / floor prices.
export function toPublicProduct({ minPrice: _minPrice, ...rest }) {
  return rest;
}

// Orders
export function listOrders() {
  return db.orders;
}

export function getOrder(id) {
  return db.orders.find((o) => o.id === id) || null;
}

export function findOrderByPaypalId(paypalOrderId) {
  if (!paypalOrderId) return null;
  return db.orders.find((o) => o.paypalOrderId === paypalOrderId) || null;
}

export function addOrder(order) {
  db.orders.unshift(order);
  return order;
}

export function updateOrder(id, patch) {
  const order = getOrder(id);
  if (!order) return null;
  Object.assign(order, patch, { updatedAt: new Date().toISOString() });
  return order;
}

export function newOrderId() {
  return "ord_" + Math.random().toString(36).slice(2, 8);
}

// Owner rules
export function getRules() {
  return db.rules;
}

const round2 = (n) => Math.round(n * 100) / 100;

// Customer-safe view of an order (no AI reasoning or internal notes).
export function toCustomerOrder(o) {
  if (!o) return null;
  const listPrice = o.listPrice ?? getProduct(o.productId)?.price ?? o.unitPrice;
  const items = (o.items || [{ productId: o.productId, name: o.productName, qty: o.qty, listPrice, unitPrice: o.unitPrice }]).map((i) => ({
    ...i,
    category: getProduct(i.productId)?.category || null,
  }));
  const subtotal = round2(items.reduce((s, i) => s + i.listPrice * i.qty, 0));
  const discount = round2(Math.max(0, subtotal - o.total));
  return {
    id: o.id,
    items,
    subtotal,
    discount,
    discountPercent: subtotal > 0 ? Math.round((discount / subtotal) * 1000) / 10 : 0,
    total: o.total,
    currency: "USD",
    status: o.status,
    checkoutLink: o.status === "awaiting_payment" ? o.checkoutLink : null,
    paypalOrderId: o.paypalOrderId || null,
    createdAt: o.createdAt,
    paidAt: o.paidAt || null,
  };
}
