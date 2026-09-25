# ComplianceIQ: Enterprise Architecture, Operational Manuals & AWS Bedrock Deployment Guide

**Document Version:** 3.0.0
**Supersedes:** 2.4.0
**Last Updated:** 2026-09-25
**Target Environment:** Enterprise Production & Local Kiro IDE (AWS Bedrock)
**Jurisdictional Scope:** 24 MENAT Sovereign Jurisdictions & Global GRC Crosswalks
**Classification:** Internal Technical Architecture & User/Admin Operational Dossier

---

## What Changed in v3.0.0

This revision brings the manual in line with the platform as actually built. Key changes since v2.4.0:

- **AI engine migration is complete.** The app no longer uses Google Gemini. All AI runs on **AWS Bedrock**, defaulting to **Amazon Nova Pro** (`amazon.nova-pro-v1:0`). The server auto-detects the model family (Nova vs. Claude) and builds the correct request payload, so switching models is a one-line `.env` change.
- **Web search migrated** from Google Search Grounding to the **Tavily Search API**.
- **Data is now file-backed and region-portable.** Regulations, timeline, roadmap, maturity, scraper sources, the news feed, and the Regional Regulatory Digest all load from per-region JSON files under `data/regions/<REGION>/`, editable by admins at runtime and swappable for a new region (e.g. APAC) with no code changes.
- **Configurable benchmark date** per region deployment (`region.config.json`).
- **User suggestion workflow**: normal users can suggest corrections to any regulation field; admins accept/reject.
- **Admin gating hardened**: Tracked Sources and the scraper machinery are admin-only.
- **Jurisdiction counts are now data-driven** (no more hardcoded "24").
- **Timeline coverage expanded** to all 24 jurisdictions.
- Feature-flag behavior, the version-diffs data model, and the watchlist counter are documented accurately.

A detailed change log is in Appendix A.

---

## Table of Contents
1. [Executive Summary & System Architecture](#1-executive-summary--system-architecture)
2. [Detailed Implementation Plan](#2-detailed-implementation-plan)
   - 2.1 Architectural Topology
   - 2.2 Core Data Models & Schema Design
   - 2.3 Region-Portable Data Architecture
   - 2.4 Crosswalk Alignment & LOE Comparator Engine
   - 2.5 Atomic Transactional Timeline Engine
3. [ComplianceIQ User Operational Manual](#3-complianceiq-user-operational-manual)
4. [ComplianceIQ Administrator Operational Manual](#4-complianceiq-administrator-operational-manual)
5. [AWS Bedrock AI Engine (Current Implementation)](#5-aws-bedrock-ai-engine-current-implementation)
6. [Local Setup, Configuration & Deployment](#6-local-setup-configuration--deployment)
7. [Adapting ComplianceIQ to a New Region](#7-adapting-complianceiq-to-a-new-region)
- [Appendix A: Change Log (v2.4.0 → v3.0.0)](#appendix-a-change-log-v240--v300)

---

# 1. Executive Summary & System Architecture

**ComplianceIQ** is an enterprise-grade Governance, Risk, and Compliance (GRC) intelligence platform purpose-built for the **Middle East, North Africa, and Türkiye (MENAT)** region. Covering 24 sovereign jurisdictions, it synthesizes statutory regulations, mandatory cybersecurity frameworks, data protection decrees, and AI governance baselines into a unified regulatory graph, and maps them to international frameworks.

### Architectural Principles
1. **Sovereign Specificity** — high-fidelity indexing of regional statutory instruments (Saudi NCA ECC-1:2018, SDAIA PDPL, UAE DESC IAS v2.0, CBB Operational Cyber, Qatar NIA v2.0, Türkiye KVKK, and many more).
2. **Global Crosswalk Interoperability** — bi-directional mapping of national controls to **NIST CSF 2.0**, **ISO/IEC 27001:2022**, and **CSA CCM v4.0.10**.
3. **Region Portability** — all feature data lives in per-region JSON files, so the platform can be re-pointed to a new region by swapping the region folder.
4. **Atomic State Consistency** — single-transaction timeline and milestone updates keep the timeline, roadmap, and audit ledger in sync.
5. **Defense-in-Depth RBAC** — clear separation of duties across Analyst (read/filter), Compliance Manager (export/evaluate/run scraper), Security Auditor (inspect logs), and Admin (edit mandates, toggles, timelines, sources).

---

# 2. Detailed Implementation Plan

## 2.1 Architectural Topology

```
+-----------------------------------------------------------------------+
|                            CLIENT BROWSER                             |
|  React 19 SPA | Tailwind CSS v4 | Lucide Icons | Recharts & D3 Graph  |
+-----------------------------------+-----------------------------------+
                                    | HTTP / REST
                                    v
+-----------------------------------------------------------------------+
|                    APPLICATION SERVER (server.ts)                     |
|  Node.js / Express | RBAC-aware endpoints | region-file read/write   |
+-------------------+-------------------------------+-------------------+
                    |                               |
                    v                               v
+---------------------------------------+   +-------------------------------+
|            AI + SEARCH LAYER          |   |   FILE-BACKED PERSISTENCE     |
|  AWS Bedrock (Amazon Nova Pro)        |   |   data/regions/<REGION>/*.json|
|  Tavily Search API (web grounding)    |   |   (regulations, timeline,     |
|  Endpoints: chat, redline, interpret, |   |    roadmap, maturity, sources,|
|  smart-insight, maturity, news        |   |    news, digest, config)      |
+---------------------------------------+   +-------------------------------+
```

### Tech Stack
- **Frontend:** React 19, TypeScript 5.8+, Vite, Tailwind CSS v4, Lucide React, Recharts, D3.js v7, Motion.
- **Backend:** Node.js + Express 4, executed via `tsx server.ts`. Serves the API and (in dev) the Vite middleware on port 3000.
- **AI Engine:** AWS Bedrock via `@aws-sdk/client-bedrock-runtime`. Default model **`amazon.nova-pro-v1:0`** (Amazon Nova Pro). Claude models are also supported — the server picks the payload shape automatically.
- **Web Search:** Tavily Search API (replaces Google Search Grounding).
- **Document Export:** jsPDF v4 + jsPDF-AutoTable v5.

## 2.2 Core Data Models & Schema Design

Types live in `src/types/`. The key entities:

### Regulation (`src/types/regulatory.ts`)
Fields include `id`, `countryId`, `name`, `code`, `authority`/`authorityShort`, `category`, `status`, `effectiveDate`, `officialUrl`, `documentPdfUrl`, `sampleControls[]`, optional `versionHistory[]`, `versionDiffId`, and control-structure metadata. New regulations are added via the Admin Console (persisted to the region file), never hardcoded.

### RegulatoryControl / ControlDetail
Per-clause records with domain hierarchy, `mandatoryLevel`, `applicableSectors[]`, and framework mappings (`nistCsf`, `iso27001`, `csaCcm`).

### TimelineEvent (`src/types/regulatory.ts`)
Milestone records with `regulationId?` (links to the registry; **optional**), a new **`standalone?`** flag for milestones that intentionally have no linked registry regulation, plus dates, `eventType`, `status`, `urgency`, `milestones[]`, `complianceChecklist[]`, `officialReference`, and `officialUrl`.

### RegulatoryUpdate (Regional Digest feed)
`id`, `countryId`, `countryName`, `title`, `authority`, `type`, `category`, `publicationDate`, `effectiveDate?`, `status`, `impactLevel`, `targetSectors[]`, `summary`, `keyRequirements[]`, `sourceUrl` (the "Official Gazette" link), `verifiedOfficialSource`.

### FeatureFlags & AuditLogEntry (`src/types/admin.ts`)
Feature toggles and the immutable audit trail. New audit action types include `DIGEST_UPDATE_EDITED`.

## 2.3 Region-Portable Data Architecture

All feature data is loaded from `data/regions/<REGION>/` (default `REGION=menat`). The loader (`src/data/regionLoader.ts`) reads each file with a graceful fallback to the in-code seed if a file is missing, and persists writes atomically (temp file + rename).

Region files for MENAT:

| File | Contents |
|------|----------|
| `regulations.json` | Full regulation registry (89 entries) |
| `timeline.json` | Regulatory milestones/deadlines (41 events, all 24 jurisdictions) |
| `roadmap-milestones.json` / `roadmap-quarters.json` | Enactment roadmap data |
| `maturity.json` | Compliance maturity heatmap snapshot |
| `scraper-sources.json` | Tracked official sources (51) |
| `news-seed.json` | Live news feed seed |
| `digest-updates.json` | Regional Regulatory Digest alerts |
| `region.config.json` | Region label + configurable benchmark date |

The server loads each file into memory at startup and exposes REST endpoints to read and update them; admin edits write back to the file. **Note:** because the data is loaded at startup, a server restart is required for a hand-edited region file to take effect (admin edits through the UI update in-memory state immediately).

## 2.4 Crosswalk Alignment & LOE Comparator Engine
An automated **Level of Effort (LOE)** calculator uses crosswalk density across controls:
- **High Overlap (>75%)** — near-identical requirements; large audit-effort savings.
- **Medium Overlap (40–74%)** — aligned intent, differing sovereign parameters (e.g. incident-notification windows).
- **Low Overlap (<40%)** — sovereign-specific mandates requiring standalone implementation.

## 2.5 Atomic Transactional Timeline Engine
In `src/context/AdminContext.tsx`, batch edits to deadlines/statuses are staged, then committed in a single atomic dispatch, propagated to the timeline, roadmap, and regulation cards, and recorded in the audit ledger with before/after values for rollback.

---

# 3. ComplianceIQ User Operational Manual

For compliance officers, risk analysts, and legal counsel.

## 3.1 Overview & Navigation
The top navigation groups modules into clusters: **Coverage & Registry**, **AI & Audit Tools**, and **Intelligence & Radar**. A global search finds regulations by code, authority, or topic. Which modules appear depends on the feature flags (see 4.4) and, for admin-only modules, your role.

## 3.2 Sovereign Jurisdictions & Controls Registry (Overview)
Filter by jurisdiction, inspect regulation cards (code, authority, status, category, dates, penalties), and open **View Controls** for the full clause breakdown and international mappings. The jurisdiction count shown across the app is **data-driven** — it reflects the actual country list rather than a fixed number.

## 3.3 Regional Regulatory Digest (Digest tab)
Personalized high-priority alerts for your subscribed jurisdictions and sectors. Each alert links to its **Official Gazette** source. This feed is file-backed and admin-editable (see 4.5), so the source links can be corrected without a code change.

## 3.4 Regulatory Radar & Feed (Radar tab)
Shows the live "Upcoming Regulations & Public Consultations" feed for all users. The **scraper machinery** on this page (the "Automated Regulatory Scraper & Change Watchdog" panel, the "Run Scraper Now" control, and the "Live Crawler Audit Trail") is **admin-only** and hidden for normal users.

## 3.5 Controls Crosswalk (Controls tab)
Maps regional requirements to NIST CSF 2.0, ISO/IEC 27001:2022, and CSA CCM v4.0.10. Enter your certified controls to find corresponding MENAT clauses; export the crosswalk.

## 3.6 Cross-Regulation Overlap & LOE Comparator (Compare tab)
Select a primary and comparison regulation, analyze overlap, and review the mutual-compliance ratio, LOE saved, and gap delta.

## 3.7 AI Control Clause Interpreter & Multi-Standard Redlining
- **Clause Interpreter** — select a clause and generate an operational checklist, evidence requirements, and common pitfalls.
- **AI Redlining** — paste an internal policy, select target regulations, and get missing-clause detection and redline suggestions.

Both are powered by AWS Bedrock (Amazon Nova Pro) with a deterministic fallback engine if the model call fails.

## 3.8 Regulatory Watchlist & Specialized Trackers (Watchlist tab)
Pin regulations to your watchlist and set deadline/amendment alert preferences. The **"tracked" count in the nav badge matches the count on the page** — both count only pins that resolve to a current regulation (stale pins that reference removed regulations are not counted).

## 3.9 Generating Audit-Ready Reports (Export)
Export a PDF dossier, CSV, or JSON payload for selected regulations or all jurisdictions.

---

# 4. ComplianceIQ Administrator Operational Manual

For Administrators. The Admin Console requires the admin role plus a password unlock (three-layer defense: nav gating, access-denied guard, password gate).

## 4.1 Admin Console Gateway & RBAC Governance
Roles: `admin` (full read/write, toggles, timeline edits, scraper, sources), `compliance_manager` (export/evaluate/run scraper), `security_auditor` (read + audit trails), `analyst`/normal user (view-only; admin activities disabled by default). Non-admins cannot reach the Admin Console.

## 4.2 Regulations Editor
Add, amend, or delete regulations. All changes persist to `data/regions/<REGION>/regulations.json`. This is the only supported way to change the registry — nothing is hardcoded.

## 4.3 Timeline & Milestones Manager
Edit milestones and the **configurable benchmark date** (the "current date" anchor used for urgency/deadline math — set this to a deployment's go-live date). Batch edits commit atomically and are audit-logged. Timeline data is file-backed (`timeline.json`).

## 4.4 Feature Toggles
Each toggle is a **global, platform-wide on/off switch**. Disabling a feature hides it for **all users, including admins** — the nav item disappears and the tab redirects to Overview. (The only nav entries that additionally require the admin role are the inherently admin-only ones: Tracked Sources and the Admin Console.) Toggles persist to the server and are hydrated by all clients on load.

Example: turning off "Enactment Roadmap & Investment Model" removes the Enactment Roadmap for everyone.

## 4.5 Digest Feed Editor
Edit the Regional Regulatory Digest alerts — including each alert's **Official Gazette link (`sourceUrl`)**, title, authority, summary, and verified flag. Changes persist to `digest-updates.json` and are audit-logged (`DIGEST_UPDATE_EDITED`).

## 4.6 Tracked Sources & Scraper (Admin-only)
The Tracked Sources tab and all scraper controls are admin-only and additionally respect the `sourcesManager` toggle. Manage tracked official portals and trigger on-demand crawls; inspect the live audit trail.

## 4.7 Link Reachability & Web Scraper Audits
Run the reachability checker to test all statutory URLs:
```bash
npm run check-links
```
It reports HTTP status per URL and flags broken links.

## 4.8 User Suggestions Queue
Normal users can submit correction suggestions for any regulation field. Admins review and accept (applies via the regulation update path, persisting to the region file) or reject. Link-suggestion and field-correction queues appear under the Admin Console.

## 4.9 Feature Flag Reference
Flags include: `regulatoryFeed`, `aiCopilot`, `maturityHeatmap`, `regulatoryRoadmap`, `regulatoryTimeline`, `versionDiffs`, `controlsCrosswalk`, `regulationComparator`, `controlInterpreter`, `aiRedlining`, `sectorMatrix`, `sourcesManager`, `exportReports`, `watchlistAlerts`, `systemBroadcast`.

---

# 5. AWS Bedrock AI Engine (Current Implementation)

> The migration from Google Gemini to AWS Bedrock is **complete**. This section documents the live implementation, not a future plan.

All AI calls go through a single choke-point in `server.ts`, `invokeClaudeOnBedrock(systemPrompt, userPrompt, maxTokens)` (name retained for compatibility; it serves whichever Bedrock model is configured). Web search uses `tavilySearch(query, maxResults)`.

### Model selection & family auto-detection
```typescript
const BEDROCK_MODEL_ID = process.env.BEDROCK_MODEL_ID || 'amazon.nova-pro-v1:0';

const isNovaModel   = (id: string) => id.startsWith('amazon.nova');
const isClaudeModel = (id: string) => id.startsWith('anthropic.claude');
```
The helper builds the correct request body per family:
- **Amazon Nova** — `system` is a separate top-level key; message content is an array of `{ text }`; response text at `output.message.content[0].text`.
- **Anthropic Claude** — `anthropic_version` + `system` + `messages`; response text at `content[0].text`.

Switching models is a one-line change in `.env` (`BEDROCK_MODEL_ID=...`) plus a restart — no code edits.

### AI endpoints (all Bedrock-backed)
| Endpoint | Purpose |
|----------|---------|
| `POST /api/ai/chat` | Compliance copilot with Tavily web search |
| `POST /api/ai/maturity-analysis` | Country/sector maturity memo |
| `POST /api/ai/smart-insight` | Per-regulation sector-impact bullets |
| `POST /api/ai/analyze-requirements` | Per-control mandate classification |
| `POST /api/control/interpret` | Control clause deep-dive (deterministic + Bedrock) |
| `POST /api/ai/redline` | Policy gap analysis (deterministic + Bedrock) |
| `GET/POST /api/news/grounded` | Live MENAT news via Tavily + model synthesis |

Every Bedrock call is wrapped in try/catch with a graceful fallback (deterministic engine or cached data).

### Cost note (Amazon Nova Pro, on-demand)
Roughly ~$0.80 per 1M input tokens and ~$3.20 per 1M output tokens — on the order of a half-cent per AI action, with no idle charge. Amazon Nova Lite is materially cheaper if you want to reduce cost (switch via `.env`).

---

# 6. Local Setup, Configuration & Deployment

## 6.1 Prerequisites
- Node.js 18+ or 20+.
- An AWS account with Amazon Bedrock model access granted for your chosen model (e.g. Amazon Nova Pro).
- A Tavily API key (for web search / live news).

## 6.2 Environment Variables (`.env`)
```env
PORT=3000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
BEDROCK_MODEL_ID=amazon.nova-pro-v1:0
TAVILY_API_KEY=<your-tavily-key>
APP_URL=http://localhost:3000
# Optional: REGION=menat  (selects data/regions/<REGION>/)
```
On EC2/ECS with an IAM role, the two AWS key variables can be omitted — the SDK uses the instance role automatically. **Never commit real keys.** Rotate any key that has been shared.

## 6.3 Install & Run
```bash
npm install
npm run dev          # full-stack dev server at http://localhost:3000
npm run build        # production build (Vite SPA + esbuild server bundle)
npm run lint         # type-check (tsc --noEmit)
npm run check-links  # regulatory URL reachability audit
```

## 6.4 Bedrock Model Access (one-time)
1. AWS Console → **Amazon Bedrock → Model access**.
2. Ensure your chosen model (e.g. **Amazon Nova Pro**) shows **Access granted**; request access if not.
3. Create an IAM user/role with `bedrock:InvokeModel` (or attach a suitable managed policy) and set credentials via `.env` or `aws configure`.

## 6.5 Production Deployment
- Containerize (multi-stage `node:20-alpine`), push to **Amazon ECR**.
- Deploy to **AWS App Runner** or **ECS Fargate** with an IAM task role granting `bedrock:InvokeModel` — no static keys in the container.
- Persist the `data/regions/` directory (volume or object storage sync) if you rely on runtime admin edits.

---

# 7. Adapting ComplianceIQ to a New Region

Because all data is file-backed, moving from MENAT to another region (e.g. APAC) requires **no code changes**:

1. Create `data/regions/<new-region>/` with the same file set (`regulations.json`, `timeline.json`, `roadmap-*.json`, `maturity.json`, `scraper-sources.json`, `news-seed.json`, `digest-updates.json`, `region.config.json`).
2. Set `region.config.json` with the new region label and its benchmark (go-live) date.
3. Start the server with `REGION=<new-region>`.
4. The jurisdiction counts, feeds, timeline, and digest all follow the new data automatically.

---

# Appendix A: Change Log (v2.4.0 → v3.0.0)

- **AI engine:** Replaced Google Gemini with AWS Bedrock. Default model is now **Amazon Nova Pro** (`amazon.nova-pro-v1:0`); Claude remains supported via automatic family detection. Model switch is a one-line `.env` change.
- **Web search:** Replaced Google Search Grounding with the **Tavily Search API**.
- **Region-portable data:** Migrated regulations, timeline, roadmap, maturity, scraper sources, news, and the Regional Digest from in-code arrays to per-region JSON files under `data/regions/<REGION>/`, read/written via `regionLoader.ts`.
- **Configurable benchmark date** via `region.config.json` and the Timeline Manager.
- **Digest feed migration:** `MOCK_REGULATORY_UPDATES` moved to `digest-updates.json`; new admin **Digest Feed** editor to fix Official Gazette links and fields; fixed a malformed NCA double-slash URL.
- **User suggestion workflow:** normal users suggest corrections to any regulation field; admins accept/reject.
- **Admin gating:** Tracked Sources and all scraper machinery (Radar scraper panel, audit trail, header Sync button) are admin-only.
- **Feature toggles** documented as global (affect admins too).
- **Jurisdiction counts** made data-driven (removed hardcoded "24"; fixed a stray "14"). All 24 countries confirmed within the MENAT footprint (Israel already included).
- **Timeline:** fixed NCA double-slash URLs; linked previously-unlinked events to registry regulations; flagged two genuinely standalone events; expanded coverage from 12 to all 24 jurisdictions (41 events total).
- **Watchlist counter:** nav badge now matches the page by counting only pins that resolve to a current regulation.
- **Version Diffs:** clarified that the 7 entries are hand-authored before/after legal analyses (data-depth, not a defect); dataset lives in `src/data/versionDiffsData.ts`.

> Note on projected dates: some timeline milestones for smaller jurisdictions are modelled compliance checkpoints on the 2026–2027 horizon (clearly labelled in each description), not gazetted legal deadlines. Validate against each regulator's official notice before relying on them.
