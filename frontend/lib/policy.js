import { store } from "./store";

export function getFloorPrice(product, qty) {
  const { maxDiscountPercent, bulkThreshold, bulkDiscountPercent } = store.rules;
  const disc = qty >= bulkThreshold ? bulkDiscountPercent : maxDiscountPercent;
  const byRule = product.price * (1 - disc / 100);
  return Math.round(Math.max(byRule, product.minPrice) * 100) / 100;
}

export function checkDiscount(productId, qty, requestedPrice) {
  const product = store.products.find((p) => p.id === productId);
  if (!product) return { status: "rejected", reason: "Unknown product." };
  if (!Number.isInteger(qty) || qty < 1) return { status: "rejected", reason: "Invalid quantity." };
  if (qty > product.stock) return { status: "rejected", reason: `Only ${product.stock} in stock.` };

  const floor = getFloorPrice(product, qty);
  const unit = Math.min(Math.max(Number(requestedPrice) || product.price, floor), product.price);
  const total = Math.round(unit * qty * 100) / 100;

  if (total > store.rules.approvalAbove) {
    return { status: "needs_approval", unitPrice: unit, total, reason: `Order total exceeds $${store.rules.approvalAbove}; owner must approve.` };
  }
  if (requestedPrice >= unit && requestedPrice <= product.price) {
    return { status: "approved", unitPrice: unit, total, reason: "Within owner rules." };
  }
  return { status: "countered", unitPrice: unit, total, reason: `Lowest allowed price is $${floor} per unit.` };
}