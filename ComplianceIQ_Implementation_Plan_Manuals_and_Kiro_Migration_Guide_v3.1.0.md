# ComplianceIQ: Enterprise Architecture, Operational Manuals & AWS Bedrock Deployment Guide

**Document Version:** 3.1.0
**Supersedes:** 3.0.0
**Last Updated:** 2026-09-26
**Target Environment:** Enterprise Production & Local Kiro IDE (AWS Bedrock)
**Jurisdictional Scope:** 24 MENAT Sovereign Jurisdictions & Global GRC Crosswalks
**Classification:** Internal Technical Architecture & User/Admin Operational Dossier

---

## What Changed in v3.1.0

This revision documents the UI/UX overhaul, per-user personalization, admin-tooling additions, and reliability fixes shipped since v3.0.0. (v3.0.0 remains the reference for the AI-engine migration and region-portable data architecture, which are unchanged.)

- **Dual theme + Dark/Light toggle.** A re-skinned dark theme ("Warm Graphite") and a new light theme ("Light Executive"), switchable from a Navbar toggle. Delivered centrally via Tailwind v4 `@theme` design tokens so ~1,800 utility usages re-skin without per-component edits; light mode is fully scoped under `html.light` so dark mode is provably untouched.
- **Per-user watchlist, alerts & read-state.** Watchlist pins, simulated/custom alerts, read/unread state, and dismissed-notification state are now isolated **per user** (localStorage keys suffixed with the user id). New watchlists start empty; recommended pins are derived from the live registry.
- **Bell notifications rebuilt.** The normal-user bell now renders the user's real per-regulation notifications (not hardcoded cards), each with a per-alert dismiss (X), a "Dismiss all", working "View Regulation" deep-links, and an empty state. The admin bell's operational reminders are individually dismissible and persisted per-admin.
- **Deterministic regulation deep-linking.** All "View Regulation" links across the app now open the exact regulation by unique id (via a single shared `focusRegulation` path), eliminating a class of wrong-link bugs caused by code-substring matching (e.g. `ECC` vs `OTCC`, `CSCC-1` vs `CSCC-2`).
- **Admin "Manage Controls" editor.** The Regulation editor now lets admins add/edit/remove individual granular controls — code, clause reference, mandatory level, title, verbatim description, and NIST CSF / ISO 27001 / CSA CCM mappings — persisted to the region file. No code edits needed to expand mappings.
- **Honest link-verification status.** Regulation link badges are now three-state — **Verified (200 OK)**, **Unverified / Missing**, and **Not checked** — instead of falsely defaulting to "Verified" before any probe.
- **Clearer feature naming.** The Navbar "Sync" button is now **"Sync Sources"** (crawls source portals for new activity) and the admin link checker is **"Verify Links"** (confirms each regulation's URLs resolve) — two distinct functions, previously ambiguous.
- **"Key sample controls" clarity notice** on each regulation card, stating the controls shown are a curated representative subset out of the regulation's real total.
- **Wide-table scroll affordance.** Horizontally-scrolling admin/data tables now show an always-visible horizontal scrollbar so users can tell more columns exist off-screen.
- **Data & reliability fixes:** de-duplicated four UAE regulation records that shared IDs (now 89 unique); added a defensive de-dupe guard on load; fixed an admin edit → home-tab navigation bounce; tightened watchlist notification matching precedence.

A detailed change log is in Appendix A.

---

## Table of Contents
1. [Executive Summary & System Architecture](#1-executive-summary--system-architecture)
2. [Detailed Implementation Plan](#2-detailed-implementation-plan)
3. [ComplianceIQ User Operational Manual](#3-complianceiq-user-operational-manual)
4. [ComplianceIQ Administrator Operational Manual](#4-complianceiq-administrator-operational-manual)
5. [AWS Bedrock AI Engine (Current Implementation)](#5-aws-bedrock-ai-engine-current-implementation)
6. [Theme System & UI Conventions](#6-theme-system--ui-conventions)
7. [Local Setup, Configuration & Deployment](#7-local-setup-configuration--deployment)
8. [Adapting ComplianceIQ to a New Region](#8-adapting-complianceiq-to-a-new-region)
9. [Roadmap: Phase 2 (Scraper Intelligence)](#9-roadmap-phase-2-scraper-intelligence)
- [Appendix A: Change Log (v3.0.0 → v3.1.0)](#appendix-a-change-log-v300--v310)

---

# 1. Executive Summary & System Architecture

**ComplianceIQ** is an enterprise-grade Governance, Risk, and Compliance (GRC) intelligence platform purpose-built for the **Middle East, North Africa, and Türkiye (MENAT)** region. Covering 24 sovereign jurisdictions, it synthesizes statutory regulations, mandatory cybersecurity frameworks, data protection decrees, and AI governance baselines into a unified regulatory graph, and maps them to international frameworks.

### Architectural Principles
1. **Sovereign Specificity** — high-fidelity indexing of regional statutory instruments (Saudi NCA ECC-1:2018, NCA OTCC-1:2022, SDAIA PDPL, UAE DESC IAS v2.0, CBB Operational Cyber, Qatar NIA v2.0, Türkiye KVKK, and many more).
2. **Global Crosswalk Interoperability** — bi-directional mapping of national controls to **NIST CSF 2.0**, **ISO/IEC 27001:2022**, and **CSA CCM v4.0.10**.
3. **Region Portability** — all feature data lives in per-region JSON files, so the platform can be re-pointed to a new region by swapping the region folder.
4. **Atomic State Consistency** — single-transaction timeline and milestone updates keep the timeline, roadmap, and audit ledger in sync.
5. **Defense-in-Depth RBAC** — clear separation of duties across Analyst (read/filter), Compliance Manager (export/evaluate/run scraper), Security Auditor (inspect logs), and Admin (edit mandates, toggles, timelines, sources).
6. **Per-User Personalization** — watchlist, alerts, and notification state are isolated per user account and never leak across sessions.

---

# 2. Detailed Implementation Plan

## 2.1 Architectural Topology

```
+-----------------------------------------------------------------------+
|                            CLIENT BROWSER                             |
|  React 19 SPA | Tailwind CSS v4 (token themes) | Lucide | Recharts/D3 |
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
- **Frontend:** React 19, TypeScript 5.8+, Vite, Tailwind CSS v4 (design-token theming), Lucide React, Recharts, D3.js v7, Motion.
- **Backend:** Node.js + Express 4, executed via `tsx server.ts`. Serves the API and (in dev) the Vite middleware on port 3000.
- **AI Engine:** AWS Bedrock via `@aws-sdk/client-bedrock-runtime`. Default model **`amazon.nova-pro-v1:0`** (Amazon Nova Pro). Claude models are also supported — the server picks the payload shape automatically.
- **Web Search:** Tavily Search API.
- **Document Export:** jsPDF v4 + jsPDF-AutoTable v5.

## 2.2 Core Data Models & Schema Design

Types live in `src/types/`. Key entities (unchanged from v3.0.0 except where noted):

### Regulation (`src/types/regulatory.ts`)
`id`, `countryId`, `name`, `code`, `authority`/`authorityShort`, `category`, `status`, `effectiveDate`, `officialUrl`, `documentPdfUrl`, `sampleControls[]`, optional `versionHistory[]`, `versionDiffId`, and `controlStructure` metadata (`domainsCount`, `subDomainsCount`, `totalControlsCount`, `domainList[]`). **All regulation IDs are unique** (four duplicate UAE records were reconciled in v3.1.0).

### ControlDetail
Per-clause records with domain hierarchy, `mandatoryLevel`, `applicableSectors[]`, and framework mappings (`nistCsf`, `iso27001`, `csaCcm`). **Now fully admin-editable** via the Manage Controls section of the Regulation editor (see 4.2). `sampleControls[]` is a curated representative subset; `controlStructure.totalControlsCount` is the regulation's real total.

### WatchlistNotification / per-user state
Notifications carry `regulationId` (exact link target), `regulationCode`, `title`, `summary`, `urgency`, `type`, `sourceUrl`, and `read`. Per-user state is persisted under user-scoped localStorage keys: `menat_watchlist_pins_v2::<userId>`, `menat_custom_notifications_v2::<userId>`, `menat_read_notifications_v2::<userId>`, `menat_dismissed_notifications_v2::<userId>`.

### TimelineEvent, RegulatoryUpdate, FeatureFlags & AuditLogEntry
As documented in v3.0.0.

## 2.3 Region-Portable Data Architecture

Unchanged from v3.0.0. All feature data loads from `data/regions/<REGION>/` (default `menat`) via `src/data/regionLoader.ts`, with atomic writes and graceful in-code fallback. MENAT region files: `regulations.json` (89, all unique IDs), `timeline.json` (41), `roadmap-*.json`, `maturity.json`, `scraper-sources.json` (51), `news-seed.json`, `digest-updates.json`, `region.config.json`. A server restart is required for a hand-edited region file to take effect; UI admin edits update in-memory state immediately.

## 2.4 Crosswalk Alignment & LOE Comparator Engine
Unchanged: LOE calculator uses crosswalk density (High >75%, Medium 40–74%, Low <40%).

## 2.5 Atomic Transactional Timeline Engine
Unchanged: staged batch edits committed atomically, propagated to timeline/roadmap/cards, recorded in the audit ledger with before/after values.

## 2.6 Regulation Deep-Linking (new in v3.1.0)
Every "View Regulation" action across the app (bell, timeline, heatmap, sector matrix, roadmap, impact-horizon, redlining, watchlist, digest) routes through a single `focusRegulation(idOrCode)` handler in `App.tsx`. It resolves the **exact** regulation by unique id and focuses the registry on that single record (`focusedRegulationId` state), rather than pushing a code string through a substring search filter. This eliminates wrong-link collisions between similar codes. Typing in the search box clears the focus and restores normal free-text search.

---

# 3. ComplianceIQ User Operational Manual

For compliance officers, risk analysts, and legal counsel.

## 3.1 Overview, Navigation & Theme
The top navigation groups modules into clusters: **Coverage & Registry**, **AI & Audit Tools**, **Intelligence & Radar**, and **Sources & Governance** (admin). A **Dark/Light theme toggle** sits in the Navbar; your choice persists. A global search finds regulations by code, authority, or topic. Which modules appear depends on feature flags and, for admin-only modules, your role.

## 3.2 Sovereign Jurisdictions & Controls Registry (Overview)
Filter by jurisdiction, inspect regulation cards, and open **View Controls** for the clause breakdown and international mappings.

**Key sample controls notice:** each card's controls section states that the controls shown are a **representative key sample** (e.g. "Showing 1 key sample control … out of ~114 total controls"), not the regulation's full catalogue. The full total is shown in the card header.

## 3.3 Regional Regulatory Digest (Digest tab)
Personalized high-priority alerts; each links to its **Official Gazette** source. File-backed and admin-editable.

## 3.4 Regulatory Radar & Feed (Radar tab)
Live "Upcoming Regulations & Public Consultations" feed for all users. The scraper machinery is **admin-only**.

## 3.5 Controls Crosswalk / Comparator / Sector Matrix
Map regional requirements to NIST CSF 2.0, ISO/IEC 27001:2022, and CSA CCM v4.0.10; compare two regulations for overlap and LOE; view sector applicability.

## 3.6 AI Control Clause Interpreter & Multi-Standard Redlining
Powered by AWS Bedrock (Amazon Nova Pro) with a deterministic fallback. All Control Interpreter input fields are readable in both themes.

## 3.7 Regulatory Watchlist & Specialized Trackers (Watchlist tab)
Pin regulations and set alert preferences. **Everything here is per-user:** your pins, alerts, and read/unread state are private to your account and never shared. A new account starts with an empty watchlist. The nav "tracked" badge matches the page count (only pins resolving to a current regulation count).

## 3.8 Notification Bell
The bell shows **your** real per-regulation notifications derived from your pins:
- Each alert has an **X** to dismiss it (dismissal is durable and per-user).
- **"Dismiss all"** clears the list; an empty state shows when nothing is pending.
- **"View Regulation"** opens the exact regulation the alert refers to.
- The red badge reflects the true count and disappears when cleared.

## 3.9 Generating Audit-Ready Reports (Export)
Export a PDF dossier, CSV, or JSON for selected regulations or all jurisdictions.

---

# 4. ComplianceIQ Administrator Operational Manual

The Admin Console requires the admin role plus a password unlock (three-layer defense: nav gating, access-denied guard, password gate).

## 4.1 Admin Console Gateway & RBAC Governance
Roles as in v3.0.0. Editing a regulation and clicking **Update Regulation** now keeps you in the Admin Console (the prior bounce-to-home behavior is fixed).

## 4.2 Regulations Editor & Manage Controls
Add, amend, or delete regulations — persisted to `data/regions/<REGION>/regulations.json`.

**New: Manage Controls.** Inside the edit dialog, the **"Granular Controls & Global Mappings"** section lists the regulation's authored sample controls and lets you:
- **Add Control** — create a new control row.
- Edit each control's **Code, Clause Reference, Mandatory Level, Title, Verbatim Description**, and its **NIST CSF / ISO 27001 / CSA CCM** mappings.
- **Remove** a control.

On save, the controls persist to the region file and render on the public card with their crosswalk pills. The header "Total Controls" count is auto-reconciled to never be smaller than the number of authored controls.

## 4.3 Timeline & Milestones Manager
Edit milestones and the configurable **benchmark date**. Batch edits commit atomically and are audit-logged.

## 4.4 Feature Toggles
Each toggle is a **global** on/off switch affecting all users including admins. Tracked Sources and the Admin Console additionally require the admin role.

## 4.5 Digest Feed Editor
Edit Digest alerts including each **Official Gazette link**; persists to `digest-updates.json` (`DIGEST_UPDATE_EDITED` audit event).

## 4.6 Tracked Sources & "Sync Sources" (Admin-only)
Manage tracked official portals. The Navbar **"Sync Sources"** button crawls the tracked portals for new regulatory activity (liveness + change monitoring). This is distinct from link verification (4.7).

## 4.7 Link Integrity & "Verify Links"
The **Link Integrity & 404 Scanner** tab's **"Verify Links"** button (and the automatic 12-hourly daemon) run real HTTP reachability checks on every regulation's Official Portal and PDF URLs. Results drive each card's status badge:
- **Verified (200 OK)** — an audit confirmed the link resolves.
- **Unverified / Missing** — an audit found it broken (note: some government portals block automated checks, so a flagged link may still open in a browser).
- **Not checked** — no audit has run yet for that link.

Run "Verify Links" to clear "Not checked" statuses. (The audit store is in-memory and resets on server restart.)

## 4.8 Admin Notification Bell
The admin bell shows operational reminders (link submissions queue, link-integrity audit, scraper daemon). Each is individually dismissible (X), with a "Dismiss all"; dismissals persist per-admin.

## 4.9 User Suggestions Queue
Normal users submit correction suggestions; admins accept (applies via the regulation update path) or reject.

## 4.10 Audit Trail
All user activities are captured with per-user attribution (id, name, email, role, timestamp, action type, target, details). Searchable and exportable to CSV. Note: the audit log is stored client-side (localStorage, last 200 entries) — for centralized, cross-device audit, see the Phase-2/AWS roadmap.

## 4.11 Feature Flag Reference
`regulatoryFeed`, `aiCopilot`, `maturityHeatmap`, `regulatoryRoadmap`, `regulatoryTimeline`, `versionDiffs`, `controlsCrosswalk`, `regulationComparator`, `controlInterpreter`, `aiRedlining`, `sectorMatrix`, `sourcesManager`, `exportReports`, `watchlistAlerts`, `systemBroadcast`.

---

# 5. AWS Bedrock AI Engine (Current Implementation)

Unchanged from v3.0.0. All AI calls go through `invokeClaudeOnBedrock(systemPrompt, userPrompt, maxTokens)` in `server.ts`, with automatic Nova/Claude payload detection driven by `BEDROCK_MODEL_ID` (default `amazon.nova-pro-v1:0`). Endpoints: `/api/ai/chat`, `/api/ai/maturity-analysis`, `/api/ai/smart-insight`, `/api/ai/analyze-requirements`, `/api/control/interpret`, `/api/ai/redline`, `/api/news/grounded`. Every call has a deterministic fallback. Cost order-of-magnitude: ~$0.80 / 1M input tokens, ~$3.20 / 1M output tokens for Nova Pro.

---

# 6. Theme System & UI Conventions

New in v3.1.0.

## 6.1 How theming works
Theming is centralized in `src/index.css` using Tailwind v4 `@theme` design tokens. The Tailwind color families (`slate`, `cyan`, `emerald`, plus semantic accents) are **remapped** to a curated palette, so a single token change re-skins every component using those utilities — no per-component edits.

- **Dark theme ("Warm Graphite"):** default; warm charcoal surfaces, indigo-violet primary accent, green success.
- **Light theme ("Light Executive"):** activated by adding the `light` class to `<html>`; all light overrides are scoped under `html.light`, so the dark theme is provably unaffected.
- The `dark` class stays on `<html>` at all times (a small number of components use Tailwind `dark:` variants and must follow the app theme, not the OS preference); the `light` class is layered on for light mode.
- Theme choice is managed by `src/context/ThemeContext.tsx` and toggled from the Navbar.

## 6.2 UI conventions added in v3.1.0
- **Wide tables** use the `table-scroll-x` utility for an always-visible horizontal scrollbar so off-screen columns are discoverable.
- **Status badges** use three explicit states for link verification (Verified / Unverified / Not checked) rather than implying verification by default.
- **Informational notices** (e.g. the key-sample-controls note) use an amber style distinct from filter notices.

## 6.3 Contrast
Both themes were checked for WCAG AA/AAA text contrast (input placeholders, secondary labels, hover states, heatmap SVG axis labels, and badges were specifically tuned for the light theme).

---

# 7. Local Setup, Configuration & Deployment

## 7.1 Prerequisites
- Node.js 18+ or 20+.
- AWS account with Bedrock model access (e.g. Amazon Nova Pro).
- Tavily API key.

## 7.2 Environment Variables (`.env`)
```env
PORT=3000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<your-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-secret-access-key>
BEDROCK_MODEL_ID=amazon.nova-pro-v1:0
TAVILY_API_KEY=<your-tavily-key>
APP_URL=http://localhost:3000
# Optional: REGION=menat
```
On EC2/ECS with an IAM role, the AWS key variables can be omitted. **Never commit real keys; rotate any shared key.**

## 7.3 Install & Run
```bash
npm install
npm run dev          # full-stack dev server at http://localhost:3000
npm run build        # production build
npm run lint         # type-check (tsc --noEmit)
npm run check-links  # regulatory URL reachability audit
```

## 7.4 Bedrock Model Access & Production Deployment
As in v3.0.0: grant model access in the Bedrock console, use an IAM role with `bedrock:InvokeModel`, containerize and deploy to App Runner / ECS Fargate, and persist `data/regions/` if you rely on runtime admin edits.

---

# 8. Adapting ComplianceIQ to a New Region

Unchanged from v3.0.0. Create `data/regions/<new-region>/` with the full file set, set `region.config.json`, start with `REGION=<new-region>`. Counts, feeds, timeline, and digest follow the new data automatically — no code changes.

---

# 9. Roadmap: Phase 2 (Scraper Intelligence)

Deferred, scoped for a later phase:
1. **Real page change-detection** — content-hash tracked source pages (store in `etagOrHash`), flag genuine changes; optional AI classification of *what* changed. First run establishes a silent baseline.
2. **Link content-relevance** — beyond reachability, confirm a resolving page actually contains the claimed regulation (deterministic keyword scoring first, optional AI pass); add a "Reachable but content mismatch" status.
3. **Web discovery of new/upcoming regulations** — scheduled/on-demand Tavily search + Bedrock extraction into an **admin review queue** (never auto-added to the dataset).
4. **AWS scale-out** — stateless server + DynamoDB/Aurora data layer, S3/CloudFront for the SPA, Cognito auth, EventBridge/Lambda for the daemons, and frontend virtualization for very large control sets.

---

# Appendix A: Change Log (v3.0.0 → v3.1.0)

**Theming & UI**
- Added dual theme (dark "Warm Graphite" + light "Light Executive") with a Navbar Dark/Light toggle, delivered via Tailwind v4 `@theme` token remap; light rules scoped under `html.light`.
- Added `ThemeContext`; fonts updated in `index.html`.
- Fixed numerous light-mode readability issues (placeholders, secondary text, hover states, SDAIA banner, heatmap SVG axis labels, tinted surfaces, dark accent buttons).
- Fixed Control Interpreter input fields that rendered dark-on-dark.
- Added always-visible horizontal scrollbars (`table-scroll-x`) to wide admin/data tables.

**Watchlist, alerts & bell**
- Made watchlist pins, alerts, read-state, and dismissed-notifications **per-user**; removed seed pins; recommended pins derived from the live registry.
- Rebuilt the normal-user bell to show real per-user notifications with per-alert dismiss (X), "Dismiss all", working internal deep-links, and an empty state; removed hardcoded cards and the external "Official Source" link.
- Made admin bell operational reminders individually dismissible and persisted per-admin.
- Added an in-page searchable pin picker to the Watchlist.

**Regulation data & editor**
- Added the **Manage Controls** editor (add/edit/remove controls with NIST/ISO/CSA mappings), persisted to the region file; total-control count auto-reconciled.
- Added a **"key sample controls"** clarity notice on regulation cards.
- **De-duplicated four UAE regulations** that shared IDs (`uae-cbuae-open-fin`, `uae-difc-dp-2020`, `uae-tdra-cloud-sec`, `uae-cbuae-enabling-tech`) by re-IDing the second copies; registry is now 89 records with 89 unique IDs. Added a load-time de-dupe guard so a stale cache can't reintroduce duplicate-key rendering.

**Navigation & correctness**
- Introduced a single `focusRegulation` deep-link path; all "View Regulation" links now open the exact regulation by unique id (fixes code-substring wrong-link bugs, e.g. ECC vs OTCC).
- Fixed the admin edit → **Update Regulation** → bounce-to-home navigation bug (guards now treat an unlocked admin console as authenticated); removed temporary debug logging after resolution.
- Tightened watchlist notification matching precedence (exact id/code before loose country+authority fallback), in both the timeline and updates matchers.

**Link verification & naming**
- Link status is now three-state (**Verified / Unverified / Not checked**); no longer defaults to "Verified" before a real probe.
- Renamed the Navbar scraper button to **"Sync Sources"** and the admin link checker to **"Verify Links"**, with clarified tooltips distinguishing content-crawl vs link-reachability.

**Known limitations / deferred**
- Scraper "new findings" is still a placeholder (real change-detection is Phase 2).
- The link daemon treats government-domain fetch failures leniently (reports reachable) to avoid false positives from bot-blocking.
- Audit log and per-user state are client-side (localStorage); centralization is on the AWS roadmap.
