// ─── Patient Records ────────────────────────────────────────────────────────

export interface PatientRecord {
  id: string;
  name: string;
  folderName: string;
  // Raw file contents keyed by filename
  files: {
    patient_info: string;
    clinical_info: string;
    step_therapy: string;
    medication: string;
    diagnosis: string;
    prescriber_info: string;
    urgency: string;
  };
}

export interface PatientSummary {
  id: string;
  name: string;
  dob: string;
  memberId: string;
  primaryDiagnosis: string;
  requestedMedication: string;
}

// ─── Prior Auth Form ─────────────────────────────────────────────────────────

export interface PatientInfo {
  name: string;
  dob: string;
  memberId: string;
  groupNumber: string;
  address: string;
  phone: string;
}

export interface PrescriberInfo {
  name: string;
  npi: string;
  deaNumber: string;
  practiceName: string;
  address: string;
  phone: string;
  fax: string;
  contactPerson: string;
}

export interface RequestedMedication {
  brandName: string;
  genericName: string;
  strength: string;
  route: string;
  frequency: string;
  quantity: string;
  daysSupply: string;
  expectedDuration: string;
}

export interface DiagnosisInfo {
  primaryICD10: string;
  primaryDescription: string;
  secondaryICD10: string;
  secondaryDescription: string;
  comorbidities: string[];
}

export interface ClinicalInfo {
  symptoms: string;
  labResults: string;
  indication: string;
  alternativesContraindicated: string;
}

export interface StepTherapyEntry {
  drugName: string;
  dose: string;
  startDate: string;
  endDate: string;
  duration: string;
  outcome: string;
}

export interface UrgencyInfo {
  type: "Routine" | "Expedited";
  justification: string;
}

export interface PriorAuthForm {
  patientInfo: PatientInfo;
  prescriberInfo: PrescriberInfo;
  requestedMedication: RequestedMedication;
  diagnosis: DiagnosisInfo;
  clinicalInfo: ClinicalInfo;
  stepTherapy: StepTherapyEntry[];
  urgency: UrgencyInfo;
}

// ─── Agent System ─────────────────────────────────────────────────────────────

export type AgentId =
  | "questions"
  | "patient"
  | "stepTherapy"
  | "clinical"
  | "form";

export interface AgentMeta {
  id: AgentId;
  label: string;
  description: string;
  color: string;
}

export const AGENTS: AgentMeta[] = [
  {
    id: "questions",
    label: "Question Agent",
    description: "Identifying clarifying questions",
    color: "violet",
  },
  {
    id: "patient",
    label: "Patient Research Agent",
    description: "Analyzing patient records",
    color: "blue",
  },
  {
    id: "stepTherapy",
    label: "Step Therapy Agent",
    description: "Documenting treatment history",
    color: "emerald",
  },
  {
    id: "clinical",
    label: "Clinical Information Agent",
    description: "Building clinical justification",
    color: "amber",
  },
];

// ─── SSE Event Types ──────────────────────────────────────────────────────────

export type SSEEvent =
  | { type: "agent_start"; agentId: AgentId; label: string }
  | { type: "agent_chunk"; agentId: AgentId; text: string }
  | { type: "agent_done"; agentId: AgentId }
  | { type: "questions_parsed"; questions: string[] }
  | { type: "all_parallel_done" }
  | { type: "form_start" }
  | { type: "form_chunk"; text: string }
  | { type: "form_done"; form: PriorAuthForm }
  | { type: "error"; message: string };

// ─── Request / Session ────────────────────────────────────────────────────────

export interface AuthRequest {
  patientId: string;
  formType: string;
  requestText: string;
  isUrgent: boolean;
  questionAnswers: { question: string; answer: string }[];
}

export const FORM_TYPES = [
  {
    id: "medication",
    label: "Medication Prior Authorization",
    description: "Specialty drugs, biologics, branded medications",
  },
  {
    id: "device",
    label: "Medical Device Authorization",
    description: "Durable medical equipment, prosthetics",
  },
];
