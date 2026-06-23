export type {
  MessageRole,
  ChatMessage,
  ApiChatMessage,
  ChatRequestBody,
  ChatStreamChunk,
  ChatStatus,
} from "./chat";

export type StatusState = "online" | "offline" | "busy" | "typing";

export interface JarvisThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  foreground: string;
  mutedForeground: string;
  border: string;
  glow: string;
}
