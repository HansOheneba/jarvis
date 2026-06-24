import type { ChatMessage, ChatMode } from "@/types/chat";

const STORAGE_KEYS: Record<ChatMode, string> = {
  general: "jarvis-chat-history-general",
  personal: "jarvis-chat-history-personal",
};

const LEGACY_STORAGE_KEY = "jarvis-chat-history";

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

function parseStoredMessages(raw: string): ChatMessage[] {
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];

  return parsed.filter(isValidMessage).map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp ? new Date(message.timestamp) : undefined,
  }));
}

function migrateLegacyHistory(mode: ChatMode): ChatMessage[] {
  if (typeof window === "undefined" || mode !== "general") return [];

  try {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacy) return [];

    localStorage.setItem(STORAGE_KEYS.general, legacy);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    return parseStoredMessages(legacy);
  } catch {
    return [];
  }
}

export function loadChatHistory(mode: ChatMode): ChatMessage[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEYS[mode]);
    if (raw) return parseStoredMessages(raw);

    return migrateLegacyHistory(mode);
  } catch {
    return [];
  }
}

export function saveChatHistory(messages: ChatMessage[], mode: ChatMode): void {
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

    localStorage.setItem(STORAGE_KEYS[mode], JSON.stringify(persistable));
  } catch {
    // Ignore quota or private browsing errors
  }
}

export function clearChatHistory(mode: ChatMode): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS[mode]);
}
