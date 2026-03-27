import type { AuthRequest, SSEEvent } from "@/lib/types";
import { loadPatient, buildPatientContext } from "@/lib/patients";
import { orchestrate } from "@/lib/agents/orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min timeout for long agent runs

export async function POST(request: Request) {
  const body: AuthRequest = await request.json();
  const { patientId, requestText, isUrgent, questionAnswers } = body;

  const patient = loadPatient(patientId);
  if (!patient) {
    return new Response(JSON.stringify({ error: "Patient not found" }), {
      status: 404,
    });
  }

  const patientContext = buildPatientContext(patient);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: SSEEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch {
          // Controller may be closed
        }
      };

      try {
        await orchestrate(
          { patientContext, requestText, isUrgent, questionAnswers },
          send
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        send({ type: "error", message });
      } finally {
        try {
          controller.close();
        } catch {
          // Already closed
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
