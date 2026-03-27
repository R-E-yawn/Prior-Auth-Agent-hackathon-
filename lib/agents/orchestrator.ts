import Anthropic from "@anthropic-ai/sdk";
import type { AgentId, PriorAuthForm, SSEEvent } from "../types";
import {
  QUESTION_AGENT_SYSTEM,
  PATIENT_AGENT_SYSTEM,
  STEP_THERAPY_AGENT_SYSTEM,
  CLINICAL_AGENT_SYSTEM,
  FORM_AGENT_SYSTEM,
  buildQuestionPrompt,
  buildPatientAgentPrompt,
  buildStepTherapyPrompt,
  buildClinicalPrompt,
  buildFormAgentPrompt,
} from "./prompts";
import { createAIClient, logAgentMetrics } from "./truefoundry-client";
import { aerospikeCache } from "../cache/aerospike-cache";

const MODEL = "claude-opus-4-6";

type SendFn = (event: SSEEvent) => void;

// ─── Individual agent runners ─────────────────────────────────────────────────

async function runAgent(
  client: Anthropic,
  agentId: AgentId,
  system: string,
  userPrompt: string,
  send: SendFn
): Promise<string> {
  const startTime = Date.now();
  send({ type: "agent_start", agentId, label: agentId });

  let fullText = "";

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 2048,
    system,
    messages: [{ role: "user", content: userPrompt }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      fullText += event.delta.text;
      send({ type: "agent_chunk", agentId, text: event.delta.text });
    }
  }

  const endTime = Date.now();
  send({ type: "agent_done", agentId });

  // Log metrics for monitoring (auto-tracked in TrueFoundry)
  logAgentMetrics(agentId, { startTime, endTime, model: MODEL });

  return fullText;
}

// ─── Question parser ──────────────────────────────────────────────────────────

function parseQuestions(raw: string): string[] {
  try {
    // Try to find a JSON array in the output
    const match = raw.match(/\[[\s\S]*\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      if (Array.isArray(parsed)) return parsed.filter((q) => typeof q === "string");
    }
  } catch {
    // Fallback: split by numbered lines
    const lines = raw
      .split("\n")
      .map((l) => l.replace(/^\d+[\.\)]\s*/, "").trim())
      .filter((l) => l.length > 10 && l.includes("?"));
    if (lines.length > 0) return lines.slice(0, 4);
  }
  return [];
}

// ─── Form JSON parser ─────────────────────────────────────────────────────────

function parseForm(raw: string): PriorAuthForm | null {
  try {
    // Strip markdown fences if present
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    return JSON.parse(cleaned) as PriorAuthForm;
  } catch {
    // Try to find a JSON object in the output
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as PriorAuthForm;
      } catch {
        return null;
      }
    }
    return null;
  }
}

// ─── Main orchestrator ────────────────────────────────────────────────────────

export interface OrchestratorInput {
  patientContext: string;
  requestText: string;
  isUrgent: boolean;
  questionAnswers: { question: string; answer: string }[];
}

export async function orchestrate(
  input: OrchestratorInput,
  send: SendFn
): Promise<void> {
  // Use TrueFoundry AI Gateway for production monitoring & cost tracking
  const client = createAIClient();
  const { patientContext, requestText, isUrgent, questionAnswers } = input;

  // Generate session ID for caching
  const sessionId = Buffer.from(`${patientContext.slice(0, 50)}-${requestText.slice(0, 50)}`).toString('base64');

  // Check Aerospike cache for previously computed agent outputs
  const cachedOutputs = await aerospikeCache.getAgentOutputs(sessionId);

  let questionsRaw: string;
  let patientSummary: string;
  let stepTherapySummary: string;
  let clinicalSummary: string;

  if (cachedOutputs && questionAnswers.length === 0) {
    // Cache hit - use previously computed results
    console.log('[Orchestrator] Using cached agent outputs');
    questionsRaw = cachedOutputs.questionAgentOutput || '';
    patientSummary = cachedOutputs.patientSummary || '';
    stepTherapySummary = cachedOutputs.stepTherapySummary || '';
    clinicalSummary = cachedOutputs.clinicalSummary || '';

    // Emit cached results to frontend
    send({ type: "agent_start", agentId: "questions", label: "questions" });
    send({ type: "agent_chunk", agentId: "questions", text: questionsRaw });
    send({ type: "agent_done", agentId: "questions" });

    send({ type: "agent_start", agentId: "patient", label: "patient" });
    send({ type: "agent_chunk", agentId: "patient", text: patientSummary });
    send({ type: "agent_done", agentId: "patient" });

    send({ type: "agent_start", agentId: "stepTherapy", label: "stepTherapy" });
    send({ type: "agent_chunk", agentId: "stepTherapy", text: stepTherapySummary });
    send({ type: "agent_done", agentId: "stepTherapy" });

    send({ type: "agent_start", agentId: "clinical", label: "clinical" });
    send({ type: "agent_chunk", agentId: "clinical", text: clinicalSummary });
    send({ type: "agent_done", agentId: "clinical" });
  } else {
    // Cache miss - run agents and cache results
    console.log('[Orchestrator] Running agents (no cache)');

    // ── Phase 1: Run 4 agents in parallel ────────────────────────────────────
    [questionsRaw, patientSummary, stepTherapySummary, clinicalSummary] =
      await Promise.all([
      runAgent(
        client,
        "questions",
        QUESTION_AGENT_SYSTEM,
        buildQuestionPrompt(patientContext, requestText, isUrgent),
        send
      ),
      runAgent(
        client,
        "patient",
        PATIENT_AGENT_SYSTEM,
        buildPatientAgentPrompt(patientContext),
        send
      ),
      runAgent(
        client,
        "stepTherapy",
        STEP_THERAPY_AGENT_SYSTEM,
        buildStepTherapyPrompt(patientContext),
        send
      ),
        runAgent(
          client,
          "clinical",
          CLINICAL_AGENT_SYSTEM,
          buildClinicalPrompt(patientContext, requestText),
          send
        ),
      ]);

    // Cache the agent outputs for future requests
    await aerospikeCache.cacheAgentOutputs(sessionId, {
      questionAgentOutput: questionsRaw,
      patientSummary,
      stepTherapySummary,
      clinicalSummary,
      timestamp: Date.now(),
    });
  }

  // Parse and emit questions
  const questions = parseQuestions(questionsRaw);
  if (questions.length > 0) {
    send({ type: "questions_parsed", questions });
  }

  send({ type: "all_parallel_done" });

  // If there are questions but no answers provided yet, stop here and wait for user input
  if (questions.length > 0 && questionAnswers.length === 0) {
    return;
  }

  // ── Phase 2: Form filling agent ───────────────────────────────────────────
  send({ type: "form_start" });

  const formPrompt = buildFormAgentPrompt(
    patientContext,
    requestText,
    isUrgent,
    questionAnswers,
    patientSummary,
    stepTherapySummary,
    clinicalSummary
  );

  let formRaw = "";

  const formStream = client.messages.stream({
    model: MODEL,
    max_tokens: 4096,
    system: FORM_AGENT_SYSTEM,
    messages: [{ role: "user", content: formPrompt }],
  });

  for await (const event of formStream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      formRaw += event.delta.text;
      send({ type: "form_chunk", text: event.delta.text });
    }
  }

  const form = parseForm(formRaw);
  if (form) {
    send({ type: "form_done", form });
  } else {
    send({ type: "error", message: "Failed to parse completed form. Please retry." });
  }
}
