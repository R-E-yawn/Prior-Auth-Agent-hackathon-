import { NextResponse } from "next/server";
import type { PriorAuthForm } from "@/lib/types";
import { buildBlandPayload } from "@/lib/bland";

export async function POST(request: Request) {
  const body = await request.json();
  const { type, form }: { type: "patient" | "insurance"; form: PriorAuthForm } = body;

  if (type !== "patient" && type !== "insurance") {
    return NextResponse.json({ error: "Invalid type. Must be 'patient' or 'insurance'." }, { status: 400 });
  }

  const apiKey = process.env.BLAND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "BLAND_API_KEY is not configured." }, { status: 500 });
  }

  const payload = buildBlandPayload(type, form);

  const res = await fetch("https://api.bland.ai/v1/calls", {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log("[bland] response:", JSON.stringify(data, null, 2));

  if (!res.ok) {
    return NextResponse.json(
      { error: data?.message ?? "Bland AI call failed." },
      { status: res.status }
    );
  }

  return NextResponse.json({ call_id: data.call_id, status: data.status });
}
