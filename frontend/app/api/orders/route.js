import { connection } from "next/server";
import { listOrders } from "@/lib/store";
import { jsonError } from "@/lib/api";

export async function GET() {
  // Orders change at runtime, so never prerender this response.
  await connection();
  try {
    return Response.json(listOrders());
  } catch (e) {
    console.error("GET /api/orders", e);
    return jsonError("Could not load orders.", 500);
  }
}
