import { NextResponse } from "next/server";
import { listPatients, loadPatient } from "@/lib/patients";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    const patient = loadPatient(id);
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    return NextResponse.json(patient);
  }

  const patients = listPatients();
  return NextResponse.json(patients);
}
