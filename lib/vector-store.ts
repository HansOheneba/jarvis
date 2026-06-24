import type { DocumentChunk, VectorSearchResult } from "@/types/rag";

type SparseVector = Map<string, number>;

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/\b[a-z0-9]{2,}\b/g) ?? [];
}

function toSparseVector(tokens: string[], idf: Map<string, number>): SparseVector {
  const tf = new Map<string, number>();

  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }

  const vector: SparseVector = new Map();
  const total = tokens.length || 1;

  for (const [term, count] of tf) {
    const idfValue = idf.get(term);
    if (idfValue === undefined) continue;
    vector.set(term, (count / total) * idfValue);
  }

  return vector;
}

function cosineSimilarity(a: SparseVector, b: SparseVector): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const value of a.values()) {
    normA += value * value;
  }

  for (const value of b.values()) {
    normB += value * value;
  }

  const smaller = a.size < b.size ? a : b;
  const larger = a.size < b.size ? b : a;

  for (const [term, valueA] of smaller) {
    const valueB = larger.get(term);
    if (valueB !== undefined) {
      dot += valueA * valueB;
    }
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

interface StoredEntry {
  chunk: DocumentChunk;
  vector: SparseVector;
}

export class InMemoryVectorStore {
  private entries: StoredEntry[] = [];
  private idf: Map<string, number> = new Map();
  private loadedAt: string | null = null;

  get chunkCount(): number {
    return this.entries.length;
  }

  getLastLoadedAt(): string | null {
    return this.loadedAt;
  }

  getSources(): string[] {
    return [...new Set(this.entries.map((entry) => entry.chunk.metadata.source))];
  }

  clear(): void {
    this.entries = [];
    this.idf = new Map();
    this.loadedAt = null;
  }

  addDocuments(chunks: DocumentChunk[]): number {
    if (chunks.length === 0) return 0;

    for (const chunk of chunks) {
      this.entries.push({ chunk, vector: new Map() });
    }

    this.rebuildIndex();
    this.loadedAt = new Date().toISOString();
    return chunks.length;
  }

  private rebuildIndex(): void {
    const documentFrequency = new Map<string, number>();
    const totalDocs = this.entries.length;

    for (const entry of this.entries) {
      const uniqueTerms = new Set(tokenize(entry.chunk.content));
      for (const term of uniqueTerms) {
        documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
      }
    }

    this.idf = new Map(
      [...documentFrequency.entries()].map(([term, df]) => [
        term,
        Math.log((totalDocs + 1) / (df + 1)) + 1,
      ])
    );

    this.entries = this.entries.map((entry) => ({
      chunk: entry.chunk,
      vector: toSparseVector(tokenize(entry.chunk.content), this.idf),
    }));
  }

  search(
    query: string,
    topK: number,
    minSimilarity: number
  ): VectorSearchResult[] {
    if (this.entries.length === 0) return [];

    const queryVector = toSparseVector(tokenize(query), this.idf);

    return this.entries
      .map((entry) => ({
        chunk: entry.chunk,
        score: cosineSimilarity(queryVector, entry.vector),
      }))
      .filter((result) => result.score >= minSimilarity)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  getVocabularySize(): number {
    return this.idf.size;
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __jarvisVectorStore: InMemoryVectorStore | undefined;
}

export function getVectorStore(): InMemoryVectorStore {
  if (!global.__jarvisVectorStore) {
    global.__jarvisVectorStore = new InMemoryVectorStore();
  }
  return global.__jarvisVectorStore;
}
