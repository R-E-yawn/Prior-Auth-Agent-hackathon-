"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { AgentId, SSEEvent, AuthRequest } from "@/lib/types";
import { AGENTS } from "@/lib/types";
import { AgentCard } from "@/components/AgentCard";
import { QuestionPanel } from "@/components/QuestionPanel";

type AgentStatus = "idle" | "running" | "done" | "error";
type Phase = "parallel" | "form" | "done";

interface AgentState {
  status: AgentStatus;
  output: string;
}

type AgentsMap = Record<AgentId, AgentState>;

const initialAgents = (): AgentsMap =>
  Object.fromEntries(
    [...AGENTS, { id: "form" }].map(({ id }) => [
      id,
      { status: "idle" as AgentStatus, output: "" },
    ])
  ) as AgentsMap;

export default function ProcessingPage() {
  const router = useRouter();
  const [agents, setAgents] = useState<AgentsMap>(initialAgents);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [allParallelDone, setAllParallelDone] = useState(false);
  const [formRunning, setFormRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("parallel");
  const [error, setError] = useState<string | null>(null);
  const [requestData, setRequestData] = useState<AuthRequest | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const raw = sessionStorage.getItem("authRequest");
    if (!raw) {
      router.push("/");
      return;
    }
    const data = JSON.parse(raw) as AuthRequest;
    setRequestData(data);
    runStream(data, []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateAgent = (
    id: AgentId,
    patch: Partial<AgentState> | ((prev: AgentState) => Partial<AgentState>)
  ) =>
    setAgents((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...(typeof patch === "function" ? patch(prev[id]) : patch),
      },
    }));

  const runStream = async (
    data: AuthRequest,
    qaOverrides: { question: string; answer: string }[]
  ) => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    let res: Response;
    try {
      res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, questionAnswers: qaOverrides }),
        signal: abortRef.current.signal,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    const handle = (ev: SSEEvent) => {
      switch (ev.type) {
        case "agent_start":
          updateAgent(ev.agentId, { status: "running", output: "" });
          break;
        case "agent_chunk":
          updateAgent(ev.agentId, (p) => ({ output: p.output + ev.text }));
          break;
        case "agent_done":
          updateAgent(ev.agentId, { status: "done" });
          break;
        case "questions_parsed":
          setQuestions(ev.questions);
          break;
        case "all_parallel_done":
          setAllParallelDone(true);
          setPhase("form");
          break;
        case "form_start":
          setFormRunning(true);
          updateAgent("form", { status: "running", output: "" });
          break;
        case "form_chunk":
          updateAgent("form", (p) => ({ output: p.output + ev.text }));
          break;
        case "form_done":
          updateAgent("form", { status: "done" });
          setPhase("done");
          sessionStorage.setItem("completedForm", JSON.stringify(ev.form));
          setTimeout(() => router.push("/result"), 800);
          break;
        case "error":
          setError(ev.message);
          break;
      }
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              handle(JSON.parse(line.slice(6)));
            } catch {
              /* ignore */
            }
          }
        }
      }
    } catch (e) {
      if (e instanceof Error && e.name !== "AbortError") setError(e.message);
    }
  };

  const handleGenerateForm = () => {
    if (!requestData) return;
    const qaList = questions.map((q, i) => ({
      question: q,
      answer: answers[i]?.trim() || "No answer provided",
    }));
    // Reset all state for a fresh run with answers included
    setAgents(initialAgents());
    setAllParallelDone(false);
    // Set true immediately so the button disappears before the parallel agents
    // re-run — prevents double-clicks from aborting the stream mid-way.
    setFormRunning(true);
    setPhase("parallel");
    setError(null);
    runStream(requestData, qaList);
  };

  const parallelDone = AGENTS.filter(
    (a) => agents[a.id]?.status === "done"
  ).length;
  const progress = allParallelDone
    ? phase === "done"
      ? 100
      : formRunning
      ? 85
      : 75
    : Math.round((parallelDone / AGENTS.length) * 70);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button
          onClick={() => { abortRef.current?.abort(); router.push("/request"); }}
          className="text-sm text-slate-500 hover:text-slate-700 mb-3 flex items-center gap-1"
        >
          ← Back
        </button>
        <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Agents Analyzing</h1>
            <p className="text-slate-500 mt-1 text-sm">
              {phase === "parallel" && "Running 4 specialized agents in parallel…"}
              {phase === "form" && "Compiling final prior authorization form…"}
              {phase === "done" && "✓ Form complete — redirecting…"}
            </p>
          </div>
          <PhaseTag phase={phase} />
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-indigo-600 h-full rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {error && (
        <div className="card p-4 border-red-200 bg-red-50 text-red-700 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent cards */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="font-semibold text-slate-900 text-sm">Parallel Agents</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AGENTS.map((meta) => (
              <AgentCard
                key={meta.id}
                meta={meta}
                status={agents[meta.id]?.status ?? "idle"}
                output={agents[meta.id]?.output ?? ""}
              />
            ))}
          </div>

          {/* Form agent */}
          {allParallelDone && (
            <div className="flex flex-col gap-3 mt-1">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-500 font-medium px-2">Final Step</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              <div className={`card p-4 flex flex-col gap-3 ${formRunning ? "border-indigo-300 bg-indigo-50" : ""}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">📄</span>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Form Filling Agent</p>
                      <p className="text-xs text-slate-500">Compiles all agent outputs into the PA form</p>
                    </div>
                  </div>
                  {formRunning && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                      Running
                    </span>
                  )}
                  {phase === "done" && (
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      ✓ Done
                    </span>
                  )}
                </div>
                {agents.form.output && (
                  <div className="max-h-[120px] overflow-y-auto rounded-lg p-3 text-xs font-mono bg-indigo-50 text-indigo-800 leading-relaxed cursor-blink">
                    {agents.form.output}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Questions + CTA */}
        <div className="flex flex-col gap-4">
          <QuestionPanel
            questions={questions}
            answers={answers}
            onAnswer={(i, a) => setAnswers((prev) => ({ ...prev, [i]: a }))}
          />

          {allParallelDone && !formRunning && phase !== "done" && (
            <button
              onClick={handleGenerateForm}
              className="btn-primary w-full text-center py-3 text-base"
            >
              Generate Form →
            </button>
          )}

          {phase === "done" && (
            <div className="card p-4 bg-emerald-50 border-emerald-200 text-center">
              <p className="text-emerald-700 font-semibold text-sm">✓ Form Complete</p>
              <p className="text-xs text-emerald-600 mt-1">Redirecting to review…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PhaseTag({ phase }: { phase: Phase }) {
  const map: Record<Phase, { label: string; icon: string; cls: string }> = {
    parallel: { label: "Agents Running", icon: "⚙️", cls: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    form:     { label: "Compiling Form", icon: "📝", cls: "bg-violet-100 text-violet-700 border-violet-200" },
    done:     { label: "Complete",       icon: "✅", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  };
  const { label, icon, cls } = map[phase];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${cls}`}>
      {icon} {label}
    </span>
  );
}
