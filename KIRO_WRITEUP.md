# How We Used Kiro to Build AuthAI — Full Project Story

This document is written for hackathon judges. It explains **how we built the entire AuthAI (Prior Authorization Agent) project** using **Kiro**—AWS’s agentic IDE—in the same spirit as Cursor + Claude: **plan → specification → multi-file implementation → polish**, with Kiro features (spec-driven development, steering context, MCP-style doc grounding, agent automation) applied end to end.

Companion files: **`KIRO_WRITEUP.md`** (this file) and **`KIRO_WRITEUP.docx`** (export for submission).

---

## What we set out to build

**Problem:** Medication prior authorization (PA) is manual: providers repeat structured narratives for payers.

**Product:** A **Next.js** web app where a clinician selects a patient, describes the case (text—and optionally voice), then **four AI specialists** run **in parallel** (questions, patient summary, step therapy, clinical justification). A **form-filling agent** merges outputs (plus any user answers to gaps) into a **typed JSON prior-auth form**. The user reviews, prints/PDFs, and can trigger optional **outbound voice calls**.

That single sentence was the anchor; everything below was implemented as **layers** so Kiro could plan and edit without collapsing the architecture.

---

## How we built it — chronological build phases

### Phase 1 — Foundation (App Router, styling, types)

- **Scaffold:** Next.js 15 **App Router**, TypeScript, Tailwind, ESLint (`package.json`, `next.config.ts`, `tailwind.config.ts`).
- **Global shell:** `app/layout.tsx` and `app/globals.css` for the header and shared utility classes (`btn-primary`, cards, etc.).
- **Contracts first:** `lib/types.ts` defines `PatientSummary`, `PatientRecord`, `AuthRequest`, `PriorAuthForm`, agent IDs, `SSEEvent`, and related unions. **Kiro’s spec-driven flow started here**: we treated types as the API between UI, API routes, and prompts—when the agent proposed new fields, it had to update types, prompts, and `FormDisplay` together.

### Phase 2 — Mock “EHR” and patient API

- **Data:** Each patient is a folder under `mock-data/` with seven `.txt` files (`patient_info`, `clinical_info`, etc.)—no real DB for the hackathon.
- **Server utilities:** `lib/patients.ts` implements `listPatients()`, `loadPatient(id)`, and `buildPatientContext()` (one concatenated string for the LLM).
- **Route:** `app/api/patients/route.ts` exposes `GET` for the landing page grid.

We used Kiro to keep **filesystem reads** and **summary parsing** in one module so the rest of the app never imports `fs` directly.

### Phase 3 — Multi-agent core (orchestrator + SSE)

- **Prompts:** `lib/agents/prompts.ts` — system prompts and builders for Question, Patient, Step Therapy, Clinical, and Form agents; includes the JSON shape expectations for the final form.
- **Orchestration:** `lib/agents/orchestrator.ts` — creates an **Anthropic** client, runs **four `stream` calls inside `Promise.all`**, parses question output, then runs the **form agent** with optional `questionAnswers`. Helper `orchestrateFormOnly` supports `POST /api/form` for form-only replays.
- **Streaming HTTP:** `app/api/agents/route.ts` wraps `orchestrate()` in a `ReadableStream` and emits **Server-Sent Events** (`text/event-stream`).

This was the **densest** part of the project. Kiro helped by:

1. Aligning **event names and payloads** with `SSEEvent` in `lib/types.ts`.
2. Reusing a single **`send(event)`** pattern for every stage (parallel agents + form).
3. Pulling **Anthropic streaming** patterns from docs (MCP / tool-grounded lookups) so `messages.stream()` usage stayed correct.

### Phase 4 — Four-step UX (pages)

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/page.tsx` | Lists patients from `GET /api/patients`, form type, optional Deepgram-backed dictation (`useDeepgramScribe`, `ScribeCard`). Persists `scribeTranscript` when navigating forward. |
| `/request` | `app/request/page.tsx` | Free-text clinical narrative + urgency; serializes `AuthRequest` to `sessionStorage`. |
| `/processing` | `app/processing/page.tsx` | `POST /api/agents` (or form regeneration via `/api/form`), consumes SSE, drives `AgentCard`, `QuestionPanel`, and merge into final form in `sessionStorage`. |
| `/result` | `app/result/page.tsx` | Reads completed form, `FormDisplay`, print path, “new auth”, Bland call buttons. |

**Kiro “vibe coding”** showed up most here: iterative layout, step indicators, loading states, and copy—always constrained by **existing types** and routes so we did not fork the demo flow.

### Phase 5 — Components

- **`components/AgentCard.tsx`** — per-agent streaming status and content.
- **`components/QuestionPanel.tsx`** — gaps from the Question agent + inputs that feed the form agent.
- **`components/FormDisplay.tsx`** — renders `PriorAuthForm` section by section.
- **`components/ScribeCard.tsx`** — microphone UX wired to Deepgram.

These were built **after** the SSE contract was stable so props and state matched `lib/types.ts`.

### Phase 6 — Voice and outbound calls (integrators)

- **Deepgram (dictation):** `app/api/deepgram-key/route.ts` returns a key to the client; `hooks/useDeepgramScribe.ts` opens the listen WebSocket for live transcript on step 1.
- **Bland AI (outbound calls):** `lib/bland.ts` builds compliant payloads; `app/api/bland/call/route.ts` POSTs to Bland’s API; `app/result/page.tsx` triggers patient vs insurance scripts.

Kiro accelerated **boilerplate** (fetch, error JSON, TypeScript interfaces) while we manually verified **phone formatting** and **clinical wording** safety in `buildBlandPayload`.

### Phase 7 — Print / PDF HTML

- **`pdf-prior-auth/template.njk`** — Nunjucks template for a printable PA layout.
- **`app/api/pdf-html/route.ts`** — Renders HTML from `PriorAuthForm`; the result page opens a window and calls `print()`.

### Phase 8 — Documentation and env wiring

- **`README.md`** — product narrative, install, architecture diagrams, SSE table, sponsor usage.
- **`.env.example`** — `ANTHROPIC_API_KEY`, `BLAND_API_KEY`, `DEEPGRAM_API_KEY`.

The README became **steering context** for Kiro: when regenerating code, we pointed the agent at “match README architecture.”

---

## Repository map (what lives where)

```
app/
  page.tsx, request/page.tsx, processing/page.tsx, result/page.tsx   ← wizard flow
  api/patients/route.ts          ← list/load discovery
  api/agents/route.ts            ← full SSE pipeline
  api/form/route.ts              ← form-only SSE (reuse orchestrator)
  api/deepgram-key/route.ts      ← optional scribe
  api/bland/call/route.ts        ← optional outbound calls
  api/pdf-html/route.ts          ← printable HTML
lib/
  types.ts                       ← all contracts
  patients.ts                    ← mock-data I/O
  bland.ts                       ← Bland payload builder
  agents/prompts.ts, orchestrator.ts
components/                      ← UI building blocks
hooks/useDeepgramScribe.ts
mock-data/                       ← per-patient .txt bundles
pdf-prior-auth/template.njk
```

This layout is intentional: **one orchestration brain** (`lib/agents/orchestrator.ts`), **thin route handlers**, **dumb-presentational** components where possible—ideal for an agentic IDE that edits multiple files in one task.

---

## Kiro features — tied to how we actually built the repo

### Spec-driven development

We did **not** start from a blank `page.tsx`. We started from **`lib/types.ts` and the SSE discriminated union**, then prompts, then orchestrator, then API route, then UI. That order matches Kiro’s strength: **plan and spec before codegen**.

### Vibe coding

Rapid iteration on the **processing** and **result** screens—animations, button groups, urgency badges—without breaking the **sessionStorage** contract or event parsing on `app/processing/page.tsx`.

### Steering docs

**README sections** (data flow diagram, SSE reference) plus **`lib/types.ts`** steered multi-file edits. The agent had a single place to check “what is an `agent_chunk`?”

### Agent hooks & MCP

We granted tooling where useful so the model could **resolve library IDs** and **query docs** (e.g. Next.js streaming responses, Anthropic streaming SDK). That reduced bad imports and wrong handler signatures—critical for `ReadableStream` + SSE.

### Kiro Powers / automation

Bulk refactors: adding a form field propagated through **types → prompt schema → `FormDisplay`** in one logical change set rather than three disconnected edits.

---

## From plan to execution (compact checklist)

1. **Plan:** Four parallel agents + form synthesizer + 4-step UI.
2. **Spec:** Types, SSE events, prompt responsibilities.
3. **Execution:** `orchestrator.ts` + `route.ts` + `processing/page.tsx`.
4. **Polish:** Result view, PDF template, Bland, Deepgram, README, sponsor notes.

---

## Judging criteria

### Potential value

- Addresses a **real operational pain** (PA) with a **clear demo path** and **optional voice** touchpoints.
- **Runnable locally** with documented keys; printable output suitable for stakeholder review.

### Implementation (leverage of Kiro)

- **Modular pipeline** (orchestrator + typed SSE) is exactly what scales under agent-generated code.
- **Human review** on clinical prompts, streaming edge cases, and API keys—not blind codegen.

### Quality and design

- **Specialist agents** mirror real work breakdown.
- **Streaming UX** shows technical depth beyond a single blocking HTTP call.
- **Consistent UI** (Tailwind, step flow, cards) reads as a finished demo, not a prototype stub.

---

## Relationship to Cursor / Claude

The same **workflow** applies: **contracts first, one orchestration path, docs-grounded SDK usage**. We document **Kiro** as the sponsor IDE; the repository structure is evidence of **effective agentic development** regardless of brand.

---

## Closing

We built **AuthAI** as a layered Next.js application: **mock patient I/O**, **parallel Claude agents**, **SSE to the browser**, **structured form output**, and **optional voice and print**. **Kiro** was used to plan that structure, generate consistent implementation across files, and iterate on UX while keeping **types and events** as the source of truth—**structure before volume**, end to end.
