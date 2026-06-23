import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {
  DEEPSEEK_MODEL,
  INSUFFICIENT_BALANCE_MESSAGE,
  JARVIS_ERROR_MESSAGES,
  JARVIS_SYSTEM_PROMPT,
  MAX_HISTORY_LENGTH,
  MAX_RESPONSE_TOKENS,
  TEMPERATURE,
} from "@/lib/constants";
import type { ApiChatMessage, ChatRequestBody } from "@/types/chat";

function getOpenAIClient() {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is not configured");
  }

  return new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey,
  });
}

function validateMessages(messages: unknown): messages is ApiChatMessage[] {
  if (!Array.isArray(messages) || messages.length === 0) {
    return false;
  }

  return messages.every(
    (message) =>
      message &&
      typeof message === "object" &&
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string" &&
      message.content.trim().length > 0
  );
}

function toOpenAIMessages(messages: ApiChatMessage[]): ChatCompletionMessageParam[] {
  return [
    { role: "system", content: JARVIS_SYSTEM_PROMPT },
    ...messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];
}

function pickErrorMessage(): string {
  return JARVIS_ERROR_MESSAGES[
    Math.floor(Math.random() * JARVIS_ERROR_MESSAGES.length)
  ];
}

function isInsufficientBalanceError(error: unknown): boolean {
  if (error instanceof OpenAI.APIError) {
    return (
      error.status === 402 ||
      error.message.toLowerCase().includes("insufficient balance")
    );
  }

  if (error instanceof Error) {
    return error.message.toLowerCase().includes("insufficient balance");
  }

  return false;
}

function resolveApiError(error: unknown): {
  message: string;
  status: number;
  code?: string;
} {
  if (isInsufficientBalanceError(error)) {
    return {
      message: INSUFFICIENT_BALANCE_MESSAGE,
      status: 402,
      code: "insufficient_balance",
    };
  }

  if (error instanceof Error && error.message.includes("DEEPSEEK_API_KEY")) {
    return { message: "API key not configured", status: 500 };
  }

  return { message: pickErrorMessage(), status: 500 };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody;

    if (!validateMessages(body.messages)) {
      return Response.json(
        { error: "Invalid messages payload" },
        { status: 400 }
      );
    }

    const client = getOpenAIClient();
    const history = body.messages.slice(-MAX_HISTORY_LENGTH);
    const stream = await client.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: toOpenAIMessages(history),
      stream: true,
      max_tokens: MAX_RESPONSE_TOKENS,
      temperature: TEMPERATURE,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          const resolved = resolveApiError(error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: resolved.message, code: resolved.code })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[chat]", error);

    const { message, status, code } = resolveApiError(error);

    return Response.json({ error: message, code }, { status });
  }
}
