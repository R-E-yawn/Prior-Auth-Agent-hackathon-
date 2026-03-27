import type { PriorAuthForm } from "./types";

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11) return `+${digits}`;
  return raw; // pass through if unexpected length
}

interface BlandPayload {
  phone_number: string;
  task: string;
  first_sentence: string;
  voice: string;
  wait_for_greeting: boolean;
}

export function buildBlandPayload(
  type: "patient" | "insurance",
  form: PriorAuthForm
): BlandPayload {
  const { patientInfo, prescriberInfo, requestedMedication, diagnosis, stepTherapy, urgency } = form;

  if (type === "patient") {
    return {
      phone_number: formatPhone(patientInfo.phone),
      task: `You are a medical office assistant calling on behalf of Dr. ${prescriberInfo.name} at ${prescriberInfo.practiceName}. You are calling ${patientInfo.name} to notify them that their prior authorization for ${requestedMedication.brandName} (${requestedMedication.genericName}) has been submitted to their insurance provider. Urgency level is ${urgency.type}. Let them know they will be contacted once a decision is made. If they have questions, direct them to call the office at ${prescriberInfo.phone}.`,
      first_sentence: `Hi, may I please speak with ${patientInfo.name}? This is a call from ${prescriberInfo.practiceName} regarding your medication prior authorization.`,
      voice: "maya",
      wait_for_greeting: true,
    };
  }

  // type === "insurance"
  return {
    phone_number: formatPhone(prescriberInfo.phone),
    task: `You are calling on behalf of Dr. ${prescriberInfo.name} (NPI: ${prescriberInfo.npi}) from ${prescriberInfo.practiceName} to follow up on a prior authorization request. Patient: ${patientInfo.name}, Member ID: ${patientInfo.memberId}, DOB: ${patientInfo.dob}. Requested medication: ${requestedMedication.brandName} ${requestedMedication.strength} ${requestedMedication.route} ${requestedMedication.frequency}. Primary diagnosis: ${diagnosis.primaryICD10} - ${diagnosis.primaryDescription}. The patient has ${stepTherapy.length} prior treatment trial(s) documented. Urgency: ${urgency.type}. Please confirm receipt of the prior authorization request, ask for the expected turnaround time, and inquire about any missing documentation that might be needed.`,
    first_sentence: `Hello, I'm calling from ${prescriberInfo.practiceName} on behalf of Dr. ${prescriberInfo.name} to follow up on a prior authorization request for patient ${patientInfo.name}.`,
    voice: "maya",
    wait_for_greeting: true,
  };
}
