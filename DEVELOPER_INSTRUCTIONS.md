# LearnOps Autonomous Reel Agent: Developer Instructions & Core Directives

## 1. The Core Automation Invariant (DO NOT VIOLATE)

> **The owner's only routine responsibility is maintaining the LearnOps course content and the General DevOps knowledge base. The system must independently discover topics, generate Reel ideas, rank them, maintain the backlog, and select content for daily production. The owner must never be required to manually suggest or prompt Reel ideas.**

---

## 2. Knowledge Architecture & Two-Source Principle

The knowledge base is divided into two distinct sources:

### Source A — LearnOps Course Lessons (`sourceType: LEARNOPS_LESSON`)
- **Source of truth:** The actual course content (`content.md` + `metadata.json`) in `/Users/shaheer/Code/Web Dev/LearnOps/backend/lessons`.
- **Integrity:** Never duplicate lesson files manually. The ingestion engine reads directly from the LearnOps repository using incremental SHA-256 checksums.
- **Attribution:** Every discovered topic derived from a lesson links to `learnopsLessonId` and its original lesson slug.

### Source B — General DevOps Reference Library (`sourceType: GENERAL_DEVOPS`)
- **Source of truth:** Verified reference documents in `knowledge-base/devops/` (Docker, Kubernetes, Networking, Nginx, CI/CD, AWS, Monitoring, Terraform).
- **Verification Gate:** Only documents with `is_verified: true` in frontmatter are approved (`isApproved = true`) for topic discovery and reel generation.
- **Honesty Rule:** The system must NEVER claim that LearnOps currently offers a course or interactive lab for a topic unless `sourceType === LEARNOPS_LESSON`.

---

## 3. The 4 Autonomous Modules

1. **Knowledge Ingestion (`knowledgeService`):**
   - Ingests LearnOps lessons and General DevOps references.
   - Skips unchanged files based on SHA-256 hashes.
   - Computes Knowledge Coverage metrics.

2. **Topic Discovery & Rolling Backlog Engine (`topicDiscoveryService`):**
   - Monitors the active queue (`status: QUEUED`).
   - Automatically maintains a rolling backlog of **20–30 high-potential, non-repetitive Reel ideas**.
   - Scores ideas (1–100) based on curiosity gap, visual animation potential, and beginner interest.
   - Enforces semantic deduplication against previously published, currently queued, and rejected topics.
   - Links topics to documents via the relational join table `TopicKnowledgeDocument`.

3. **Reel Production Pipeline (Kokoro TTS + Remotion):**
   - Selects the highest-priority unused topic from the backlog.
   - Synthesizes speech with Kokoro at natural cadence (`1.0x`–`1.02x`, capped at `1.15x`).
   - Maintains a snappy **`0.35s` natural stay** between scene speech and visual cuts.
   - Renders word-by-word highlighted subtitles starting instantly at `0:00` and ending on the exact spoken syllable.

4. **Publishing & Scheduling Engine:**
   - Daily automated job selects the top `QUEUED` topic, renders the video, and schedules/publishes it.
