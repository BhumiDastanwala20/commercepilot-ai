const BASE = "https://api-m.sandbox.paypal.com";

async function getToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString("base64");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("PayPal auth failed: " + (await res.text()));
  return (await res.json()).access_token;
}

export async function createCheckout(orderId, amount, description) {
  const token = await getToken();
  const res = await fetch(`${BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: orderId,
        description,
        amount: { currency_code: "USD", value: amount.toFixed(2) },
      }],
      payment_source: {
        paypal: {
          experience_context: {
            return_url: `${process.env.APP_URL}/api/paypal/return`,
            cancel_url: `${process.env.APP_URL}/shop`,
            user_action: "PAY_NOW",
          },
        },
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error("PayPal order failed: " + JSON.stringify(data));
  const link = data.links?.find((l) => l.rel === "payer-action")?.href;
  return { paypalOrderId: data.id, link };
}

export async function captureOrder(paypalOrderId) {
  const token = await getToken();
  const res = await fetch(`${BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  return { ok: res.ok, data: await res.json() };
}

export async function verifyWebhook(headers, event) {
  const token = await getToken();
  const res = await fetch(`${BASE}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: process.env.PAYPAL_WEBHOOK_ID,
      webhook_event: event,
    }),
  });
  const data = await res.json();
  return data.verification_status === "SUCCESS";
}