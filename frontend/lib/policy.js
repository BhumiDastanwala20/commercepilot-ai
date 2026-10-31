import { getProduct, getRules } from "./store";

export function getFloorPrice(product, qty) {
  const { maxDiscountPercent, bulkThreshold, bulkDiscountPercent } = getRules();
  const disc = qty >= bulkThreshold ? bulkDiscountPercent : maxDiscountPercent;
  const byRule = product.price * (1 - disc / 100);
  return Math.round(Math.max(byRule, product.minPrice) * 100) / 100;
}

export function checkDiscount(productId, qty, requestedPrice) {
  const product = getProduct(productId);
  if (!product) return { status: "rejected", reason: "Unknown product." };
  if (!Number.isInteger(qty) || qty < 1) return { status: "rejected", reason: "Invalid quantity." };
  if (qty > product.stock) return { status: "rejected", reason: `Only ${product.stock} in stock.` };

  const rules = getRules();
  const requested = Number(requestedPrice);
  const floor = getFloorPrice(product, qty);
  const unit = Math.min(Math.max(Number.isFinite(requested) && requested > 0 ? requested : product.price, floor), product.price);
  const total = Math.round(unit * qty * 100) / 100;

  if (total > rules.approvalAbove) {
    return { status: "needs_approval", unitPrice: unit, total, reason: `Order total exceeds $${rules.approvalAbove}; owner must approve.` };
  }
  if (requested >= unit && requested <= product.price) {
    return { status: "approved", unitPrice: unit, total, reason: "Within owner rules." };
  }
  return { status: "countered", unitPrice: unit, total, reason: `Lowest allowed price is $${floor} per unit.` };
}
