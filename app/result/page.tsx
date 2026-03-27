"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PriorAuthForm, AuthRequest } from "@/lib/types";
import { FormDisplay } from "@/components/FormDisplay";

export default function ResultPage() {
  const router = useRouter();
  const [form, setForm] = useState<PriorAuthForm | null>(null);
  const [request, setRequest] = useState<AuthRequest | null>(null);
  const [callStatus, setCallStatus] = useState<
    Record<string, { loading?: boolean; callId?: string; error?: string }>
  >({});

  useEffect(() => {
    const rawForm = sessionStorage.getItem("completedForm");
    const rawReq = sessionStorage.getItem("authRequest");
    if (!rawForm || !rawReq) {
      router.push("/");
      return;
    }
    setForm(JSON.parse(rawForm));
    setRequest(JSON.parse(rawReq));
  }, [router]);

  const handlePrint = () => window.print();

  const handleStartNew = () => {
    sessionStorage.removeItem("authRequest");
    sessionStorage.removeItem("completedForm");
    router.push("/");
  };

  const handleCall = async (type: "patient" | "insurance") => {
    if (!form) return;
    setCallStatus((prev) => ({ ...prev, [type]: { loading: true } }));
    try {
      const res = await fetch("/api/bland/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCallStatus((prev) => ({ ...prev, [type]: { error: data.error ?? "Call failed." } }));
      } else {
        setCallStatus((prev) => ({ ...prev, [type]: { callId: data.call_id } }));
      }
    } catch {
      setCallStatus((prev) => ({ ...prev, [type]: { error: "Network error." } }));
    }
  };

  if (!form) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Loading form…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              ✓ Completed
            </span>
            {request?.isUrgent && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full">
                ⚡ Expedited
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Medication Prior Authorization
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {form.patientInfo.name} · {form.requestedMedication.brandName} (
            {form.requestedMedication.genericName}) ·{" "}
            {new Date().toLocaleDateString("en-CA")}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleCall("patient")}
            disabled={callStatus["patient"]?.loading}
            className="btn-secondary text-sm"
          >
            {callStatus["patient"]?.loading ? "Calling…" : "📞 Call Patient"}
          </button>
          <button
            onClick={() => handleCall("insurance")}
            disabled={callStatus["insurance"]?.loading}
            className="btn-secondary text-sm"
          >
            {callStatus["insurance"]?.loading ? "Calling…" : "📞 Call Insurance"}
          </button>
          <button onClick={handlePrint} className="btn-secondary text-sm">
            🖨 Print / Save PDF
          </button>
          <button onClick={handleStartNew} className="btn-primary text-sm">
            + New Authorization
          </button>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator current={4} />

      {/* Summary banner */}
      <div className="card p-4 bg-indigo-50 border-indigo-200">
        <div className="flex flex-wrap gap-6">
          <Stat label="Patient" value={form.patientInfo.name} />
          <Stat label="Medication" value={`${form.requestedMedication.brandName} ${form.requestedMedication.strength}`} />
          <Stat label="Diagnosis" value={form.diagnosis.primaryICD10.split("—")[0]?.trim() ?? form.diagnosis.primaryICD10} />
          <Stat label="Step Therapy Trials" value={`${form.stepTherapy.length} documented`} />
          <Stat label="Urgency" value={form.urgency.type} highlight={form.urgency.type === "Expedited"} />
        </div>
      </div>

      {/* Call status */}
      {Object.keys(callStatus).length > 0 && (
        <div className="card p-4 flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Voice Calls
          </p>
          {(["patient", "insurance"] as const).map((type) => {
            const s = callStatus[type];
            if (!s) return null;
            if (s.loading) return (
              <p key={type} className="text-sm text-slate-500">
                ⏳ {type === "patient" ? "Patient" : "Insurance"} call initiating…
              </p>
            );
            if (s.error) return (
              <p key={type} className="text-sm text-red-600">
                ✗ {type === "patient" ? "Patient" : "Insurance"} call failed: {s.error}
              </p>
            );
            if (s.callId) return (
              <p key={type} className="text-sm text-emerald-700">
                ✓ {type === "patient" ? "Patient" : "Insurance"} call initiated (ID: {s.callId})
              </p>
            );
            return null;
          })}
        </div>
      )}

      {/* The form */}
      <FormDisplay form={form} />

      {/* Bottom actions */}
      <div className="flex gap-3 py-4 flex-wrap">
        <button
          onClick={() => handleCall("patient")}
          disabled={callStatus["patient"]?.loading}
          className="btn-secondary"
        >
          {callStatus["patient"]?.loading ? "Calling…" : "📞 Call Patient"}
        </button>
        <button
          onClick={() => handleCall("insurance")}
          disabled={callStatus["insurance"]?.loading}
          className="btn-secondary"
        >
          {callStatus["insurance"]?.loading ? "Calling…" : "📞 Call Insurance"}
        </button>
        <button onClick={handlePrint} className="btn-secondary">
          🖨 Print / Save PDF
        </button>
        <button onClick={handleStartNew} className="btn-primary">
          + New Authorization
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
        {label}
      </p>
      <p className={`text-sm font-semibold mt-0.5 ${highlight ? "text-red-600" : "text-indigo-900"}`}>
        {value}
      </p>
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  const steps = [
    { n: 1, label: "Select" },
    { n: 2, label: "Describe" },
    { n: 3, label: "Analyze" },
    { n: 4, label: "Review" },
  ];
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => (
        <div key={step.n} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                step.n < current
                  ? "bg-indigo-600 text-white"
                  : step.n === current
                  ? "bg-emerald-600 text-white ring-4 ring-emerald-100"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {step.n < current ? "✓" : step.n === current ? "✓" : step.n}
            </div>
            <span
              className={`text-xs font-medium ${
                step.n === current
                  ? "text-emerald-700"
                  : step.n < current
                  ? "text-indigo-600"
                  : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`h-px w-8 mx-2 ${
                step.n < current ? "bg-indigo-400" : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
