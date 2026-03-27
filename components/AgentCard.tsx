"use client";

import type { AgentMeta } from "@/lib/types";

type Status = "idle" | "running" | "done" | "error";

interface AgentCardProps {
  meta: AgentMeta;
  status: Status;
  output: string;
}

const colorMap: Record<
  string,
  { bg: string; border: string; badge: string; dot: string; text: string }
> = {
  violet: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    badge: "bg-violet-100 text-violet-700",
    dot: "bg-violet-500",
    text: "text-violet-700",
  },
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
    text: "text-blue-700",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    text: "text-amber-700",
  },
};

const icons: Record<string, string> = {
  questions: "💬",
  patient: "👤",
  stepTherapy: "📋",
  clinical: "🔬",
  form: "📄",
};

export function AgentCard({ meta, status, output }: AgentCardProps) {
  const colors = colorMap[meta.color] ?? colorMap.blue;

  return (
    <div
      className={`card p-4 flex flex-col gap-3 transition-all duration-300 ${
        status === "running" ? `${colors.bg} ${colors.border}` : ""
      } ${status === "done" ? "border-slate-200" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{icons[meta.id]}</span>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{meta.label}</p>
            <p className="text-xs text-slate-500">{meta.description}</p>
          </div>
        </div>
        <StatusBadge status={status} colors={colors} />
      </div>

      {/* Output area */}
      <div
        className={`min-h-[80px] max-h-[160px] overflow-y-auto rounded-lg p-3 text-xs font-mono leading-relaxed transition-colors ${
          status === "idle"
            ? "bg-slate-50 text-slate-400"
            : status === "running"
            ? `${colors.bg} ${colors.text}`
            : "bg-slate-50 text-slate-600"
        }`}
      >
        {status === "idle" && (
          <span className="italic">Waiting to start…</span>
        )}
        {status === "running" && output.length === 0 && (
          <span className="italic">Analyzing…</span>
        )}
        {output.length > 0 && (
          <span className={status === "running" ? "cursor-blink" : ""}>
            {output}
          </span>
        )}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  colors,
}: {
  status: Status;
  colors: (typeof colorMap)[string];
}) {
  if (status === "idle") {
    return (
      <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">
        Idle
      </span>
    );
  }
  if (status === "running") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-medium ${colors.badge} px-2 py-0.5 rounded-full whitespace-nowrap`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse`}
        />
        Running
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
        ✓ Done
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
      Error
    </span>
  );
}
