import type { ChatMessage } from "@/types/chat";

const STORAGE_KEY = "jarvis-chat-history";

interface StoredChatMessage {
  id: string;
  role: ChatMessage["role"];
  content: string;
  timestamp?: string;
}

function isValidMessage(value: unknown): value is StoredChatMessage {
  if (!value || typeof value !== "object") return false;

  const message = value as StoredChatMessage;

  return (
    typeof message.id === "string" &&
    (message.role === "user" ||
      message.role === "assistant" ||
      message.role === "system") &&
    typeof message.content === "string" &&
    message.content.trim().length > 0
  );
}

export function loadChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isValidMessage).map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp ? new Date(message.timestamp) : undefined,
    }));
  } catch {
    return [];
  }
}

export function saveChatHistory(messages: ChatMessage[]): void {
  if (typeof window === "undefined") return;

  try {
    const persistable = messages
      .filter((message) => message.content.trim().length > 0)
      .map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp?.toISOString(),
      }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  } catch {
    // Ignore quota or private browsing errors
  }
}

export function clearChatHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
