import { store } from "@/lib/store";

export async function GET() {
  const safe = store.products.map(({ minPrice, ...rest }) => rest);
  return Response.json(safe);
}