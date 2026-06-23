export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp?: Date;
}

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
