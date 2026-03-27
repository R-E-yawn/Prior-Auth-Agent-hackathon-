"use client";

import type { PriorAuthForm } from "@/lib/types";

interface FormDisplayProps {
  form: PriorAuthForm;
}

export function FormDisplay({ form }: FormDisplayProps) {
  return (
    <div className="flex flex-col gap-6">
      <Section title="Patient Information" icon="👤" color="blue">
        <Grid2>
          <Field label="Patient Name" value={form.patientInfo.name} />
          <Field label="Date of Birth" value={form.patientInfo.dob} />
          <Field label="Member ID" value={form.patientInfo.memberId} />
          <Field label="Group #" value={form.patientInfo.groupNumber} />
          <Field label="Phone" value={form.patientInfo.phone} />
          <Field label="Address" value={form.patientInfo.address} wide />
        </Grid2>
      </Section>

      <Section title="Prescriber / Requesting Provider" icon="🏥" color="indigo">
        <Grid2>
          <Field label="Provider Name" value={form.prescriberInfo.name} />
          <Field label="NPI" value={form.prescriberInfo.npi} />
          <Field label="DEA #" value={form.prescriberInfo.deaNumber} />
          <Field label="Practice Name" value={form.prescriberInfo.practiceName} />
          <Field label="Phone" value={form.prescriberInfo.phone} />
          <Field label="Fax" value={form.prescriberInfo.fax} />
          <Field label="Contact Person" value={form.prescriberInfo.contactPerson} />
          <Field label="Address" value={form.prescriberInfo.address} wide />
        </Grid2>
      </Section>

      <Section title="Requested Medication" icon="💊" color="violet">
        <Grid2>
          <Field
            label="Brand Name"
            value={form.requestedMedication.brandName}
          />
          <Field
            label="Generic Name"
            value={form.requestedMedication.genericName}
          />
          <Field
            label="Strength / Dose"
            value={form.requestedMedication.strength}
          />
          <Field label="Route" value={form.requestedMedication.route} />
          <Field label="Frequency" value={form.requestedMedication.frequency} />
          <Field label="Quantity" value={form.requestedMedication.quantity} />
          <Field label="Days Supply" value={form.requestedMedication.daysSupply} />
          <Field
            label="Expected Duration"
            value={form.requestedMedication.expectedDuration}
          />
        </Grid2>
      </Section>

      <Section title="Diagnosis" icon="🔍" color="rose">
        <Grid2>
          <Field label="Primary ICD-10" value={form.diagnosis.primaryICD10} />
          <Field
            label="Primary Description"
            value={form.diagnosis.primaryDescription}
          />
          {form.diagnosis.secondaryICD10 && (
            <>
              <Field
                label="Secondary ICD-10"
                value={form.diagnosis.secondaryICD10}
              />
              <Field
                label="Secondary Description"
                value={form.diagnosis.secondaryDescription}
              />
            </>
          )}
        </Grid2>
        {form.diagnosis.comorbidities.length > 0 && (
          <div className="mt-3">
            <p className="section-label mb-2">Relevant Comorbidities</p>
            <div className="flex flex-wrap gap-2">
              {form.diagnosis.comorbidities.map((c, i) => (
                <span
                  key={i}
                  className="text-xs bg-rose-50 border border-rose-200 text-rose-700 px-2.5 py-1 rounded-full"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </Section>

      <Section title="Clinical Information" icon="🔬" color="amber">
        <div className="flex flex-col gap-4">
          <TextBlock label="Symptoms & Severity" value={form.clinicalInfo.symptoms} />
          <TextBlock label="Relevant Lab Results" value={form.clinicalInfo.labResults} />
          <TextBlock
            label="Why This Medication Is Indicated"
            value={form.clinicalInfo.indication}
          />
          <TextBlock
            label="Why Formulary Alternatives Are Inappropriate"
            value={form.clinicalInfo.alternativesContraindicated}
          />
        </div>
      </Section>

      <Section title="Step Therapy Documentation" icon="📋" color="emerald">
        <div className="flex flex-col gap-3">
          {form.stepTherapy.map((entry, i) => (
            <div
              key={i}
              className="border border-slate-200 rounded-lg overflow-hidden"
            >
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                <p className="text-sm font-semibold text-slate-700">
                  Trial {i + 1}: {entry.drugName}
                </p>
              </div>
              <div className="p-4">
                <Grid2>
                  <Field label="Drug Name" value={entry.drugName} />
                  <Field label="Dose" value={entry.dose} />
                  <Field label="Start Date" value={entry.startDate} />
                  <Field label="End Date" value={entry.endDate} />
                  <Field label="Duration" value={entry.duration} />
                </Grid2>
                <div className="mt-3">
                  <p className="section-label mb-1">
                    Outcome / Reason for Discontinuation
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {entry.outcome}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Urgency" icon="⚡" color={form.urgency.type === "Expedited" ? "red" : "slate"}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <p className="section-label">Request Type</p>
            <span
              className={`text-sm font-semibold px-3 py-1 rounded-full ${
                form.urgency.type === "Expedited"
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              {form.urgency.type}
            </span>
          </div>
          {form.urgency.justification && (
            <TextBlock
              label="Expedited Justification"
              value={form.urgency.justification}
            />
          )}
        </div>
      </Section>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const colorMap: Record<string, { header: string; icon: string }> = {
  blue: { header: "bg-blue-600", icon: "text-blue-100" },
  indigo: { header: "bg-indigo-600", icon: "text-indigo-100" },
  violet: { header: "bg-violet-600", icon: "text-violet-100" },
  rose: { header: "bg-rose-600", icon: "text-rose-100" },
  amber: { header: "bg-amber-500", icon: "text-amber-100" },
  emerald: { header: "bg-emerald-600", icon: "text-emerald-100" },
  red: { header: "bg-red-600", icon: "text-red-100" },
  slate: { header: "bg-slate-600", icon: "text-slate-100" },
};

function Section({
  title,
  icon,
  color,
  children,
}: {
  title: string;
  icon: string;
  color: string;
  children: React.ReactNode;
}) {
  const c = colorMap[color] ?? colorMap.slate;
  return (
    <div className="card overflow-hidden">
      <div className={`${c.header} px-5 py-3 flex items-center gap-2`}>
        <span className={`text-lg ${c.icon}`}>{icon}</span>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : ""}>
      <p className="section-label mb-0.5">{label}</p>
      <p className="text-sm text-slate-800 font-medium">{value || "—"}</p>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="section-label mb-1">{label}</p>
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
        {value || "—"}
      </p>
    </div>
  );
}
