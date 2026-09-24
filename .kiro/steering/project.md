# ComplianceIQ — Kiro AI Copilot Steering Guide

## What This Project Is
**ComplianceIQ** is an enterprise-grade Governance, Risk & Compliance (GRC) intelligence platform for the **MENAT region** (Middle East, North Africa & Türkiye). It covers **24 sovereign jurisdictions** and maps national regulations to international frameworks (NIST CSF 2.0, ISO/IEC 27001:2022, CSA CCM v4.0.10).

---

## System Architecture

```
React 19 SPA (Vite + Tailwind CSS v4)
    ↕ HTTP / REST
Express.js Server (server.ts, port 3000)
    ↕ AWS SDK v3
AWS Bedrock (Claude 3.5 Sonnet)   +   Tavily Search API (web search)
```

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts, D3.js v7, Motion
- **Backend**: Express 4 on Node.js, executed via `tsx server.ts`
- **AI Engine**: AWS Bedrock — `anthropic.claude-3-5-sonnet-20241022-v2:0` via `@aws-sdk/client-bedrock-runtime`
- **Web Search**: Tavily Search API (replaces Google Search Grounding — set `TAVILY_API_KEY` in `.env`)
- **PDF Export**: jsPDF v4 + jsPDF-AutoTable v5
- **Dev command**: `npm run dev` → starts full-stack on `http://localhost:3000`
- **Build**: `npm run build` → Vite SPA + esbuild server bundle in `dist/`

---

## Key Source Files

| Path | Purpose |
|------|---------|
| `server.ts` | Full Express server — all API endpoints (15+) including AI endpoints |
| `src/App.tsx` | Root SPA component — tab routing, feature flags, state management |
| `src/types/regulatory.ts` | Core data types: `Regulation`, `Country`, `RegulatoryControl`, etc. |
| `src/types/admin.ts` | Admin types: `FeatureFlags`, `UserProfile`, `AuditLogEntry` |
| `src/types/heatmap.ts` | `AIChatMessage`, `HeatmapCellData`, `MaturitySectorId` |
| `src/data/menatData.ts` | Primary data — `MENAT_REGULATIONS[]`, `MENAT_COUNTRIES[]` |
| `src/context/AdminContext.tsx` | Global state — feature flags, users, audit logs, broadcast banners |
| `src/context/RBACContext.tsx` | Role-based access control context |
| `src/utils/controlInterpreterEngine.ts` | Deterministic control clause interpreter (no AI dependency) |
| `src/utils/redlineEngine.ts` | Deterministic policy gap analysis engine (no AI dependency) |
| `src/components/AIComplianceCopilot.tsx` | Floating AI chat drawer (calls `/api/ai/chat`) |
| `src/components/AIRedlining.tsx` | Policy redlining UI (calls `/api/ai/redline`) |
| `src/components/ControlInterpreter.tsx` | Control interpreter UI (calls `/api/control/interpret`) |
| `src/components/AdminPanel/` | Admin console tabs |

---

## AI Endpoints (server.ts)

All AI calls go through `invokeClaudeOnBedrock(systemPrompt, userPrompt, maxTokens)` which uses `@aws-sdk/client-bedrock-runtime`. Web search uses `tavilySearch(query, maxResults)`.

| Endpoint | Description |
|----------|-------------|
| `POST /api/ai/chat` | Multi-turn compliance copilot with Tavily web search |
| `POST /api/ai/maturity-analysis` | Country/sector regulatory maturity memo |
| `POST /api/ai/smart-insight` | 3-bullet sector impact analysis per regulation |
| `POST /api/ai/analyze-requirements` | Per-control Mandatory/Guideline/Conditional classification |
| `POST /api/control/interpret` | Control clause deep-dive (deterministic + Bedrock enhancement) |
| `POST /api/ai/redline` | Policy gap analysis (deterministic + Bedrock enhancement) |
| `GET/POST /api/news/grounded` | Live MENAT regulatory news via Tavily + Claude synthesis |

---

## Environment Variables (`.env`)

```env
PORT=3000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0
TAVILY_API_KEY=tvly-...
```

If running on EC2/ECS with an IAM role, `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` can be omitted — the SDK uses the instance role automatically.

---

## Jurisdictional Coverage
24 MENAT nations: Saudi Arabia, UAE, Qatar, Bahrain, Kuwait, Oman, Egypt, Türkiye, Jordan, Lebanon, Iraq, Morocco, Algeria, Tunisia, Libya, Yemen, Syria, Palestine, Sudan, Mauritania, Djibouti, Somalia, Comoros, Pakistan.

Key regulators: **NCA**, **SDAIA**, **DESC**, **CBB**, **QCB**, **TDRA**, **KVKK**, **CBE**, **TRA**.

Global crosswalks: **NIST CSF 2.0**, **ISO/IEC 27001:2022**, **CSA CCM v4.0.10**.

---

## Coding Standards

1. **TypeScript strict mode** — never use `any` when a known interface exists in `src/types/`.
2. **Atomic state updates** — any change to regulation dates/statuses must use the batch transaction pattern in `AdminContext.tsx` (`pendingMilestoneEdits` → `commitMilestoneEdits()`).
3. **Tailwind only** — no inline styles. Maintain the dark slate theme: `bg-slate-900`, `border-slate-800`, `text-cyan-400`, `text-emerald-400`.
4. **Bedrock error handling** — always wrap `invokeClaudeOnBedrock()` calls in try/catch with graceful fallback to the deterministic engine.
5. **Feature flags** — AI features are gated by `featureFlags.aiCopilot`. Check `featureFlags` from `AdminContext` before rendering AI components.
6. **RBAC** — use `useRBAC()` hook from `RBACContext` for permission checks. Never bypass role guards.
7. **Adding regulations** — new entries go in `src/data/menatData.ts` following the `Regulation` interface with `sampleControls[]`, `nistCsfMapping`, `iso27001Mapping`, and `csaCcmMapping` fields.

---

## Common Tasks for Kiro Copilot

- *"Add a new regulation for Oman's Data Protection Law to `menatData.ts` with 5 sample controls and ISO 27001 mappings."*
- *"Generate a streaming AWS Bedrock response endpoint using `InvokeModelWithResponseStreamCommand` in `server.ts`."*
- *"Add a new tab to the AdminPanel for managing regulation tags."*
- *"Extend the `FeatureFlags` interface in `admin.ts` with a new flag and wire it through `AdminContext` and `server.ts`."*
