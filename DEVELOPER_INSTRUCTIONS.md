# Autonomous Reel Agent: Architecture, Developer Directives & Production Guide

## 1. The Core Automation Invariant (DO NOT VIOLATE)

> **The operator's only routine responsibility is maintaining the curriculum documentation and reference knowledge base. The system must independently discover topics, generate Reel ideas, rank them, maintain a rolling backlog, synthesize voiceovers, render motion graphics, and publish daily. The operator must never be required to manually suggest, prompt, or supervise Reel ideas.**

---

## 2. Knowledge Architecture & Two-Source Principle

The knowledge ingestion engine enforces strict separation between primary brand curriculum and general technical references to prevent technical hallucinations and false marketing claims:

### Source A — Primary Course Lessons (`sourceType: LEARNOPS_LESSON`)
* **Source of truth:** Verified course lessons (`content.md` + `metadata.json`) located in the path configured by `LEARNOPS_REPO_PATH`.
* **Integrity:** Never duplicate lesson files manually. The ingestion engine reads directly from the curriculum repository using incremental SHA-256 checksums, updating only modified documents.
* **Attribution:** Every discovered topic derived from a lesson links to its original lesson ID and slug.

### Source B — General Technical Reference Library (`sourceType: GENERAL_DEVOPS`)
* **Source of truth:** Verified reference documents in `knowledge-base/` (e.g., Docker, Kubernetes, Networking, Nginx, CI/CD, Cloud, Terraform).
* **Verification Gate:** Only documents with `is_verified: true` (or `verified: true`) and trusted official documentation URLs in their frontmatter are marked as approved (`isApproved = true`) for topic discovery and video generation. Unverified drafts are excluded.
* **Provenance & Honesty Rule:** The script and narration must NEVER claim that the platform currently offers an interactive course or lab for an industry topic unless `sourceType === LEARNOPS_LESSON`.

---

## 3. The 4 Autonomous Modules

### Module 1: Two-Source Knowledge Ingestion (`KnowledgeService`)
* Ingests both primary lessons and general reference documents incrementally.
* Skips unchanged files based on SHA-256 hashes to minimize unnecessary processing.
* Calculates comprehensive coverage metrics across all technical categories.

### Module 2: Topic Discovery & Rolling Backlog Engine (`TopicDiscoveryService`)
* Automatically maintains a rolling backlog of **20–30 high-potential, non-repetitive Reel ideas** (target: 25).
* Ranks ideas (1–100) based on curiosity gap, visual animation potential, and audience level.
* **Multi-Stage Semantic Deduplication:**
  * Exact semantic key matching.
  * Keyword token overlap thresholding.
  * Concept similarity filtering (> 0.35 similarity against previously published, currently queued, and rejected topics is rejected).
* **Auto-Replenishment:** Whenever queued topics drop below 20, the engine paginates through technical categories until the backlog reaches the target threshold.

### Module 3: Grounded Script, Natural TTS & Dynamic Motion Graphics Engine
* **Script Generation (`GeminiService`):**
  * Strictly adheres to a versioned 5-scene JSON schema: `hook`, `visual_explanation` (Scene 1), `comparison` (Scene 2), `terminal` (Scene 3), `outro` (Scene 4).
  * Implements multi-model failover (`gemini-3.5-flash-lite` $\leftrightarrow$ `gemini-3.1-flash-lite` $\leftrightarrow$ `gemini-3.8-flash`) and exponential backoff for rate limits.
* **Voiceover Synthesis (`TtsService`):**
  * Synthesizes speech using local Kokoro TTS at natural human cadence (`1.0x`–`1.02x`).
  * Enforces a natural **`0.35s` hold** between speech completion and scene transitions.
  * Provides word-level timestamps ensuring subtitles start immediately at `0:00` with zero lag or clipping.
* **Dynamic Topic-Specific Visual Metaphors (`packages/renderer`):**
  * **Rule: Zero identical middle components across topics.**
  * **Docker & Containers:** Hook renders an **Image Layer Recipe Stack** (`container_stack`); Scene 1 renders a **Dashed Isolated Workload Sandbox** (`ISOLATED WORKLOAD • CGROUPS & NAMESPACES` enclosing `▶ RUNNING PROCESS (PID 1)` and private namespaces).
  * **CI/CD & DevOps:** Hook renders a **Developer-to-Automation Node Flow** (`pipeline_flow`); Scene 1 renders a **Horizontal 3-Stage Pipeline** (`CODE` $\to$ `BUILD` $\to$ `TEST`) with horizontal progress wires and telemetry.
  * **Nginx & Networking:** Hook renders a **Network Flow Topology** (`network_flow`: Client IP $\to$ TCP Bridge $\to$ Upstream Proxy); Scene 1 renders a **Traffic Flow Ingress Conduit**.
  * **Linux Filesystem:** Hook renders sliding drawer cards (`folder_drawer`); Scene 1 renders an authentic **Linux Filesystem Tree Explorer** with `tree -p`, directory branch guide lines (`├──`, `└──`), Unix permission strings (`drwxr-xr-x`), and VFS telemetry.
  * **Linux Permissions & Security:** Hook renders an **Octal 755 3-Column Grid** (`permissions_matrix`); Scene 2 renders a **2-Column Split Scope Comparison**.
  * **Terminal Demonstrations:** Authentic dark terminal window with syntax-highlighted commands and live typing.
* **Unified Visual Design System:**
  * Contained within the upper 80% (1536px) safe area; bottom 20% (384px) kept clear of critical text for platform UI overlays.
  * Zero emojis in scene rendering; Lucide SVG icons only.

### Module 4: Cloud Media Storage, Meta Graph API Publishing & Scheduler
* **Public Video Delivery (`CloudinaryService`):**
  * Automatically uploads rendered MP4 files to Cloudinary for reliable, public HTTPS delivery (`https://res.cloudinary.com/...`).
  * Operates well within the 25 GB monthly free allowance (1 Reel $\approx$ 1.5 MB).
* **Instagram Graph API (`InstagramService`):**
  * Executes the 3-step Meta Container Flow:
    1. Create media container (`media_type: 'REELS'`).
    2. Poll status until `FINISHED`.
    3. Publish container (`media_publish`).
* **Autonomous Scheduling (`GitHub Actions` / `SchedulerService`):**
  * Scheduled for **14:00 (2:00 PM) Asia/Karachi (09:00 UTC)** daily.
  * Implements idempotency keys (`daily:<brandId>:<YYYY-MM-DD>`) to prevent duplicate posting.
  * Runs headlessly via GitHub Actions (`.github/workflows/daily-reel.yml`) on free cloud runners.
