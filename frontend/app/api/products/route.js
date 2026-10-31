import { connection } from "next/server";
import { listProducts, toPublicProduct } from "@/lib/store";
import { jsonError } from "@/lib/api";

export async function GET() {
  // Stock changes at runtime, so never prerender this response.
  await connection();
  try {
    return Response.json(listProducts().map(toPublicProduct));
  } catch (e) {
    console.error("GET /api/products", e);
    return jsonError("Could not load products.", 500);
  }
}
