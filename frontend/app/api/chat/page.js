import { runAgent } from "@/lib/ai/agent";

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const result = await runAgent(messages);
    return Response.json(result);
  } catch (e) {
    console.error(e);
    return Response.json({ reply: "Something went wrong on our side.", checkoutLink: null }, { status: 500 });
  }
}