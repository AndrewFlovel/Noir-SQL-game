# QUERY_NOIR: Forensic SQL Investigation & Progression Engine

An interactive neo-noir SQL investigation workspace where players step into the role of Detective Silas, solving 15 progressive data forensics cases across 3 Clearance Tiers (Beat Sleuth, Syndicate Detective, and Forensic Mastermind) using real SQLite execution, live `EXPLAIN QUERY PLAN` cost profiling, dynamic AI-driven suspect interrogations, and animated cinematic cutscenes at the start and end of every stage and case.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and product choices incorporate your confirmed selections and your latest feedback on stage and case animations:

- **Confirmed Cinematic Stage & Case Animations (New)**:
  - **Stage (Tier) Intro & Finale Cutscenes**: Animated multi-character sequences at the beginning and completion of each of the 3 Clearance Stages (Beat Sleuth, Syndicate Detective, Forensic Mastermind), showcasing **Detective Silas** alongside all participating suspects in their evolving tier personas.
  - **Case Intro & Resolution Confrontation Animations**: Animated split-screen noir encounters at the start and end of all 15 cases featuring **Detective Silas** face-to-face with the case's target suspect(s), complete with high-contrast character portraits, animated dialogue beats, evidence-lockdown stamps, and immediate replay/skip controls.
- **Confirmed Execution Engine**: **Real SQLite Execution + Gemini Forensic Evaluator**. Queries run against a real relational SQLite engine seeded with authentic forensic datasets for each of the 15 cases, paired with a server-side Gemini (`gemini-3.8-flash`) Forensic Director & Suspect Dialogue evaluator that inspects both the query result set, SQL anti-patterns, and execution plan efficiency.
- **Confirmed Visual Aesthetic**: **Dark Neo-Noir Forensic Terminal with Amber Accents**. Deep obsidian-slate surfaces (`#0B0F17`), crisp 1px structural borders (`#1E293B`), warm amber investigation highlights (`#D97706` / `#F59E0B`), and tabular monospace telemetry (`JetBrains Mono`).
- **Confirmed Investigative Toolkit**:
  1. **Interactive Schema Explorer & Sample Data Previewer**: Browse table columns, data types, composite index definitions, and live sample rows for every case.
  2. **Visual EXPLAIN Query Plan & Cost Breakdown Meter**: Real-time SQLite `EXPLAIN QUERY PLAN` analysis paired with a heuristic forensic cost/latency profiler, scan-ratio gauge, and Watchdog Alert meter.
  3. **Suspect Interrogation Dialogue & Progressive Hints**: In-character suspect responses (Vincent Chen, Dolores Delgado, Inspector Marcus Vane, Veronica Sterling, and Archivist Zero) that react to query correctness and optimization efficiency.

---

## 1. Overview & Core Concept

- **What It Does**: Transforms a comprehensive Junior $\rightarrow$ Medior $\rightarrow$ Senior SQL Data Analyst Competency Matrix into a playable 15-case cyberpunk/noir detective thriller. Players experience animated narrative confrontations between Detective Silas and five underworld suspects, inspect crime-scene schemas, write and benchmark SQL queries, and analyze index utilization and execution plans.
- **Target Audience / Persona**: Data analysts, analytics engineers, and SQL learners seeking rigorous practice across data hygiene, window functions, CTEs, temporal math, funnel analysis, and index sargability.
- **Key Value**: Bridges the gap between "queries that merely return rows" and "production-grade analytical SQL" by grading both **Functional Accuracy** (exact evidence rows extracted) and **Forensic Optimization** (execution plan, index seeks, memory overhead, and anti-pattern elimination), wrapped in an immersive character-driven detective story.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Stage (Tier) Opening & Closing Cutscenes**:
   - **Stage Intro Animation**: Entering Tier 1 (Beat Sleuth), Tier 2 (Syndicate Detective), or Tier 3 (Forensic Mastermind) triggers a choreographed `motion` sequence featuring **Detective Silas** in the foreground and the tier's participating suspects illuminated across an investigation lineup board, highlighting how each suspect's underworld role has evolved.
   - **Stage Finale Animation**: Solving the 5th case of a tier triggers a **Stage Cleared / Clearance Promotion** animation where Detective Silas links the 5 solved case dossiers across the syndicate network map, exposing the next tier's conspiracy and promoting the player's detective rank.
2. **Case Opening & Closing Confrontation Animations**:
   - **Beginning of Case (Crime Scene Confrontation)**: Selecting a case launches an animated dual-portrait encounter showing **Detective Silas** (left stage) and the **Case Suspect(s)** (right stage—including joint appearances like *Dolores Delgado & Archivist Zero* in Case 3.1 or *Vincent Chen & Archivist Zero* in Case 3.4). Animated dialogue bubbles, crime-scene telemetry, and a kinetic `CASE FILE OPENED` transition set up the forensic objective before smoothly revealing the SQL workbench.
   - **End of Case (Forensic Interrogation Showdown)**: When a player submits a query that satisfies both the functional evidence check and the performance pass metric, the **Case Resolution Cutscene** animates onto the stage. Detective Silas slides the verified SQL evidence and execution metrics across the interrogation table; the suspect visibly reacts in character (panicking in Tier 1, losing their composure in Tier 2, or glitching/conceding in Tier 3), culminating in an animated `CASE SOLVED // EVIDENCE VERIFIED` seal and a button to advance to the next case.
   - **Replay & Skip Controls**: Every cutscene includes a non-intrusive `Skip Intro` button for fast iteration and a `Replay Cutscene` button in the Case Dossier header so players can re-watch either the intro or outro animation at any time.
3. **Crime Scene Schema & Evidence Inspection**: The left dossier pane displays the Suspect Profile, Narrative Briefing, Forensic Objective, Known Pitfall, and Target Pass Metric. Switching to the **Schema & Indexes** tab reveals every table, column type, primary/composite index, and a 1-click **Sample Rows Preview**.
4. **SQL Workbench & Forensic Evaluation**: Players write SQL in the central editor, click **Run Query** to inspect real SQLite rows and the **EXPLAIN Plan & Cost Meter**, and click **Submit Evidence** to trigger the Gemini Forensic Director evaluation and suspect interrogation.

### Visual Identity & Theme
- **Aesthetic Direction**: Utilitarian dark neo-noir forensic IDE paired with graphic-novel style animated character confrontations.
- **High-Fidelity Character & Scene Assets (`generate_image`)**:
  - Dedicated noir character portraits generated via `generate_image` for **Detective Silas** and all **5 Recurring Suspects** (Vincent "Bit-Shift" Chen, Dolores "Deadlock" Delgado, Inspector Marcus Vane, Veronica "The Broker" Sterling, and Archivist Zero), rendered in a cohesive high-contrast neo-noir lighting style with amber and slate rim lighting.
- **Color Palette & Mood (60-30-10 Discipline)**:
  - **60% Dominant Canvas**: Deep Noir Obsidian (`#0A0E17`) and Charcoal Slate (`#0F172A`) workspace background.
  - **30% Structural Surfaces**: Elevated terminal panels (`#131C2E`), crisp 1px structural hairlines (`#1E293B`), and muted cool-gray secondary prose (`#94A3B8`).
  - **10% Semantic Focal Accents**:
    - **Primary Forensic Amber (`#F59E0B` / `#D97706`)**: Active case indicators, Detective Silas spotlight accents, primary action buttons, and dossier highlights.
    - **Verified Evidence Emerald (`#10B981`)**: Passed pass-metrics, index seek confirmations (`SEARCH TABLE ... USING INDEX`), and cleared case stamps (paired with explicit `VERIFIED` text labels).
    - **Watchdog Alert Crimson (`#EF4444`)**: Full table scans (`SCAN TABLE`), non-sargable warnings, suspect threat auras, and Watchdog intrusion lockouts (paired with explicit `ALERT` / `SCAN DETECTED` text labels).
- **Typography & Hierarchy (2+1 Font Rule)**:
  - **Display / Headings**: `Outfit` (SemiBold 600 / Bold 700, tight tracking) for cutscene titles, clearance headers, and character names.
  - **Body & Dossier Prose**: `Plus Jakarta Sans` (Regular 400 / Medium 500) for high-legibility investigative briefings, cutscene dialogue, and hints.
  - **SQL Code, Schemas & Telemetry**: `JetBrains Mono` with `font-variant-numeric: tabular-nums` for the SQL editor, result tables, execution latency, cost units, and row counters.
- **Component Styling & Layout**:
  - **Top Bar Contract**: Single-row 3-zone header separated by `gap-8`:
    1. *Brand Wordmark*: `QUERY_NOIR` (single text element).
    2. *Navigation Links*: `Active Case`, `Case Index`, `Suspect Dossiers`, `Curriculum Matrix` (4 single-line links).
    3. *Primary Action*: `Submit Evidence` primary CTA button.

### Interactive Feedback & Motion
- **Choreographed Cutscene Animations (`motion/react`)**:
  - **Character Entrance & Spotlight**: Detective Silas enters from the left with a warm amber rim-light sweep while the target suspect(s) slide in from the right with tier-specific atmospheric effects (neon rain streaks in Tier 1, encrypted ledger grid in Tier 2, core glitch scanlines in Tier 3).
  - **Evidence Confrontation Pulse**: During case completion animations, key SQL evidence metrics and the suspect's reaction dialogue animate sequentially using compositor-only `transform` and `opacity` keyframes.
- **Routine Workspace Feedback**: Instant `<150ms` tab transitions and smooth `transform` scale/width transitions on the **Watchdog Intrusion Meter** and **Cost Efficiency Gauge**.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Stage Narrative Cutscene Engine (Stage + Case Boundaries)**
  - *Chosen Approach*: Build a dedicated `CutsceneDirector` overlay component powered by `motion/react` that renders four distinct narrative beats: **Stage Intro** (Silas + all 5 suspects in their current tier roles), **Case Intro** (Silas vs. active case suspect(s) setting the stakes), **Case Outro** (Silas presenting the solved SQL evidence to break the suspect's alibi), and **Stage Outro** (tier clearance summary and promotion).
  - *Why*: Gives players a tangible sense of narrative momentum and visual payoff for writing optimized SQL, while keeping cutscenes skippable and replayable so they never block rapid query experimentation.
- **Decision 2: Dual-Layer SQL Execution + Heuristic Plan Analyzer**
  - *Chosen Approach*: Execute all 15 cases on a real relational SQLite instance (`better-sqlite3` on the Express backend with deterministic seed datasets and real indexes for every case) combined with a SQLite `EXPLAIN QUERY PLAN` + AST static analyzer that calculates realistic large-scale cost projections.
  - *Why*: Combines 100% genuine SQLite execution and real index seeks (`EXPLAIN QUERY PLAN`) with production-scale cost/latency modeling (simulating 10M–15M row behavior when anti-patterns like full scans or non-sargable predicates occur).
- **Decision 3: Server-Side Gemini Story Engine with Deterministic Fallback**
  - *Chosen Approach*: Route Forensic Director evaluations through `/api/evaluate` using `@google/genai` (`gemini-3.8-flash`) with structured JSON output (`responseSchema`), backed by deterministic forensic grading.
  - *Why*: Ensures every submission receives both rigorous SQL verification and dynamic, in-character suspect interrogation dialogue that feeds directly into the end-of-case confrontation animation.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Architecture & Component Diagram

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                        TOP BAR (3-Zone Contract Header)                          │
│  [QUERY_NOIR]           [Active Case · Case Index · Suspects · Matrix]   [Submit]│
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│                CINEMATIC CUTSCENE DIRECTOR (Stage & Case Overlays)               │
│  • Stage Intro / Finale: Detective Silas + All 5 Suspects Tier Lineup            │
│  • Case Intro: Detective Silas vs. Target Suspect(s) Crime Scene Briefing        │
│  • Case Resolution: Evidence Showdown, Suspect Breakdown & Tier Progression      │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│                     INVESTIGATION WORKSPACE (1440px Split View)                  │
│                                                                                  │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────────────┐  │
│  │ LEFT: CASE & SCHEMA DOSSIER  │  │ RIGHT: FORENSIC SQL WORKBENCH & OUTPUT   │  │
│  │                              │  │                                          │  │
│  │ • Clearance Tier & Case Nav  │  │ ┌──────────────────────────────────────┐ │  │
│  │ • Silas & Suspect Portraits  │  │ │ SQL Query Editor (JetBrains Mono)    │ │  │
│  │ • [Replay Intro / Outro]     │  │ │ [Run Query] [Reset Naive] [Hint 1-3] │ │  │
│  │ • Narrative & Objective      │  │ └──────────────────┬───────────────────┘ │  │
│  │ • Pitfall & Pass Metric      │  │                    │                     │  │
│  │ • Interactive Schema Tree    │  │ ┌──────────────────▼───────────────────┐ │  │
│  │   ├─ Tables & Columns        │  │ │ Output & Telemetry Deck              │ │  │
│  │   ├─ Composite Indexes       │  │ │ • Tab 1: Evidence Result Grid        │ │  │
│  │   └─ [Preview Sample Rows]   │  │ │ • Tab 2: EXPLAIN Plan & Cost Meter   │ │  │
│  │                              │  │ │ • Tab 3: Suspect Interrogation Log   │ │  │
│  └──────────────────────────────┘  └─┴──────────────────────────────────────┴─┘  │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
                        HTTP POST /api/query & /api/evaluate
                                         │
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│                     EXPRESS BACKEND & FORENSIC ENGINE                            │
│                                                                                  │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────────────┐  │
│  │ SQLite Case Sandbox Engine   │  │ Gemini 3.8 Flash Forensic Evaluator      │  │
│  │ • 15 Isolated Case Schemas   │  │ • System Prompt: Forensic Director       │  │
│  │ • Real Indexes & Seed Data   │  │ • Evaluates SQL + EXPLAIN Plan + Output  │  │
│  │ • EXPLAIN QUERY PLAN Parser  │  │ • Generates Suspect Persona Dialogue     │  │
│  │ • Cost & Sargability Grader  │  │ • Returns Structured JSON Verdict        │  │
│  └──────────────────────────────┘  └──────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & All 15 Cases Curriculum Specification

Each of the 15 cases contains:
1. **Metadata, Cast & Cutscene Script**:
   - Case Code (`1.1`–`3.5`), Clearance Tier, Lead Investigator (**Detective Silas**), and Participating Suspects (**Vincent Chen**, **Dolores Delgado**, **Inspector Marcus Vane**, **Veronica Sterling**, **Archivist Zero**, including dual-suspect cases like `3.1` and `3.4`).
   - Structured **Intro Cutscene Dialogue** (Silas confronting the suspect at the start of the investigation) and **Outro Resolution Dialogue** (Silas presenting the verified SQL proof and the suspect's reaction at the end of the case), plus **Stage Intro / Stage Finale scripts** for Tiers 1, 2, and 3.
2. **Relational Schema & Index DDL**: Authentic SQLite tables, realistic noir records (including edge cases like `NULL` hubs, lowercase aliases, test sensor noise, duplicate pings, ghost crates, multi-table shell chains, and composite indexes).
3. **Verification Specification**:
   - **Expected Output Query**: Reference SQL that produces the exact target evidence table.
   - **Optimization & Anti-Pattern Rules**: Inspects both the SQL query and SQLite's `EXPLAIN QUERY PLAN` output to verify required patterns and catch tier-specific anti-patterns:
     - **Tier 1 (Beat Sleuth)**:
       - *1.1 The Dirty Ledger*: `UPPER()`, `COALESCE(..., 'OFFLINE_ROUTER')`, `WHERE` filtering out dummy records; `<15ms` simulated latency.
       - *1.2 The Neon Stash*: Early `WHERE` elimination of test sensor logs before `GROUP BY`, aggregate filtering in `HAVING` (`SUM > 100000`, `COUNT > 10`).
       - *1.3 The Precinct Shakedown*: `DISTINCT` on target columns only, `ORDER BY` before `LIMIT 10`; execution cost `<50` units.
       - *1.4 The Dockside Cross*: `LEFT JOIN ... WHERE right.id IS NULL` to isolate unregistered ghost crates.
       - *1.5 The Dead-Drop Merge*: `UNION ALL` instead of expensive deduplicating `UNION` across Cluster Alpha and Beta with `MIN`/`MAX` timestamps; memory `<5MB`.
     - **Tier 2 (Syndicate Detective)**:
       - *2.1 The Launderer’s Ledger*: Non-overlapping `CASE WHEN ... THEN ... ELSE 'BENIGN' END` 3-tier classification (`CRITICAL`, `SUSPICIOUS`, `BENIGN`) with zero nulls.
       - *2.2 The Chrono-Alibi*: Native temporal math (`julianday` / `strftime` / timestamp functions) and hourly bucket aggregation (`DATE_TRUNC` / hour grouping).
       - *2.3 The Shell Network*: 4-table relational join (`seed_transfers` $\rightarrow$ `dummy_corps` $\rightarrow$ `holding_agents` $\rightarrow$ `bank_vaults`) with composite key filtering to prevent Cartesian amplification.
       - *2.4 The Black-Market Ladder*: Analytic window ranking (`ROW_NUMBER()` / `RANK()` / `DENSE_RANK() OVER (PARTITION BY sector ORDER BY amount DESC)`) filtered for top 3 per sector without correlated subqueries.
       - *2.5 The Running Escrow*: CTE + cumulative window sum (`SUM(...) OVER (PARTITION BY wallet_id ORDER BY tx_time)`) isolating the exact balance-below-zero crossover.
     - **Tier 3 (Forensic Mastermind)**:
       - *3.1 The Wiretap Gap*: `LAG()` ping interval comparison + 7-event rolling average (`AVG(...) OVER (... ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)`), isolating gaps $>3\times$ baseline.
       - *3.2 The Phantom Precinct Matrix*: `CROSS JOIN` calendar dates with officer roster + `LEFT`/`FULL OUTER JOIN` against shift logs to expose zero-activity dates without turning the outer join into an inner join.
       - *3.3 The Syndicate Funnel*: Single-pass conditional aggregation (`COUNT(CASE WHEN stage = ... END)`) by creation week cohort across all 5 laundering stages.
       - *3.4 The Watchdog Lockdown*: Refactoring the naive query (`DATE(created_at)`, `sector_id + 0`, `SELECT *`) into a SARGABLE index-seeking query matching `(sector_id, event_type, created_at)` so rows scanned drop from `15,000,000` to `<50`.
       - *3.5 The Master Nullification*: Partition-pruned CTE using `PERCENT_RANK()` or `NTILE(100)` to isolate the top 1% bandwidth anomalies and extract Archivist Zero's kill-switch code.

### Interactive Component & State Mapping
- **Cutscene State Machine (`CutsceneDirector`)**:
  - Automatically triggers the **Stage Intro Animation** when entering a new Clearance Tier for the first time, followed by the **Case Intro Animation** when opening a case.
  - Automatically triggers the **Case Resolution Animation** when a player's submitted query passes both functional and optimization verification, and chains into the **Stage Finale Animation** upon completing the 5th case of a tier (`1.5`, `2.5`, `3.5`).
  - Provides interactive step-through dialogue controls (`Next Beat`, `Skip to Workbench`, `Replay Stage Intro`, `Replay Case Intro`, `Replay Case Resolution`).
- **Case & Clearance Selector**: Switches active case, triggers the case opening animation featuring Detective Silas and the suspect(s), loads starter/saved SQL, and fetches schema + sample preview rows from `/api/case/:caseId`.
- **Run Query & Submit Evidence Handlers**: Executes SQL against `/api/execute` and `/api/evaluate`, updating the result grid, `EXPLAIN` cost meter, suspect interrogation log, and launching the end-of-case resolution animation upon success.
