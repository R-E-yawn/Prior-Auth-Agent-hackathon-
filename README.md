# AuthAI — Prior Authorization Agent

> An AI-powered Next.js application that automates medication prior authorization forms using a multi-agent pipeline. Built for the RSAC Hackathon.

---

## What It Does

Prior authorization (PA) is a requirement from insurance payers that a provider must get approval before prescribing certain medications. The process is manual, repetitive, and time-consuming — providers spend hours per week filling out the same structured forms.

**AuthAI automates this.** A provider describes the request in plain language, selects a patient, and four specialized AI agents run in parallel to research the patient, document step therapy, build clinical justification, and identify information gaps. A final agent compiles everything into a completed PA form.

---

## Demo Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  Step 1          Step 2          Step 3            Step 4           │
│  Select          Describe        AI Agents          Review          │
│                                                                     │
│  Pick patient  → Free-text    → 4 agents run  → Completed PA form  │
│  Pick form       describe        in parallel     ready to submit    │
│  type            the request     + questions                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| AI | Anthropic `claude-opus-4-6` via `@anthropic-ai/sdk` |
| Streaming | Server-Sent Events (SSE) |
| State | `sessionStorage` + URL params |
| "Database" | Flat `.txt` files in `mock-data/` |

---

## Hackathon sponsors — how we used each

We list **every sponsor** we engaged for the build, including pieces that did not land in the final demo or failed during integration, so judges can see intent and scope.

| Sponsor | Role (one line) | How we used it in this project |
|---|---|---|
| **AWS** | Models and cloud infrastructure to ship | The app is a Node.js **Next.js** service designed to run on typical AWS paths (e.g. **Amplify**, **ECS/Fargate**, or **Lambda** via adapters). **Inference** is implemented with the **Anthropic API** (`@anthropic-ai/sdk`) in code—we did **not** wire **Amazon Bedrock** in this repo, but the same agent pipeline could call Bedrock-hosted models in production. |
| **Kiro** | AWS’s agentic IDE — plan before code | Primary **development workflow**: spec-first design (`lib/types.ts`, SSE contract, orchestrator), multi-file edits, and iteration from **plan → execution**. See **`docs/KIRO_WRITEUP.md`** (and **`docs/KIRO_WRITEUP.docx`**) for judges. |
| **Auth0** | Identity and auth from day one | **Planned** for protecting `/request`, `/processing`, and `/result` and mapping users to tenants. **Not integrated** in the hackathon demo (no login screens or Auth0 SDK in this repo)—would be the first hardening step for a real deployment. |
| **Bland AI** | Voice AI for calls | **Integrated**: `POST /api/bland/call` builds a payload in `lib/bland.ts` and calls Bland’s outbound API; the **Result** page exposes **Call Patient** and **Call Insurance** (requires `BLAND_API_KEY`). If the key is missing or the API errors, buttons surface the failure—useful for demo honesty. |
| **Airbyte** | Data pipelines for AI agents | **Evaluated** for syncing EHR / payer feeds into a store the agents read. **Not implemented** here—we use **flat `mock-data/` files** to keep the demo self-contained and avoid standing up connectors during the hackathon. |
| **Aerospike** | Real-time database for AI | **Evaluated** for low-latency session and PA state (e.g. idempotent runs, audit). **Not integrated**; runtime state is **in-memory + `sessionStorage`** and patient source data is **mock files**. |
| **TrueFoundry** | Ship and observe agents in production | **Not integrated**. A natural fit for **deploying** this Next.js app and **observing** agent traces/latency once APIs are stable. |
| **Overmind** | Continuous agent optimization | **Not integrated**. Would apply where we log agent inputs/outputs and iterate prompts or routing in CI—out of scope for the demo build. |
| **Macroscope** | Understanding engine for your codebase | **Not integrated**. Would accelerate onboarding and **prompt/context** quality by grounding agents in repo structure; we relied on README + types + orchestrator as manual “context” instead. |

**Also in the codebase (not on the sponsor list above):** **Deepgram** powers optional **voice transcription** on the landing page (`hooks/useDeepgramScribe.ts`, `GET /api/deepgram-key`) so providers can dictate the clinical narrative before `/request`.

---

## Installation

### Prerequisites

- **Node.js** v18 or later — [download](https://nodejs.org)
- **npm** v9 or later (comes with Node)
- An **Anthropic API key** — [get one here](https://console.anthropic.com)

### 1. Clone the repository

```bash
git clone https://github.com/R-E-yawn/Prior-Auth-Agent-hackathon-.git
cd Prior-Auth-Agent-hackathon-
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up your API key

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Then open `.env.local` and fill in your key:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

> ⚠️ Never commit `.env.local` — it is in `.gitignore`.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
Prior-Auth-Agent-hackathon-/
│
├── mock-data/                          ← "Secure" patient database (flat .txt files)
│   ├── patient_P001_alice-johnson/     ← Patient folders named by ID + name
│   │   ├── patient_info.txt
│   │   ├── clinical_info.txt
│   │   ├── step_therapy.txt
│   │   ├── medication.txt
│   │   ├── diagnosis.txt
│   │   ├── prescriber_info.txt
│   │   └── urgency.txt
│   ├── patient_P002_robert-chen/
│   └── patient_P003_maria-santos/
│
├── app/                                ← Next.js App Router (folder = route)
│   ├── layout.tsx                      ← Root layout: sticky header + global CSS
│   ├── globals.css                     ← Tailwind base styles + custom utilities
│   │
│   ├── page.tsx                        ← Route: /           (Step 1 — Select)
│   ├── request/
│   │   └── page.tsx                    ← Route: /request    (Step 2 — Describe)
│   ├── processing/
│   │   └── page.tsx                    ← Route: /processing (Step 3 — Agents)
│   ├── result/
│   │   └── page.tsx                    ← Route: /result     (Step 4 — Review)
│   │
│   └── api/                            ← API routes (server-side only)
│       ├── patients/
│       │   └── route.ts                ← GET /api/patients[?id=P001]
│       └── agents/
│           └── route.ts                ← POST /api/agents  → SSE stream
│
├── lib/                                ← Pure business logic (no React)
│   ├── types.ts                        ← All TypeScript interfaces + constants
│   ├── patients.ts                     ← Reads mock-data/ .txt files
│   └── agents/
│       ├── prompts.ts                  ← System prompts + prompt builder functions
│       └── orchestrator.ts             ← Runs agents, wires Anthropic to SSE
│
├── components/                         ← Reusable React components
│   ├── AgentCard.tsx                   ← Animated status card for each agent
│   ├── QuestionPanel.tsx               ← Sidebar showing questions + answer inputs
│   └── FormDisplay.tsx                 ← Renders completed PA form by section
│
├── .env.example                        ← Template — copy to .env.local
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Page-by-Page Breakdown

### Step 1 — `/` &nbsp; Select
**File:** `app/page.tsx`

The provider landing page. On load it calls `GET /api/patients`, which reads every folder inside `mock-data/` and returns a list of patient summaries (name, DOB, diagnosis, requested drug). The provider clicks a patient card and picks a form type from the right panel.

**Passes forward:** `patientId` and `formType` as URL query params → `/request?patientId=P001&formType=medication`

---

### Step 2 — `/request` &nbsp; Describe
**File:** `app/request/page.tsx`

A single large free-text area. The provider narrates the request in plain language — e.g. *"This PA is for Humira for Alice's Crohn's disease. She has failed mesalamine and azathioprine."* An urgency toggle lets them mark the request Routine or Expedited.

**Passes forward:** Serializes the full `AuthRequest` object into `sessionStorage` then navigates to `/processing`.

---

### Step 3 — `/processing` &nbsp; AI Agents
**File:** `app/processing/page.tsx`

The core page. On mount it reads `sessionStorage` then opens a streaming `POST /api/agents`. Four agent cards animate in real time as each agent streams its output. A question panel on the right populates as the Question Agent finds gaps. Once all four parallel agents finish, the provider can optionally fill in answers and click **Generate Form** — this runs the Form Filling Agent which produces the final JSON.

**Passes forward:** Writes the completed `PriorAuthForm` JSON to `sessionStorage`, redirects to `/result`.

---

### Step 4 — `/result` &nbsp; Review
**File:** `app/result/page.tsx`

Reads the completed form from `sessionStorage` and renders it section by section via `FormDisplay`. Every field is populated. Includes print/PDF and "New Authorization" buttons.

---

## Agent Architecture

```
                        POST /api/agents
                               │
                               ▼
                     ┌─────────────────┐
                     │  orchestrator   │  loadPatient() → reads 7 .txt files
                     │  (server-side)  │  builds one patientContext string
                     └────────┬────────┘
                              │
                ┌─────────────┴──────────────┐
                │    Promise.all — PARALLEL   │
                │                            │
      ┌─────────▼───────┐       ┌────────────▼────────┐
      │  Question Agent │       │   Patient Agent     │
      │                 │       │                     │
      │  Reads context, │       │  Verifies & formats │
      │  finds 2–4 gaps,│       │  demographics,      │
      │  outputs JSON   │       │  prescriber info,   │
      │  question array │       │  insurance details  │
      └─────────┬───────┘       └────────────┬────────┘
                │                            │
      ┌─────────▼───────┐       ┌────────────▼────────┐
      │  Step Therapy   │       │   Clinical Agent    │
      │  Agent          │       │                     │
      │                 │       │  Builds evidence-   │
      │  Narrates each  │       │  based justification│
      │  prior drug     │       │  citing labs,       │
      │  trial, dose,   │       │  scores, guidelines │
      │  dates, outcome │       │  (ACG, ADA, AAD...) │
      └─────────┬───────┘       └────────────┬────────┘
                │                            │
                └──────────────┬─────────────┘
                               │  all 4 agents complete
                               ▼
                     ┌─────────────────┐
                     │  Form Filling   │
                     │  Agent          │
                     │                 │
                     │  Synthesizes    │
                     │  all 4 outputs  │
                     │  + question     │
                     │  answers        │
                     │  → PriorAuth    │
                     │    Form JSON    │
                     └─────────────────┘
```

Each agent is a streaming call to `claude-opus-4-6`. Tokens are forwarded to the browser as SSE events the moment they are generated.

---

## Data Flow

```
Browser                        Next.js Server                 Anthropic API
   │                                  │                              │
   │── GET /api/patients ────────────►│                              │
   │                                  │  scans mock-data/ folders    │
   │◄── [PatientSummary[]] ──────────-│                              │
   │                                  │                              │
   │  provider selects patient        │                              │
   │  provider types request text     │                              │
   │  sessionStorage ← AuthRequest    │                              │
   │                                  │                              │
   │── POST /api/agents ─────────────►│                              │
   │   { patientId, requestText,      │  loadPatient("P001")         │
   │     isUrgent, questionAnswers }  │  reads 7 .txt files          │
   │                                  │  builds patientContext       │
   │                                  │                              │
   │                                  │  Promise.all([               │
   │                                  │    questionAgent()  ────────►│
   │◄─ data: agent_start ────────────-│    patientAgent()   ────────►│ streaming
   │◄─ data: agent_chunk (tokens) ───-│    stepTherapyAgent()───────►│ from 4
   │◄─ data: agent_chunk (tokens) ───-│    clinicalAgent()  ────────►│ parallel
   │◄─ data: questions_parsed ───────-│  ])                          │ calls
   │◄─ data: all_parallel_done ──────-│                              │
   │                                  │                              │
   │  provider optionally answers     │                              │
   │  questions, clicks Generate Form │                              │
   │                                  │                              │
   │                                  │  formAgent() ──────────────►│
   │◄─ data: form_start ─────────────-│                              │ streaming
   │◄─ data: form_chunk (JSON) ──────-│◄──────── token stream ──────-│ JSON
   │◄─ data: form_done { form:{} } ──-│                              │
   │                                  │                              │
   │  sessionStorage ← completedForm  │                              │
   │  router.push("/result")          │                              │
```

---

## SSE Event Reference

All events sent over the stream conform to the `SSEEvent` discriminated union in `lib/types.ts`. The browser switches on `ev.type` to update state.

| `type` | Extra fields | Fired when |
|---|---|---|
| `agent_start` | `agentId`, `label` | An agent begins its API call |
| `agent_chunk` | `agentId`, `text` | Each streamed token from an agent |
| `agent_done` | `agentId` | An agent finishes |
| `questions_parsed` | `questions: string[]` | Question agent output parsed to an array |
| `all_parallel_done` | — | All 4 parallel agents have finished |
| `form_start` | — | Form filling agent begins |
| `form_chunk` | `text` | Each streamed token of the form JSON |
| `form_done` | `form: PriorAuthForm` | Fully parsed form object is ready |
| `error` | `message` | Something went wrong at any stage |

---

## Mock Patient Database

Three patients are included, each representing a different specialty PA scenario:

| ID | Patient | Condition | Requested Drug |
|---|---|---|---|
| P001 | Alice M. Johnson | Crohn's disease (moderate–severe) | Humira (Adalimumab) |
| P002 | Robert K. Chen | Type 2 Diabetes + obesity | Ozempic (Semaglutide) |
| P003 | Maria C. Santos | Atopic dermatitis (moderate–severe) | Dupixent (Dupilumab) |

Each patient folder contains **7 structured plain-text files**:

```
patient_info.txt       ← demographics + insurance IDs
prescriber_info.txt    ← provider NPI, practice, contact person
diagnosis.txt          ← ICD-10 codes + comorbidities
medication.txt         ← requested drug, dose, route, quantity
clinical_info.txt      ← symptoms, lab results, indication rationale
step_therapy.txt       ← prior drug trials, dates, doses, outcomes
urgency.txt            ← routine vs expedited + justification
```

**To add a new patient**, create a folder using this naming pattern and populate the same 7 files — no code changes needed:

```
mock-data/patient_PXXX_firstname-lastname/
```

---

## Key Files Quick Reference

| File | What it does |
|---|---|
| `lib/types.ts` | Every TypeScript interface in the app. Start here to understand data shapes. Also exports `AGENTS` (the agent metadata array) and `FORM_TYPES`. |
| `lib/patients.ts` | `loadPatient(id)` reads and parses a single patient. `listPatients()` autodiscovers all folders. `buildPatientContext()` concatenates all 7 files into one string for the LLM. |
| `lib/agents/prompts.ts` | System prompts for all 5 agents plus builder functions that inject patient context and request details into each user message. |
| `lib/agents/orchestrator.ts` | `orchestrate()` runs `Promise.all` on the 4 parallel agents then the form agent. Each uses `client.messages.stream()` and forwards chunks through the `send()` callback. |
| `app/api/agents/route.ts` | Thin HTTP handler. Creates a `ReadableStream`, wires `send()` to `controller.enqueue()`, calls `orchestrate()`, returns `text/event-stream`. |
| `app/processing/page.tsx` | Reads the SSE stream, dispatches events via `switch(ev.type)` to React state. Manages the `AgentsMap` for all four cards plus the form agent. |
| `components/FormDisplay.tsx` | Pure presentational. Receives a `PriorAuthForm` and renders each section as a colored card with labelled fields. |

---

## Extending the App

**Add a new parallel agent**
1. Write its system prompt + prompt builder in `lib/agents/prompts.ts`
2. Add a `runAgent(...)` call inside `Promise.all` in `lib/agents/orchestrator.ts`
3. Add it to the `AGENTS` array in `lib/types.ts` — an `AgentCard` renders automatically

**Add a new field to the PA form**
1. Add the property to the relevant interface in `lib/types.ts`
2. Add it to the JSON schema inside `FORM_AGENT_SYSTEM` in `lib/agents/prompts.ts`
3. Add a `<Field>` or `<TextBlock>` call inside the right `<Section>` in `components/FormDisplay.tsx`

**Add a new patient**
1. Create `mock-data/patient_PXXX_name/` with the 7 `.txt` files
2. No code changes — `listPatients()` autodiscovers all folders on every request

---

## Available Scripts

```bash
npm run dev      # Development server at http://localhost:3000 (hot reload)
npm run build    # Production build — runs TypeScript check + bundles
npm run start    # Serve the production build
npm run lint     # ESLint
```
