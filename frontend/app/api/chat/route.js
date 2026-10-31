import { runAgent } from "@/lib/ai/agent";
import { appUrl, clientIp, jsonError, readJson } from "@/lib/api";
import { rateLimit } from "@/lib/rateLimit";

const MAX_MESSAGE_CHARS = 500;
const MAX_HISTORY = 20;
const RATE_LIMIT = { limit: 20, windowMs: 60_000 };

// Returns a cleaned history or an error string.
function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return { error: "messages must be a non-empty array." };

  let history = messages.slice(-MAX_HISTORY);
  for (const m of history) {
    if (!m || (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string") {
      return { error: 'Each message needs role "user" or "assistant" and string content.' };
    }
  }
  // Claude requires the conversation to start with a user turn.
  while (history.length && history[0].role !== "user") history = history.slice(1);

  const last = history[history.length - 1];
  if (!last || last.role !== "user") return { error: "The last message must be from the user." };
  if (!last.content.trim()) return { error: "Message cannot be empty." };
  if (last.content.length > MAX_MESSAGE_CHARS) return { error: `Message is too long (max ${MAX_MESSAGE_CHARS} characters).` };

  // Older turns are trimmed rather than rejected.
  return {
    history: history
      .filter((m) => m.content.trim())
      .map((m) => ({ role: m.role, content: m.content.slice(0, m.role === "user" ? MAX_MESSAGE_CHARS : 4000) })),
  };
}

export async function POST(req) {
  const limit = rateLimit(`chat:${clientIp(req)}`, RATE_LIMIT);
  if (!limit.ok) {
    return Response.json(
      { error: "Too many messages. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  const body = await readJson(req);
  if (!body) return jsonError("Request body must be a JSON object.");

  const { history, error } = validateMessages(body.messages);
  if (error) return jsonError(error);

  try {
    const result = await runAgent(history, { baseUrl: appUrl(req) });
    return Response.json(result);
  } catch (e) {
    console.error("POST /api/chat", e);
    return jsonError("Our assistant is having trouble right now. Please try again in a moment.", 502, {
      reply: "Sorry, I'm having trouble right now. Please try again in a moment.",
    });
  }
}
