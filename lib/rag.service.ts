import { RAG_CONFIG } from "@/config/rag.config";
import {
  loadSampleData,
  parseJsonToChunks,
} from "@/lib/document-loader";
import { getVectorStore } from "@/lib/vector-store";
import type {
  RagContext,
  RagIngestResult,
  VectorStoreStatus,
} from "@/types/rag";

let initializationPromise: Promise<void> | null = null;

export async function ensureRagInitialized(): Promise<void> {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const store = getVectorStore();
      if (store.chunkCount === 0) {
        const chunks = await loadSampleData();
        store.addDocuments(chunks);
      }
    })();
  }

  await initializationPromise;
}

export function getVectorStoreStatus(): VectorStoreStatus {
  const store = getVectorStore();
  return {
    chunkCount: store.chunkCount,
    sources: store.getSources(),
    vocabularySize: store.getVocabularySize(),
    loadedAt: store.getLastLoadedAt(),
    embeddingModel: RAG_CONFIG.embeddingModel,
  };
}

export async function ingestJsonData(
  data: unknown,
  source?: string
): Promise<RagIngestResult> {
  const store = getVectorStore();
  const label = source ?? RAG_CONFIG.defaultSource;
  const chunks = parseJsonToChunks(data, label);
  const chunksAdded = store.addDocuments(chunks);

  return {
    success: true,
    chunksAdded,
    source: label,
    status: getVectorStoreStatus(),
  };
}

export function clearVectorStore(): VectorStoreStatus {
  getVectorStore().clear();
  initializationPromise = null;
  return getVectorStoreStatus();
}

export function retrieveContext(query: string): RagContext {
  const store = getVectorStore();
  const results = store.search(
    query,
    RAG_CONFIG.topK,
    RAG_CONFIG.minSimilarity
  );

  if (results.length === 0) {
    return {
      used: false,
      query,
      chunks: [],
      contextText: "",
    };
  }

  const contextText = results
    .map(
      (result, index) =>
        `[Context ${index + 1} | source: ${result.chunk.metadata.source} | paths: ${result.chunk.metadata.paths.join(", ")} | score: ${result.score.toFixed(3)}]\n${result.chunk.content}`
    )
    .join("\n\n");

  return {
    used: true,
    query,
    chunks: results,
    contextText,
  };
}

export function buildAugmentedSystemPrompt(
  basePrompt: string,
  context: RagContext
): string {
  if (!context.used) return basePrompt;

  return `${basePrompt}

---
RETRIEVED FINANCIAL DOSSIER (authoritative source — use these exact figures; analyze, don't just repeat):

${context.contextText}

---
How to use the dossier above:
- Weave these figures into natural conversation — no fixed headers, no emoji, no "your numbers" sections
- Cite at least three specific amounts, rates, or percentages from the file, embedded in prose
- Vary how you structure each reply; sound like a person, not a report
- Cross-reference when it helps (surplus vs goals, allocation vs risk band, debt APR vs cash flow)
- Do not mention RAG, vector stores, or chunks`;
}

export async function processQueryWithRag(
  query: string,
  baseSystemPrompt: string
): Promise<{ systemPrompt: string; rag: RagContext }> {
  await ensureRagInitialized();
  const rag = retrieveContext(query);
  const systemPrompt = buildAugmentedSystemPrompt(baseSystemPrompt, rag);
  return { systemPrompt, rag };
}
