"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { PatientSummary } from "@/lib/types";
import { FORM_TYPES } from "@/lib/types";
import { ScribeCard } from "@/components/ScribeCard";
import { useDeepgramScribe } from "@/hooks/useDeepgramScribe";

export default function SelectPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<string>("medication");
  const [loading, setLoading] = useState(true);
  const { transcript, isRecording, error: scribeError, start, stop } = useDeepgramScribe();

  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then(setPatients)
      .finally(() => setLoading(false));
  }, []);

  const handleBegin = () => {
    if (!selectedPatient) return;
    if (isRecording) stop();
    if (transcript) sessionStorage.setItem("scribeTranscript", transcript);
    router.push(`/request?patientId=${selectedPatient}&formType=${selectedForm}`);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          New Prior Authorization
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Select a patient and form type to begin the AI-assisted authorization
          process.
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator current={1} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Patient selection */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Select Patient</h2>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              Secure EHR
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="card p-4 h-20 animate-pulse bg-slate-100"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {patients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatient(p.id)}
                  className={`card p-4 text-left transition-all hover:border-indigo-300 ${
                    selectedPatient === p.id
                      ? "border-indigo-500 bg-indigo-50 shadow-md"
                      : "hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          selectedPatient === p.id
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {p.name
                          .split(" ")
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">
                          {p.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          DOB: {p.dob} · ID: {p.memberId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-medium text-slate-700">
                        {p.requestedMedication}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 max-w-[180px] truncate">
                        {p.primaryDiagnosis}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Form type + CTA */}
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-slate-900">Select Form Type</h2>
          <div className="flex flex-col gap-3">
            {FORM_TYPES.map((form) => (
              <button
                key={form.id}
                onClick={() => setSelectedForm(form.id)}
                className={`card p-4 text-left transition-all ${
                  selectedForm === form.id
                    ? "border-indigo-500 bg-indigo-50"
                    : "hover:border-indigo-200"
                }`}
              >
                <p
                  className={`font-semibold text-sm ${
                    selectedForm === form.id
                      ? "text-indigo-700"
                      : "text-slate-900"
                  }`}
                >
                  {form.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {form.description}
                </p>
              </button>
            ))}
          </div>

          {/* Medical Scribe */}
          <ScribeCard
            transcript={transcript}
            isRecording={isRecording}
            error={scribeError}
            onStart={start}
            onStop={stop}
          />

          {/* Form preview */}
          <div className="card p-4 bg-slate-50">
            <p className="section-label mb-2">Form Template Preview</p>
            <p className="text-xs text-slate-500 font-mono leading-relaxed">
              ☐ Patient Information
              <br />
              ☐ Prescriber Details
              <br />
              ☐ Requested Medication
              <br />
              ☐ Diagnosis (ICD-10)
              <br />
              <span className="text-indigo-500">✦ Clinical Info (AI)</span>
              <br />
              <span className="text-indigo-500">✦ Step Therapy (AI)</span>
              <br />
              ☐ Urgency
            </p>
          </div>

          <button
            onClick={handleBegin}
            disabled={!selectedPatient}
            className="btn-primary w-full text-center"
          >
            Begin Authorization →
          </button>
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
