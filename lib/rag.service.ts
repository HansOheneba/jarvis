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
Instructions for using retrieved dossier (MANDATORY):
- Every response must cite **at least 4 specific figures** from the dossier above — amounts, percentages, dates, or scores
- Structure replies: brief opener → **📊 Your numbers** (bulleted figures) → analysis with math → numbered priorities → disclaimer
- Never use vague phrases ("healthy surplus", "strong portfolio") without the exact number in the same sentence
- Cross-reference sections: surplus vs goalsMeta.totalMonthlyNeeded, allocation vs riskAssessment.result.risk_band, liabilities APR vs surplus
- For general or off-topic questions, still anchor the answer in the client's actual financial position
- Do not mention "RAG", "vector store", or "chunks"
- Stay in Financial Advisor JARVIS character`;
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
