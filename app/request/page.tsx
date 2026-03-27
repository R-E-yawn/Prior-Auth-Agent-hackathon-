"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PatientSummary } from "@/lib/types";
import { FORM_TYPES } from "@/lib/types";

function RequestForm() {
  const router = useRouter();
  const params = useSearchParams();
  const patientId = params.get("patientId") ?? "";
  const formType = params.get("formType") ?? "medication";

  const [patient, setPatient] = useState<PatientSummary | null>(null);
  const [requestText, setRequestText] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  const formLabel =
    FORM_TYPES.find((f) => f.id === formType)?.label ?? "Prior Authorization";

  useEffect(() => {
    if (!patientId) {
      router.push("/");
      return;
    }
    fetch(`/api/patients?id=${patientId}`)
      .then((r) => r.json())
      .then((data) => {
        setPatient({
          id: data.id,
          name: data.name,
          dob: "",
          memberId: "",
          primaryDiagnosis: "",
          requestedMedication: "",
        });
      });
  }, [patientId, router]);

  const handleSubmit = () => {
    if (!requestText.trim()) return;
    const sessionData = {
      patientId,
      formType,
      requestText: requestText.trim(),
      isUrgent,
      questionAnswers: [],
    };
    sessionStorage.setItem("authRequest", JSON.stringify(sessionData));
    router.push("/processing");
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-sm text-slate-500 hover:text-slate-700 mb-3 flex items-center gap-1"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Describe the Request</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Tell the AI what this prior authorization is for. Be as specific as
          possible.
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator current={2} />

      {/* Context banner */}
      {patient && (
        <div className="card p-4 bg-indigo-50 border-indigo-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
            {patient.name
              .split(" ")
              .slice(0, 2)
              .map((n: string) => n[0])
              .join("")}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-indigo-900 text-sm">
              {patient.name}
            </p>
            <p className="text-xs text-indigo-600">
              {formLabel} · ID: {patientId.toUpperCase()}
            </p>
          </div>
          <span className="text-xs text-indigo-600 bg-white border border-indigo-200 px-2.5 py-1 rounded-full font-medium">
            Patient Selected
          </span>
        </div>
      )}

      {/* Request form */}
      <div className="card p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-slate-900 text-sm">
            Describe what this prior authorization is for
          </label>
          <p className="text-xs text-slate-500">
            Include the medication, the clinical reason, any relevant history,
            and why it&apos;s needed. The AI will extract the details.
          </p>
          <textarea
            className="mt-1 w-full border border-slate-200 rounded-lg p-4 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 placeholder:text-slate-400 min-h-[200px] transition-all"
            placeholder={`Example: "This PA is for Humira 40mg biweekly for Alice's moderate-to-severe Crohn's disease. She has failed mesalamine and azathioprine over the past two years and continues to have active disease with elevated CRP. Adalimumab is medically necessary for induction and maintenance of remission."`}
            value={requestText}
            onChange={(e) => setRequestText(e.target.value)}
          />
          <p className="text-xs text-slate-400 text-right">
            {requestText.length} characters
          </p>
        </div>

        {/* Urgency toggle */}
        <div className="flex flex-col gap-3">
          <label className="font-semibold text-slate-900 text-sm">
            Request Urgency
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setIsUrgent(false)}
              className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                !isUrgent
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              📋 Routine
              <p className="text-xs font-normal mt-0.5 opacity-70">
                Standard 14-day review
              </p>
            </button>
            <button
              onClick={() => setIsUrgent(true)}
              className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                isUrgent
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-red-300"
              }`}
            >
              ⚡ Expedited
              <p className="text-xs font-normal mt-0.5 opacity-70">
                72-hour clinical urgency
              </p>
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!requestText.trim()}
          className="btn-primary w-full text-center text-base py-3"
        >
          Launch AI Agents →
        </button>
      </div>

      {/* What happens next */}
      <div className="card p-5 bg-slate-50">
        <p className="section-label mb-3">What happens next</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "💬", label: "Question Agent", desc: "Identifies gaps" },
            { icon: "👤", label: "Patient Agent", desc: "Reviews records" },
            { icon: "📋", label: "Step Therapy Agent", desc: "Documents trials" },
            { icon: "🔬", label: "Clinical Agent", desc: "Builds justification" },
          ].map((a) => (
            <div key={a.label} className="flex items-center gap-2.5">
              <span className="text-lg">{a.icon}</span>
              <div>
                <p className="text-xs font-semibold text-slate-700">{a.label}</p>
                <p className="text-xs text-slate-500">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
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
                  ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {step.n < current ? "✓" : step.n}
            </div>
            <span
              className={`text-xs font-medium ${
                step.n === current ? "text-indigo-700" : "text-slate-400"
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

export default function RequestPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 text-sm">Loading…</div>}>
      <RequestForm />
    </Suspense>
  );
}
