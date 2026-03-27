import { NextResponse } from "next/server";
import nunjucks from "nunjucks";
import path from "path";
import type { PriorAuthForm } from "@/lib/types";

const templateDir = path.join(process.cwd(), "pdf-prior-auth");
nunjucks.configure(templateDir, { autoescape: true });

export async function POST(request: Request) {
  const form: PriorAuthForm = await request.json();

  const context = {
    dateOfRequest: new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
    authNumber: `PA-${Date.now().toString(36).toUpperCase()}`,
    payerName: "[Health Plan Name]",
    planPhone: "[Plan Phone / Fax]",

    isRoutine: form.urgency.type === "Routine",
    isExpedited: form.urgency.type === "Expedited",
    expeditedJustification: form.urgency.justification,

    patientName: form.patientInfo.name,
    patientDOB: form.patientInfo.dob,
    memberID: form.patientInfo.memberId,
    groupNumber: form.patientInfo.groupNumber,
    patientAddress: form.patientInfo.address,
    patientPhone: form.patientInfo.phone,

    providerName: form.prescriberInfo.name,
    providerNPI: form.prescriberInfo.npi,
    providerDEA: form.prescriberInfo.deaNumber,
    practiceName: form.prescriberInfo.practiceName,
    practiceAddress: form.prescriberInfo.address,
    practicePhone: form.prescriberInfo.phone,
    practiceFax: form.prescriberInfo.fax,
    contactPerson: form.prescriberInfo.contactPerson,

    drugBrand: form.requestedMedication.brandName,
    drugGeneric: form.requestedMedication.genericName,
    drugStrength: form.requestedMedication.strength,
    drugRoute: form.requestedMedication.route,
    drugFrequency: form.requestedMedication.frequency,
    quantityRequested: form.requestedMedication.quantity,
    daysSupply: form.requestedMedication.daysSupply,
    therapyDuration: form.requestedMedication.expectedDuration,

    icd10Primary: form.diagnosis.primaryICD10,
    diagnosisPrimary: form.diagnosis.primaryDescription,
    icd10Secondary: form.diagnosis.secondaryICD10,
    diagnosisSecondary: form.diagnosis.secondaryDescription,

    clinicalSymptoms: form.clinicalInfo.symptoms,
    labResults: form.clinicalInfo.labResults,
    drugIndication: form.clinicalInfo.indication,
    formularyContraindication: form.clinicalInfo.alternativesContraindicated,

    stepTherapy: form.stepTherapy.map((t) => ({
      drugName: t.drugName,
      dose: t.dose,
      startDate: t.startDate,
      endDate: t.endDate,
      duration: t.duration,
      comments: t.outcome,
    })),
  };

  const html = nunjucks.render("template.njk", context);

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
