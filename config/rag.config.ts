/** RAG pipeline configuration */
export const RAG_CONFIG = {
  /** Target characters per chunk */
  chunkSize: 800,
  /** Overlap between consecutive chunks (characters) */
  chunkOverlap: 120,
  /** Number of chunks to retrieve per query */
  topK: 6,
  /** Minimum cosine similarity (0–1) to include a chunk */
  minSimilarity: 0.05,
  /** Max JSON payload size in bytes (10MB) */
  maxFileSizeBytes: 10 * 1024 * 1024,
  /** Default source label for ingested JSON */
  defaultSource: "json-knowledge-base",
  /** Sample data file path (relative to project root) */
  sampleDataPath: "data/sample-data.json",
  /** Embedding approach identifier */
  embeddingModel: "tf-idf",
} as const;

export type RagConfig = typeof RAG_CONFIG;
