import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  safeValidateUIMessages,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 30;

const chatRequestSchema = z.object({
  messages: z.unknown(),
});

const SYSTEM_PROMPT = `
You are a concise, thoughtful AI assistant in a production chat app.
Render answers in Markdown when it improves clarity.
Use fenced code blocks with language tags for code.
Prefer practical, direct answers and ask a clarifying question only when needed.
`.trim();

export async function POST(request: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      {
        error:
          "Missing GOOGLE_GENERATIVE_AI_API_KEY. Add it to .env.local and restart the dev server.",
      },
      { status: 500 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsedBody = chatRequestSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json({ error: "Invalid chat request." }, { status: 400 });
  }

  const validation = await safeValidateUIMessages<UIMessage>({
    messages: parsedBody.data.messages,
  });

  if (!validation.success) {
    return Response.json({ error: validation.error.message }, { status: 400 });
  }

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(validation.data),
    abortSignal: request.signal,
    temperature: 0.7,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      sendReasoning: false,
    }),
  });
}
