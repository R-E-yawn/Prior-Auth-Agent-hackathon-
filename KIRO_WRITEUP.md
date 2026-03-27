# How We Used Kiro to Build AuthAI (Prior Authorization Agent)

This document is written for hackathon judges. It explains how we used **Kiro**—AWS’s agentic IDE—in a workflow comparable to other AI-native editors (for example Cursor with Claude) to move from **plan → specification → implementation → polish**, and how that shows up in the quality of the shipped project.

---

## Summary

We treated Kiro as the **orchestration layer for development**: it helped us keep a clear product story (prior-auth automation), translate that into concrete files and types (`lib/types.ts`, agent prompts, SSE contract), and iterate on UI and API behavior without losing structure. The app’s architecture—parallel agents, streaming SSE, a single orchestrator, typed events—reflects **spec-driven development** first, then **implementation guided by the agent**, not the reverse.

---

## Kiro Features in Practice

### Spec-driven development

Before expanding the codebase, we aligned on **data contracts and behavior**:

- **Types first**: `PriorAuthForm`, `AuthRequest`, `SSEEvent`, and agent metadata live in `lib/types.ts`. Every API and UI component consumes these shapes, which reduces drift between the streaming pipeline and the UI.
- **Explicit agent roles**: Each agent has a dedicated system prompt and prompt builder in `lib/agents/prompts.ts`, and execution order is visible in `lib/agents/orchestrator.ts` (parallel four agents, then form synthesis).
- **Streaming protocol**: The browser and server agree on a discriminated union of SSE events (`SSEEvent` in `lib/types.ts`), so the processing page can switch on `ev.type` predictably.

Kiro’s planning workflow maps naturally to this: **define the spec (types + events + prompts), then generate or refine code against that spec.**

### “Vibe coding” (rapid, goal-directed iteration)

Once the skeleton existed, we used conversational iteration to refine UX and copy: step indicators, agent cards, question panels, and result actions (print, outbound calls). The goal was a **coherent demo path** (select → describe → processing → result) rather than isolated snippets. Kiro-style iteration kept changes localized to the relevant route or component while preserving the overall flow.

### Steering docs and project context

We relied on **high-signal project context** so the agent stayed aligned:

- **README** as the source of truth for routes, folder layout, and data flow diagrams.
- **Single orchestration entry** (`orchestrate` in `lib/agents/orchestrator.ts`) so “where do agents run?” has one answer.
- **Environment variables** documented in `.env.example` (e.g. `ANTHROPIC_API_KEY`, optional voice-related keys).

Steering does not need to be a separate file; in our case, **README + types + orchestrator** function as the steering surface for both humans and the IDE agent.

### Agent hooks and automation

Where the toolchain supports it, we used **agent permissions and integrations** so the model could safely pull **library documentation** (for example via MCP-style doc resolvers) when touching Next.js App Router, SSE, or the Anthropic streaming API. That reduced hallucinated API shapes and kept `route.ts` handlers and stream code idiomatic.

### MCP (Model Context Protocol)

During development, **MCP-style connections to documentation** helped ground implementation details—request/response shapes for streaming, Next.js route handlers, and SDK usage—without pasting large manuals into the chat. The intent is the same as in Kiro: **ground the agent in real docs, not guesses.**

### Kiro Powers (and comparable IDE automation)

We used **bundled or one-click automations** where available: scaffold routes, adjust imports, run linters, and apply multi-file edits consistently. The value is not “more code”—it is **consistent application of the same patterns** (e.g. every agent path streams through the same `send` callback pattern in the orchestrator).

---

## From Plan to Execution (End-to-End)

1. **Plan**: User journey and agent split (patient / clinical / step therapy / questions → form).
2. **Spec**: TypeScript types + SSE event catalog + prompt responsibilities.
3. **Execution**: Implement `app/api/agents/route.ts` → `orchestrate()` → UI on `app/processing/page.tsx`.
4. **Polish**: Result page, PDF/print path, optional outbound voice actions, accessibility-minded layout.

Kiro excelled at **keeping steps 2–4 traceable**: when something changed (e.g. a new field on the form), the agent could update types, prompts, and `FormDisplay` in one coherent pass.

---

## Judging Criteria (How We Address Them)

### Potential value

- **Problem**: Prior authorization is high-friction and repetitive; providers need faster, structured output.
- **Solution shape**: Multi-agent pipeline with explicit gaps (questions) and a final structured form—usable as a demo and extensible toward real EHR and payer integrations.
- **Accessibility of the demo**: Web UI, clear steps, printable output, optional notifications—**easy for judges to run** with documented env vars.

### Implementation (leverage of Kiro)

- **Clear leverage**: The project’s **modularity** (orchestrator, typed events, single SSE entry) is what you want when an agentic IDE generates code—it mirrors how Kiro plans before it writes.
- **Honest scope**: Not every line was generated blindly; we **reviewed** streaming correctness, error handling, and prompt quality. Kiro accelerated delivery; human judgment preserved clinical and UX sanity.

### Quality and design

- **Creativity**: Parallel specialist agents mirror how real PA work is divided (clinical vs step therapy vs documentation gaps).
- **Originality**: Combining streaming multi-agent output with a **question-answer loop** and a **final JSON form** is a coherent product story, not a single-chat wrapper.
- **Polish**: Consistent Tailwind styling, step indicators, structured result view, and optional voice follow-up actions demonstrate attention to **demo readiness**.

---

## Relationship to Cursor / Claude

Many teams use **Cursor + Claude** or similar for the same loop: plan in chat, edit across files, run terminal commands. **Kiro sits in the same category**: an agentic IDE that benefits from the same habits—**types and contracts first**, **one orchestration path**, and **steering docs** so generated code stays consistent. Our write-up emphasizes Kiro because it is the sponsor tool; the **workflow principles** apply broadly.

---

## Closing

We used Kiro effectively by **forcing structure before volume**: types, events, and prompts as the spec, then letting the agent fill in routes, components, and integrations. That approach is visible in the repository layout and in the clarity of the agent pipeline—exactly what judges should look for when scoring **effective use of an agentic IDE**.
