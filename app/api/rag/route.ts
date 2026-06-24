import {
  clearVectorStore,
  ensureRagInitialized,
  getVectorStoreStatus,
  ingestJsonData,
} from "@/lib/rag.service";
import type { RagIngestPayload } from "@/types/rag";

export async function GET() {
  try {
    await ensureRagInitialized();
    return Response.json(getVectorStoreStatus());
  } catch (error) {
    console.error("[rag GET]", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to get status" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RagIngestPayload;

    if (body.data === undefined) {
      return Response.json({ error: "Missing `data` field in body" }, { status: 400 });
    }

    const result = await ingestJsonData(body.data, body.source);
    return Response.json(result);
  } catch (error) {
    console.error("[rag POST]", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to ingest JSON" },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  try {
    const status = clearVectorStore();
    return Response.json({ success: true, status });
  } catch (error) {
    console.error("[rag DELETE]", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to clear store" },
      { status: 500 }
    );
  }
}
