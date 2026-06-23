export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp?: Date;
}

/** Payload sent to /api/chat — no id, system added server-side */
export interface ApiChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequestBody {
  messages: ApiChatMessage[];
}

export interface ChatStreamChunk {
  content?: string;
  error?: string;
}

export type ChatStatus = "idle" | "loading" | "streaming" | "error";
