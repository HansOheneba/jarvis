import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {
  INSUFFICIENT_BALANCE_MESSAGE,
  JARVIS_ERROR_MESSAGES,
  JARVIS_PERSONAL_SYSTEM_PROMPT,
  JARVIS_SYSTEM_PROMPT,
  pickJarvisMessage,
} from "@/lib/jarvis";
import {
  DEEPSEEK_MODEL,
  FINANCIAL_ADVISOR_MAX_TOKENS,
  FINANCIAL_ADVISOR_TEMPERATURE,
  MAX_HISTORY_LENGTH,
  MAX_RESPONSE_TOKENS,
  TEMPERATURE,
} from "@/lib/constants";
import { processQueryWithRag } from "@/lib/rag.service";
import type { ApiChatMessage, ChatMode, ChatRequestBody } from "@/types/chat";
import type { RagContext } from "@/types/rag";

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

function toOpenAIMessages(
  systemPrompt: string,
  messages: ApiChatMessage[]
): ChatCompletionMessageParam[] {
  return [
    { role: "system", content: systemPrompt },
    ...messages.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ];
}

function pickErrorMessage(): string {
  return pickJarvisMessage(JARVIS_ERROR_MESSAGES);
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

function resolveChatMode(mode: unknown): ChatMode {
  return mode === "personal" ? "personal" : "general";
}

function emptyRagContext(query: string): RagContext {
  return {
    used: false,
    query,
    chunks: [],
    contextText: "",
  };
}

function getLatestUserQuery(messages: ApiChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i].role === "user") {
      return messages[i].content;
    }
  }
  return "";
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

    const history = body.messages.slice(-MAX_HISTORY_LENGTH);
    const mode = resolveChatMode(body.mode);
    const latestQuery = getLatestUserQuery(history);

    let systemPrompt: string;
    let rag: RagContext;

    if (mode === "personal") {
      const result = await processQueryWithRag(
        latestQuery,
        JARVIS_PERSONAL_SYSTEM_PROMPT
      );
      systemPrompt = result.systemPrompt;
      rag = result.rag;
    } else {
      systemPrompt = JARVIS_SYSTEM_PROMPT;
      rag = emptyRagContext(latestQuery);
    }

    const client = getOpenAIClient();
    const stream = await client.chat.completions.create({
      model: DEEPSEEK_MODEL,
      messages: toOpenAIMessages(systemPrompt, history),
      stream: true,
      max_tokens:
        mode === "personal" ? FINANCIAL_ADVISOR_MAX_TOKENS : MAX_RESPONSE_TOKENS,
      temperature:
        mode === "personal" ? FINANCIAL_ADVISOR_TEMPERATURE : TEMPERATURE,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                rag:
                  mode === "personal"
                    ? {
                        used: rag.used,
                        chunkCount: rag.chunks.length,
                        sources: rag.used
                          ? [
                              ...new Set(
                                rag.chunks.map((c) => c.chunk.metadata.source)
                              ),
                            ]
                          : [],
                      }
                    : undefined,
              })}\n\n`
            )
          );

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
