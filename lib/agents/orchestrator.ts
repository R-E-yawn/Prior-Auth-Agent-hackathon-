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
  send({ type: "agent_start", agentId, label: agentId });

  let fullText = "";

  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 7024,
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

  send({ type: "agent_done", agentId });
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
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const { patientContext, requestText, isUrgent, questionAnswers } = input;

  // ── Phase 1: Run 4 agents in parallel ────────────────────────────────────
  const [questionsRaw, patientSummary, stepTherapySummary, clinicalSummary] =
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
    max_tokens: 7096,
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
