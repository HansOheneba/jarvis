"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { MAX_HISTORY_LENGTH } from "@/lib/constants";
import {
  JARVIS_ERROR_MESSAGES,
  JARVIS_WELCOME_MESSAGES,
  pickJarvisMessage,
} from "@/lib/jarvis";
import { generateUUID } from "@/lib/uuid";
import type { ApiChatMessage, ChatMessage, ChatStatus } from "@/types/chat";

function createMessage(
  role: ChatMessage["role"],
  content: string
): ChatMessage {
  return {
    id: generateUUID(),
    role,
    content,
    timestamp: new Date(),
  };
}

function pickWelcomeMessage(): string {
  return pickJarvisMessage(JARVIS_WELCOME_MESSAGES);
}

function pickErrorMessage(): string {
  return pickJarvisMessage(JARVIS_ERROR_MESSAGES);
}

function toApiMessages(messages: ChatMessage[]): ApiChatMessage[] {
  return messages
    .filter(
      (message): message is ChatMessage & { role: "user" | "assistant" } =>
        (message.role === "user" || message.role === "assistant") &&
        message.content.trim().length > 0
    )
    .slice(-MAX_HISTORY_LENGTH)
    .map(({ role, content }) => ({ role, content }));
}

async function consumeStream(
  response: Response,
  onChunk: (content: string) => void
): Promise<void> {
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("No response stream");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;

      const data = line.slice(6).trim();
      if (data === "[DONE]") continue;

      const parsed = JSON.parse(data) as {
        content?: string;
        error?: string;
      };

      if (parsed.error) {
        throw new Error(parsed.error);
      }

      if (parsed.content) {
        onChunk(parsed.content);
      }
    }
  }
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    createMessage("assistant", pickWelcomeMessage()),
  ]);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef(messages);

  messagesRef.current = messages;

  const isLoading = status === "loading" || status === "streaming";

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) return;

      setError(null);
      setStatus("loading");

      const userMessage = createMessage("user", trimmed);
      const assistantId = generateUUID();
      const assistantPlaceholder = createMessage("assistant", "");
      assistantPlaceholder.id = assistantId;

      const apiMessages = toApiMessages([
        ...messagesRef.current,
        userMessage,
      ]);

      setMessages((prev) => [
        ...prev,
        userMessage,
        assistantPlaceholder,
      ]);
      setInput("");

      abortRef.current?.abort();
      const abortController = new AbortController();
      abortRef.current = abortController;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(payload?.error ?? pickErrorMessage());
        }

        setStatus("streaming");

        let streamedContent = "";

        await consumeStream(response, (chunk) => {
          streamedContent += chunk;
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, content: streamedContent }
                : message
            )
          );
        });

        if (!streamedContent.trim()) {
          throw new Error(pickErrorMessage());
        }

        setStatus("idle");
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          setStatus("idle");
          return;
        }

        const message =
          err instanceof Error ? err.message : pickErrorMessage();

        setError(message);
        setStatus("error");
        setMessages((prev) => {
          const withoutEmptyAssistant = prev.filter(
            (message) =>
              !(message.id === assistantId && !message.content.trim())
          );
          return [
            ...withoutEmptyAssistant,
            createMessage("system", message),
          ];
        });
      } finally {
        abortRef.current = null;
      }
    },
    [isLoading]
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      void sendMessage(input);
    },
    [input, sendMessage]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void sendMessage(input);
      }
    },
    [input, sendMessage]
  );

  const clearError = useCallback(() => {
    setError(null);
    if (status === "error") {
      setStatus("idle");
    }
  }, [status]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
  }, []);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isLoading,
    [input, isLoading]
  );

  return {
    messages,
    input,
    setInput,
    sendMessage,
    handleSubmit,
    handleKeyDown,
    isLoading,
    status,
    error,
    clearError,
    stop,
    canSend,
  };
}
