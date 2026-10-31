// Fixed-window in-memory rate limiter (per process). Good enough for a single
// Node instance; swap for Redis/Upstash when running multiple instances.
const g = globalThis;
if (!g.__rateLimits) g.__rateLimits = new Map();
const buckets = g.__rateLimits;

export function rateLimit(key, { limit = 20, windowMs = 60_000 } = {}) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 0, resetAt: now + windowMs };
    buckets.set(key, b);
  }
  b.count += 1;

  // Opportunistic cleanup so the map doesn't grow forever.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (now >= v.resetAt) buckets.delete(k);
  }

  return {
    ok: b.count <= limit,
    remaining: Math.max(0, limit - b.count),
    retryAfter: Math.ceil((b.resetAt - now) / 1000),
  };
}
