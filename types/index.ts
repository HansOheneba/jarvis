export type {
  MessageRole,
  ChatMessage,
  ApiChatMessage,
  ChatRequestBody,
  ChatStreamChunk,
  ChatStatus,
  ChatMode,
} from "./chat";

export type {
  ChunkMetadata,
  DocumentChunk,
  VectorSearchResult,
  RagContext,
  VectorStoreStatus,
  RagIngestPayload,
  RagIngestResult,
  JsonFlatEntry,
} from "./rag";

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
