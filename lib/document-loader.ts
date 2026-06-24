import { readFile } from "node:fs/promises";
import path from "node:path";
import { RAG_CONFIG } from "@/config/rag.config";
import sampleData from "@/data/sample-data.json";
import { generateUUID } from "@/lib/uuid";
import type { DocumentChunk, JsonFlatEntry } from "@/types/rag";

export function flattenJson(
  value: unknown,
  jsonPath = ""
): JsonFlatEntry[] {
  if (value === null || value === undefined) {
    return jsonPath ? [{ path: jsonPath, text: `${jsonPath}: null` }] : [];
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return [{ path: jsonPath || "root", text: `${jsonPath || "root"}: []` }];
    }

    return value.flatMap((item, index) => {
      const itemPath = jsonPath ? `${jsonPath}[${index}]` : `[${index}]`;
      if (typeof item === "object" && item !== null) {
        return flattenJson(item, itemPath);
      }
      return [{ path: itemPath, text: `${itemPath}: ${String(item)}` }];
    });
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return [{ path: jsonPath || "root", text: `${jsonPath || "root"}: {}` }];
    }

    return entries.flatMap(([key, nested]) => {
      const nestedPath = jsonPath ? `${jsonPath}.${key}` : key;
      if (typeof nested === "object" && nested !== null) {
        return flattenJson(nested, nestedPath);
      }
      return [{ path: nestedPath, text: `${nestedPath}: ${String(nested)}` }];
    });
  }

  return [
    { path: jsonPath || "value", text: `${jsonPath || "value"}: ${String(value)}` },
  ];
}

export function chunkFlatEntries(
  entries: JsonFlatEntry[],
  source: string,
  chunkSize = RAG_CONFIG.chunkSize,
  chunkOverlap = RAG_CONFIG.chunkOverlap
): DocumentChunk[] {
  if (entries.length === 0) return [];

  const chunks: DocumentChunk[] = [];
  let buffer = "";
  let paths: string[] = [];
  let chunkIndex = 0;

  const pushChunk = () => {
    const content = buffer.trim();
    if (!content) return;

    chunks.push({
      id: generateUUID(),
      content,
      metadata: {
        source,
        paths: [...new Set(paths)],
        chunkIndex,
      },
    });
    chunkIndex += 1;
  };

  for (const entry of entries) {
    const line = `${entry.text}\n`;

    if (buffer.length + line.length > chunkSize && buffer.length > 0) {
      pushChunk();

      const overlapText = buffer.slice(
        Math.max(0, buffer.length - chunkOverlap)
      );
      buffer = overlapText + line;
      paths = entry.path ? [entry.path] : [];
    } else {
      buffer += line;
      if (entry.path) paths.push(entry.path);
    }
  }

  pushChunk();
  return chunks;
}

export function parseJsonToChunks(
  data: unknown,
  source?: string
): DocumentChunk[] {
  const label = source ?? RAG_CONFIG.defaultSource;
  const flat = flattenJson(data);
  return chunkFlatEntries(flat, label);
}

export function validateJsonSize(jsonString: string): void {
  const byteLength = new TextEncoder().encode(jsonString).length;
  if (byteLength > RAG_CONFIG.maxFileSizeBytes) {
    throw new Error(
      `JSON exceeds maximum size of ${RAG_CONFIG.maxFileSizeBytes} bytes`
    );
  }
}

export function parseJsonString(jsonString: string): unknown {
  validateJsonSize(jsonString);
  return JSON.parse(jsonString) as unknown;
}

export async function loadJsonFromFile(
  filePath: string,
  source?: string
): Promise<DocumentChunk[]> {
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(/* turbopackIgnore: true */ process.cwd(), filePath);

  const raw = await readFile(absolutePath, "utf-8");
  validateJsonSize(raw);
  const data = JSON.parse(raw) as unknown;
  const label = source ?? path.basename(filePath);
  return parseJsonToChunks(data, label);
}

export async function loadSampleData(): Promise<DocumentChunk[]> {
  // Bundled at build time — required for Vercel/serverless where fs paths are unavailable
  return parseJsonToChunks(sampleData, "sample-data.json");
}
