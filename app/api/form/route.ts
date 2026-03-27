import type { SSEEvent } from "@/lib/types";
import { loadPatient, buildPatientContext } from "@/lib/patients";
import { orchestrateFormOnly, type FormOnlyInput } from "@/lib/agents/orchestrator";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface FormRequest extends Omit<FormOnlyInput, "patientContext"> {
  patientId: string;
}

export async function POST(request: Request) {
  const body: FormRequest = await request.json();
  const { patientId, ...rest } = body;

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
        await orchestrateFormOnly({ patientContext, ...rest }, send);
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
