// Small helpers shared by API route handlers.

export function jsonError(message, status = 400, extra = {}) {
  return Response.json({ error: message, ...extra }, { status });
}

// Parses a JSON object body. Returns null for invalid JSON or non-object bodies.
export async function readJson(req) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;
    return body;
  } catch {
    return null;
  }
}

export function clientIp(req) {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "local";
}

export function isNonEmptyString(v, max = 200) {
  return typeof v === "string" && v.trim().length > 0 && v.length <= max;
}

// Base URL used for PayPal return/cancel links.
export function appUrl(req) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (req) return new URL(req.url).origin;
  return "http://localhost:3000";
}
