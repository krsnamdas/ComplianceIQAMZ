# Timeline / Roadmap ↔ Registry Reconciliation Report

Generated during Phase 1 of the region-folder data refactor. This documents how the
`regulationId` links in the Timeline and Roadmap datasets were reconciled against the
real regulation registry (`data/regions/menat/regulations.json`, 89 regulations).

**Action taken:** only the *confident* matches below were applied automatically to
`regulatoryTimelineData.ts` and `regulatoryRoadmapData.ts` (repairing previously broken
"view / edit / pin linked regulation" actions). Orphans and pre-existing registry
duplicates were **left untouched** and are flagged here for your manual review.

---

## 1. Confident matches applied (timeline/roadmap ID → real registry ID)

These were verified by matching regulation code + authority + subject, not fuzzy text.

| Old ID (timeline/roadmap) | Real registry ID | Regulation |
|---|---|---|
| ksa-nca-ecc | ksa-ecc-1 | NCA ECC-1:2018 |
| ksa-nca-otcc | ksa-otcc-1 | NCA OTCC-1:2022 |
| ksa-nca-cscc | ksa-cscc-1 | NCA CSCC-1:2019 |
| ksa-sdaia-ai-ethics | ksa-ai-ethics | SDAIA AI Ethics |
| ksa-cst-space | ksa-space-act | CST Space Regs |
| uae-pdpl-45 | uae-fed-pdpl | UAE Federal Decree-Law 45/2021 |
| uae-ai-code-2027 | uae-ai-nat-strat | UAE National AI Strategy/Ethics |
| uae-cbuae-ccsf | uae-cbuae-cyber | CBUAE Cyber Risk Standard |
| eg-dpl-151 | eg-law-151 | Egypt Law 151/2020 |
| jo-pdpl-24 | jordan-pdpl-24 | Jordan PDPL Law 24/2023 |
| om-pdpl-rd6 | om-pdpl-6 | Oman Royal Decree 6/2022 |
| om-cbo-bm1188 | oman-cbo-resilience | CBO Cybersecurity/Resilience Framework |
| kw-cbk-csf | kuwait-cbk-cyber | CBK Cybersecurity Framework |
| kw-citra-cloud | kuwait-citra-cloud | CITRA Cloud Framework |
| morocco-0908 | morocco-cndp-0908 | Morocco Law 09-08 |
| (identity, already correct) | ksa-pdpl / uae-difc-dp-2020 / uae-cbuae-open-fin / tr-kvkk-6698 / tr-spk-crypto-7518 | — |

## 2. Plausible matches — APPLIED but please VERIFY

These are reasonable but the linked regulation differs somewhat in focus from the
timeline/roadmap entry. Applied to restore a link, but confirm they point to the
intended regulation:

| Old ID | Mapped to | Note to verify |
|---|---|---|
| ksa-sama-open-banking | ksa-sama-csf | Timeline entry is "SAMA Open Banking v2"; registry only has "SAMA Cybersecurity Framework". Different instruments — consider adding a distinct SAMA Open Banking regulation. |
| il-ppl-amendment-13 | il-ppa-5777 | Israel PPL Amendment 13 mapped to the Privacy Protection Regulations (PPA-Reg-5777). Related regime, different instrument. |
| qa-qcb-cloud | qatar-qcb-cyber | "QCB FinTech Cloud Circular" mapped to the QCB Cybersecurity Framework. Same authority, different focus. |
| bh-cbb-cra | bh-cbb-om | "CBB Rulebook Volume 6 / Crypto-Asset (CRA)" mapped to the CBB OM Module. Same authority, different module. |

## 3. Orphans — NOT linked (no matching regulation in registry) — FLAG FOR REVIEW

These timeline/roadmap entries reference regulations that do **not exist** in the
registry. Left with their original IDs (links will not resolve). Decide per item whether
to (a) add the regulation to the registry, or (b) remove the timeline/roadmap entry.

| Orphan ID | Timeline/Roadmap entry | Suggested action |
|---|---|---|
| qatar-ncsa-ncf | "Qatar NCF v2.0" (National Cyber Framework) | Registry has NCSA NIA v2.0 (`qa-ncsa-nia`) — different instrument. Add NCF, or relink to NIA if same. |
| uae-nesa-ias | "NESA IAS / UAE IA" | Registry has DESC IAS (`uae-desc-ias`) — related, different authority. Verify. |
| il-boi-361 | "Bank of Israel Directive 361" | No BOI regulation in registry. Add if in scope. |
| tn-bct-2020-11 | "BCT Circular 2020-11" (Tunisia Central Bank) | No BCT regulation in registry. Add if in scope. |
| tr-cbdfo-big | "CBDFO BIG Guide v2" | Registry has BİGR 2020 (`tr-ddo-bigr`) — possibly the same guide; verify and relink. |
| bh-cbb-pqc | "CBB Circular 2024/PQC" (post-quantum) | No such regulation in registry. Add if in scope. |
| gcc-unified-cyber | "GCC Cyber Accord 2028" | Aspirational/future regional accord — not a current regulation. Likely keep as roadmap-only. |
| menat-data-adequacy | "MENAT Data Treaty 2028" | Aspirational/future — roadmap-only. |
| regional-water-ot | "MENAT Desal-Cyber 2028" | Aspirational/future — roadmap-only. |

## 4. Pre-existing DUPLICATE IDs in the registry — FLAG FOR REVIEW

While extracting `regulations.json`, I found **four IDs each used by TWO different
regulations** (from a prior merge of overlapping data). These are genuine duplicates you
asked to be told about — please decide which to keep / rename / remove. I did **not**
change them.

| Duplicate ID | Regulation A | Regulation B |
|---|---|---|
| uae-cbuae-enabling-tech | "CBUAE Stored Value / Tech 2020" | "CBUAE-ET-2023" |
| uae-cbuae-open-fin | "CBUAE Open Finance 2024" | "CBUAE-OF-2024" |
| uae-difc-dp-2020 | "DIFC Law No. 5/2020" | "DIFC Law No. 5 of 2020" |
| uae-tdra-cloud-sec | "TDRA Cloud Cyber 2023" | "TDRA-CSP-2022" |

> These duplicates all sit under UAE and appear to be the same regulation entered twice
> under slightly different names. Recommend keeping one of each pair and removing the
> other. Because they share an `id`, the app currently treats them as separate list
> entries but any id-based lookup resolves to whichever appears first.

---

*You can act on Sections 3 and 4 at any time via the admin panel (now file-backed) or by
editing `regulations.json` directly. No code changes are required.*
