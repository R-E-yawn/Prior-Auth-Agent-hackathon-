import path from "path";
import fs from "fs";
import type { PatientRecord, PatientSummary } from "./types";

const MOCK_DATA_DIR = path.join(process.cwd(), "mock-data");

function readFile(folderPath: string, filename: string): string {
  try {
    return fs.readFileSync(path.join(folderPath, `${filename}.txt`), "utf-8");
  } catch {
    return "";
  }
}

function extractField(text: string, label: string): string {
  const regex = new RegExp(`${label}:\\s*(.+)`);
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

export function loadPatient(id: string): PatientRecord | null {
  if (!fs.existsSync(MOCK_DATA_DIR)) return null;

  const folders = fs.readdirSync(MOCK_DATA_DIR);
  const folder = folders.find((f) => f.startsWith(`patient_${id}_`));
  if (!folder) return null;

  const folderPath = path.join(MOCK_DATA_DIR, folder);
  const patientInfo = readFile(folderPath, "patient_info");

  return {
    id,
    name: extractField(patientInfo, "Patient Name"),
    folderName: folder,
    files: {
      patient_info: patientInfo,
      clinical_info: readFile(folderPath, "clinical_info"),
      step_therapy: readFile(folderPath, "step_therapy"),
      medication: readFile(folderPath, "medication"),
      diagnosis: readFile(folderPath, "diagnosis"),
      prescriber_info: readFile(folderPath, "prescriber_info"),
      urgency: readFile(folderPath, "urgency"),
    },
  };
}

export function listPatients(): PatientSummary[] {
  if (!fs.existsSync(MOCK_DATA_DIR)) return [];

  const folders = fs
    .readdirSync(MOCK_DATA_DIR)
    .filter((f) => f.startsWith("patient_"));

  return folders.map((folder) => {
    const folderPath = path.join(MOCK_DATA_DIR, folder);
    const parts = folder.split("_");
    const id = parts[1];

    const patientInfo = readFile(folderPath, "patient_info");
    const diagnosisInfo = readFile(folderPath, "diagnosis");
    const medicationInfo = readFile(folderPath, "medication");

    return {
      id,
      name: extractField(patientInfo, "Patient Name"),
      dob: extractField(patientInfo, "Date of Birth"),
      memberId: extractField(patientInfo, "Member ID"),
      primaryDiagnosis: extractPrimaryDiagnosis(diagnosisInfo),
      requestedMedication: extractMedication(medicationInfo),
    };
  });
}

function extractPrimaryDiagnosis(diagnosisText: string): string {
  const lines = diagnosisText.split("\n");
  const primaryLine = lines.find((l) => l.includes("Primary ICD-10:"));
  if (!primaryLine) return "Unknown";
  const parts = primaryLine.split("—");
  return parts.length > 1 ? parts[1].trim() : primaryLine.split(":")[1]?.trim() ?? "Unknown";
}

function extractMedication(medText: string): string {
  const brand = extractField(medText, "Brand Name");
  const generic = extractField(medText, "Generic Name");
  if (brand && generic) return `${brand} (${generic})`;
  return brand || generic || "Unknown";
}

export function buildPatientContext(record: PatientRecord): string {
  return [
    "=== PATIENT INFORMATION ===",
    record.files.patient_info,
    "",
    "=== PRESCRIBER / PROVIDER ===",
    record.files.prescriber_info,
    "",
    "=== DIAGNOSIS ===",
    record.files.diagnosis,
    "",
    "=== REQUESTED MEDICATION ===",
    record.files.medication,
    "",
    "=== CLINICAL INFORMATION ===",
    record.files.clinical_info,
    "",
    "=== STEP THERAPY HISTORY ===",
    record.files.step_therapy,
    "",
    "=== URGENCY ===",
    record.files.urgency,
  ].join("\n");
}
