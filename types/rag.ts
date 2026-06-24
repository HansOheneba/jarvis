export interface ChunkMetadata {
  source: string;
  paths: string[];
  chunkIndex: number;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: ChunkMetadata;
}

export interface VectorSearchResult {
  chunk: DocumentChunk;
  score: number;
}

export interface RagContext {
  used: boolean;
  query: string;
  chunks: VectorSearchResult[];
  contextText: string;
}

export interface VectorStoreStatus {
  chunkCount: number;
  sources: string[];
  vocabularySize: number;
  loadedAt: string | null;
  embeddingModel: string;
}

export interface RagIngestPayload {
  data?: unknown;
  source?: string;
}

export interface RagIngestResult {
  success: boolean;
  chunksAdded: number;
  source: string;
  status: VectorStoreStatus;
}

export interface JsonFlatEntry {
  path: string;
  text: string;
}
