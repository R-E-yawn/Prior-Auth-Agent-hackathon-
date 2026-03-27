import { NextResponse } from "next/server";
import nunjucks from "nunjucks";
import path from "path";
import type { PriorAuthForm } from "@/lib/types";

// Configure Nunjucks to load templates from the pdf-prior-auth folder
const templateDir = path.join(process.cwd(), "pdf-prior-auth");
const env = nunjucks.configure(templateDir, { autoescape: true });

export async function POST(request: Request) {
  const form: PriorAuthForm = await request.json();

  // Flatten the nested PriorAuthForm into the flat variable names the template expects
  const context = {
    dateOfRequest: new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
    authNumber: `PA-${Date.now().toString(36).toUpperCase()}`,
    payerName: "[Health Plan Name]",
    planPhone: "[Plan Phone / Fax]",

    // Urgency
    isRoutine: form.urgency.type === "Routine",
    isExpedited: form.urgency.type === "Expedited",
    expeditedJustification: form.urgency.justification,

    // Section 1 — Patient
    patientName: form.patientInfo.name,
    patientDOB: form.patientInfo.dob,
    memberID: form.patientInfo.memberId,
    groupNumber: form.patientInfo.groupNumber,
    patientAddress: form.patientInfo.address,
    patientPhone: form.patientInfo.phone,

    // Section 2 — Prescriber
    providerName: form.prescriberInfo.name,
    providerNPI: form.prescriberInfo.npi,
    providerDEA: form.prescriberInfo.deaNumber,
    practiceName: form.prescriberInfo.practiceName,
    practiceAddress: form.prescriberInfo.address,
    practicePhone: form.prescriberInfo.phone,
    practiceFax: form.prescriberInfo.fax,
    contactPerson: form.prescriberInfo.contactPerson,

    // Section 3 — Medication
    drugBrand: form.requestedMedication.brandName,
    drugGeneric: form.requestedMedication.genericName,
    drugStrength: form.requestedMedication.strength,
    drugRoute: form.requestedMedication.route,
    drugFrequency: form.requestedMedication.frequency,
    quantityRequested: form.requestedMedication.quantity,
    daysSupply: form.requestedMedication.daysSupply,
    therapyDuration: form.requestedMedication.expectedDuration,

    // Section 4 — Diagnosis
    icd10Primary: form.diagnosis.primaryICD10,
    diagnosisPrimary: form.diagnosis.primaryDescription,
    icd10Secondary: form.diagnosis.secondaryICD10,
    diagnosisSecondary: form.diagnosis.secondaryDescription,

    // Section 5 — Clinical
    clinicalSymptoms: form.clinicalInfo.symptoms,
    labResults: form.clinicalInfo.labResults,
    drugIndication: form.clinicalInfo.indication,
    formularyContraindication: form.clinicalInfo.alternativesContraindicated,

    // Section 6 — Step therapy (array — template loops with {% for trial in stepTherapy %})
    stepTherapy: form.stepTherapy.map((t) => ({
      drugName: t.drugName,
      dose: t.dose,
      startDate: t.startDate,
      endDate: t.endDate,
      duration: t.duration,
      comments: t.outcome,
    })),
  };

  const html = env.render("template.njk", context);

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
