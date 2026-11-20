import { prisma } from '../prisma/client.js';
import { env } from '../config/env.js';
import type { TopicStatus, KnowledgeSourceType } from '@prisma/client';

export interface DiscoveredTopicCandidate {
  title: string;
  category: string;
  brief: string;
  sourceType: KnowledgeSourceType;
  sourceDocumentIds: string[];
  learnopsLessonId?: string | null;
  audienceLevel: 'beginner' | 'intermediate';
  visualMetaphor:
    | 'folder_drawer'
    | 'container_stack'
    | 'comparison'
    | 'pipeline_flow'
    | 'terminal'
    | 'permissions_matrix';
  priorityScore: number; // 1-100
  semanticKey: string; // e.g. "docker:container_isolation"
  reasoning: string;
}

export class TopicDiscoveryService {
  private static readonly STOP_WORDS = new Set([
    'what', 'how', 'why', 'the', 'and', 'for', 'with', 'does', 'are', 'is', 'in', 'vs',
    'versus', 'seconds', 'quick', 'breakdown', 'learn', 'explore', 'explaining', 'explained',
    'understanding', 'understand', 'between', 'into', 'from', 'guide', 'deep', 'dive',
    'critical', 'highlight', 'demonstration', 'clear', 'without', 'about', 'that', 'they'
  ]);

  private static readonly STEMS: Record<string, string> = {
    containers: 'container', pods: 'pod', links: 'link', sockets: 'socket',
    proxies: 'proxy', filesystems: 'filesystem', permissions: 'permission',
    processes: 'process', applications: 'application', dependencies: 'dependency',
    environments: 'environment', interfaces: 'interface', adapters: 'adapter',
    machines: 'machine', volumes: 'volume', namespaces: 'namespace',
    operating: 'os', system: 'os', systems: 'os'
  };

  /**
   * Extracts normalized tokens and bigrams for semantic duplicate comparison.
   */
  private extractFeatures(text: string): { tokens: string[]; bigrams: string[] } {
    const rawTokens = text
      .toLowerCase()
      .replace(/[^a-z0-9\.\s]/g, ' ')
      .split(/\s+/)
      .map((t) => t.replace(/^\.+|\.+$/g, ''))
      .filter((t) => t.length > 1 && !TopicDiscoveryService.STOP_WORDS.has(t))
      .map((t) => TopicDiscoveryService.STEMS[t] || t);

    const bigrams: string[] = [];
    for (let i = 0; i < rawTokens.length - 1; i++) {
      bigrams.push(`${rawTokens[i]}_${rawTokens[i + 1]}`);
    }

    return { tokens: rawTokens, bigrams };
  }

  /**
   * Computes semantic similarity between two topic concepts:
   * 1. Concept containment (fraction of concise concept contained in the other).
   * 2. Bigram phrase overlap (detects shared technical phrases like "docker_container").
   * 3. Lead subject boost (detects shared primary topic entity, e.g. "docker" or "127.0.0.1").
   */
  public computeSimilarity(textA: string, textB: string): number {
    const { tokens: tokA, bigrams: biA } = this.extractFeatures(textA);
    const { tokens: tokB, bigrams: biB } = this.extractFeatures(textB);

    const setA = new Set(tokA);
    const setB = new Set(tokB);
    if (setA.size === 0 || setB.size === 0) return 0;

    let intTok = 0;
    for (const t of setA) {
      if (setB.has(t)) intTok++;
    }
    const minTok = Math.min(setA.size, setB.size);
    const tokContainment = intTok / minTok;

    const biSetB = new Set(biB);
    const biOverlap = biA.filter((b) => biSetB.has(b)).length;
    const bigramBoost = biOverlap > 0 ? 0.25 : 0.0;

    const leadA = new Set(tokA.slice(0, 2));
    const leadB = new Set(tokB.slice(0, 2));
    const leadShared = Array.from(leadA).filter((t) => leadB.has(t) && t !== 'linux' && t !== 'devops');
    const leadBoost = leadShared.length >= 1 ? 0.20 : 0.0;

    const score = 0.55 * tokContainment + bigramBoost + leadBoost;
    return Math.min(1.0, score);
  }

  /**
   * Automatically discovers and maintains a rolling backlog of 20-30 high-potential,
   * non-repetitive Reel ideas grounded strictly in verified knowledge documents.
   *
   * Invariant: The owner never has to manually prompt or suggest Reel ideas.
   */
  async ensureBacklog(
    brandId: string,
    targetBacklog = 25
  ): Promise<{ added: number; totalQueued: number; topics: any[] }> {
    console.log(`[TopicDiscovery] Checking Reel idea backlog for brand ${brandId} (target: ${targetBacklog})...`);

    // 1. Count currently queued unused topics
    const currentQueued = await prisma.topic.count({
      where: {
        brandId,
        status: { in: ['QUEUED', 'DISCOVERED'] },
      },
    });

    console.log(`[TopicDiscovery] Current active backlog: ${currentQueued} topics.`);
    if (currentQueued >= targetBacklog) {
      console.log(`[TopicDiscovery] Backlog is healthy (${currentQueued} >= ${targetBacklog}). No generation needed.`);
      const activeTopics = await prisma.topic.findMany({
        where: { brandId, status: 'QUEUED' },
        orderBy: { priorityScore: 'desc' },
        take: targetBacklog,
      });
      return { added: 0, totalQueued: currentQueued, topics: activeTopics };
    }

    const neededCount = Math.max(8, targetBacklog - currentQueued);
    console.log(`[TopicDiscovery] Backlog needs ${neededCount} new ideas. Initiating discovery engine...`);

    // 2. Fetch approved knowledge documents (both LearnOps lessons and General DevOps)
    const approvedDocs = await prisma.knowledgeDocument.findMany({
      where: { brandId, isApproved: true },
      select: {
        id: true,
        title: true,
        category: true,
        sourceType: true,
        sourcePath: true,
        lessonId: true,
        content: true,
      },
    });

    if (approvedDocs.length === 0) {
      console.warn('[TopicDiscovery] No approved knowledge documents found. Please run knowledge sync first.');
      return { added: 0, totalQueued: currentQueued, topics: [] };
    }

    // 3. Fetch all previous topics to enforce semantic anti-repetition
    const existingTopics = await prisma.topic.findMany({
      where: {
        brandId,
        status: { in: ['PUBLISHED', 'IN_PRODUCTION', 'SELECTED', 'QUEUED', 'DISCOVERED', 'REJECTED'] },
      },
      select: { id: true, title: true, brief: true, semanticKey: true, status: true },
    });

    const existingSemanticKeys = new Set(
      existingTopics.map((t) => t.semanticKey).filter(Boolean)
    );
    const existingTitlesAndBriefs = existingTopics.map((t) => `${t.title} - ${t.brief}`);

    // 4. Group documents into concise knowledge context for Gemini
    const docSummaries = approvedDocs.map((doc, idx) => {
      // First 400 chars of content for concise prompt grounding
      const excerpt = doc.content
        .replace(/#+\s+/g, '')
        .replace(/\r?\n+/g, ' ')
        .slice(0, 350);
      return `[Doc ID: ${doc.id}] [${doc.sourceType}] Category: "${doc.category}" | Title: "${doc.title}" | Lesson: ${doc.lessonId || 'None'}\nCore Facts: ${excerpt}...`;
    });

    const systemPrompt = `You are the Lead Technical Content Architect and Reel Discovery Engine for LearnOps (learnops.dev).
Your job is to discover captivating, high-retention 15-20 second Instagram Reel ideas from our verified knowledge base.

CORE DIRECTIVE & RULES:
1. GROUNDED IN KNOWLEDGE: Every idea MUST be based on the provided reference documents. Do NOT invent fictional technologies or make unverified claims.
2. SOURCE ATTRIBUTION:
   - If derived from a LearnOps course lesson (sourceType: LEARNOPS_LESSON), set sourceType to "LEARNOPS_LESSON" and cite its lessonId.
   - If derived from General DevOps references (Docker, Kubernetes, Networking, Nginx, CI/CD), set sourceType to "GENERAL_DEVOPS". NEVER claim a LearnOps interactive lab exists for topics that are General DevOps references.
3. VISUAL POTENTIAL: Every topic MUST be explainable with one of our 6 Remotion visual metaphors:
   - "folder_drawer": Linux directory hierarchies, /etc, /var, config files
   - "container_stack": Docker vs VMs, namespaces, layers, container isolation
   - "comparison": 2-way comparison (e.g. chmod vs chown, bridge vs host, tcp vs udp)
   - "pipeline_flow": CI/CD stages, DNS lookup flow, request routing
   - "terminal": Command line execution, outputs, flags, exit codes
   - "permissions_matrix": Read/write/execute (rwx), octal 755 vs 644
4. STRICT ANTI-REPETITION:
   - Do NOT generate topics that repeat or closely mirror our existing topics list.
   - Assign a unique "semanticKey" in lowercase format: "category:concept:subtopic" (e.g. "docker:networking:bridge_vs_host").
5. SCORING & AUDIENCE:
   - Rate "priorityScore" from 1 to 100 based on curiosity gap, beginner interest, and animation appeal.
   - Target audience: Junior to mid-level software and DevOps engineers.

Return a JSON array of ${neededCount} topic objects matching this schema:
[
  {
    "title": "Clear punchy title with *keywords* (e.g. 'Linux: chmod vs chown')",
    "category": "Linux|Docker|Networking|Kubernetes|Nginx|CI/CD|Shell Scripting",
    "brief": "One sentence explaining the core concept to teach.",
    "sourceType": "LEARNOPS_LESSON|GENERAL_DEVOPS",
    "sourceDocumentIds": ["matching doc ID from context"],
    "learnopsLessonId": "lesson-id or null",
    "audienceLevel": "beginner|intermediate",
    "visualMetaphor": "folder_drawer|container_stack|comparison|pipeline_flow|terminal|permissions_matrix",
    "priorityScore": 85,
    "semanticKey": "category:concept_identifier",
    "reasoning": "Why this topic is captivating for vertical video"
  }
]
Return ONLY the raw JSON array without markdown backticks.`;

    let addedCount = 0;
    const queuedTopics: any[] = [];
    let iterations = 0;
    const maxIterations = 3;

    while (currentQueued + addedCount < targetBacklog && iterations < maxIterations) {
      iterations++;
      const deficit = targetBacklog - (currentQueued + addedCount);
      // Over-provision by 2x to account for semantic deduplication filtering
      const neededCount = Math.max(6, Math.ceil(deficit * 2));
      console.log(`[TopicDiscovery] Pass ${iterations}: Deficit of ${deficit} topics. Requesting ${neededCount} candidates from Gemini...`);

      const userPrompt = `EXISTING TOPICS TO AVOID (DO NOT REPEAT):
${existingTitlesAndBriefs.slice(0, 60).map((t) => `- ${t}`).join('\n')}

VERIFIED REFERENCE DOCUMENTS:
${docSummaries.join('\n\n')}

Discover exactly ${neededCount} high-potential, diverse, non-repetitive Reel ideas across our available categories.`;

      let generatedCandidates: DiscoveredTopicCandidate[] = [];
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('GEMINI_API_KEY is not configured.');
        }

        const ai = new GoogleGenAI({ apiKey });
        const modelsToTry = [
          env.GEMINI_MODEL,
          'gemini-3.5-flash-lite',
          'gemini-3.1-flash-lite',
          'gemini-3.8-flash',
        ];
        const uniqueModels = [...new Set(modelsToTry)];

        let responseText = '';
        for (const model of uniqueModels) {
          try {
            const response = await ai.models.generateContent({
              model,
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
                },
              ],
              config: {
                temperature: 0.7,
                responseMimeType: 'application/json',
              },
            });
            responseText = response.text?.trim() || '';
            if (responseText) break;
          } catch (mErr: any) {
            console.warn(`[TopicDiscovery] Model ${model} failed: ${mErr.message}. Trying next model...`);
            const isTransient = mErr?.status === 503 || mErr?.status === 429 || mErr?.message?.includes('503') || mErr?.message?.includes('429');
            if (isTransient) {
              await new Promise((r) => setTimeout(r, 2500));
            }
          }
        }

        if (responseText) {
          // Strip markdown backticks if present
          const cleaned = responseText.replace(/^```json\s*|^```\s*|```$/g, '').trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed)) {
            generatedCandidates = parsed;
          }
        }
      } catch (err: any) {
        console.error('[TopicDiscovery] Gemini topic discovery failed:', err.message);
        break;
      }

      console.log(`[TopicDiscovery] Received ${generatedCandidates.length} candidate ideas from Gemini.`);

      // Semantic Deduplication & Database Persistence
      for (const candidate of generatedCandidates) {
        if (!candidate.title || !candidate.category || !candidate.semanticKey) continue;

        if (currentQueued + addedCount >= targetBacklog) {
          break;
        }

        // Check 1: Exact semantic key match
        if (existingSemanticKeys.has(candidate.semanticKey)) {
          console.log(`[TopicDiscovery] Skipping duplicate semantic key: ${candidate.semanticKey}`);
          continue;
        }

        // Check 2: Semantic concept similarity against all existing topics (> 0.35 is a duplicate)
        const fullText = `${candidate.title} ${candidate.brief}`;
        let isDuplicate = false;
        for (const existing of existingTitlesAndBriefs) {
          const sim = this.computeSimilarity(fullText, existing);
          if (sim > 0.35) {
            console.log(`[TopicDiscovery] Skipping semantically similar idea: "${candidate.title}" (similarity: ${(sim * 100).toFixed(0)}% with "${existing.slice(0, 40)}")`);
            isDuplicate = true;
            break;
          }
        }
        if (isDuplicate) continue;

        // Persist to database with relational join table
        try {
          const topic = await prisma.topic.create({
            data: {
              brandId,
              title: candidate.title,
              category: candidate.category,
              brief: candidate.brief,
              status: 'QUEUED',
              sourceType: candidate.sourceType === 'LEARNOPS_LESSON' ? 'LEARNOPS_LESSON' : 'GENERAL_DEVOPS',
              learnopsLessonId: candidate.learnopsLessonId || null,
              audienceLevel: candidate.audienceLevel || 'beginner',
              visualMetaphor: candidate.visualMetaphor || 'comparison',
              priorityScore: Number(candidate.priorityScore) || 75,
              semanticKey: candidate.semanticKey,
              isUsed: false,
            },
          });

          // Link to cited knowledge documents
          if (candidate.sourceDocumentIds && Array.isArray(candidate.sourceDocumentIds)) {
            for (const docId of candidate.sourceDocumentIds) {
              const docExists = approvedDocs.find((d) => d.id === docId);
              if (docExists) {
                await prisma.topicKnowledgeDocument.create({
                  data: {
                    topicId: topic.id,
                    documentId: docId,
                  },
                }).catch(() => {});
              }
            }
          }

          existingSemanticKeys.add(candidate.semanticKey);
          existingTitlesAndBriefs.push(fullText);
          queuedTopics.push(topic);
          addedCount++;
        } catch (err: any) {
          console.warn(`[TopicDiscovery] Error saving topic "${candidate.title}":`, err.message);
        }
      }
    }

    const updatedQueuedTotal = currentQueued + addedCount;
    console.log(`[TopicDiscovery] Success: Added ${addedCount} new topics to backlog. Total active queued: ${updatedQueuedTotal}.`);

    return {
      added: addedCount,
      totalQueued: updatedQueuedTotal,
      topics: queuedTopics,
    };
  }

  /**
   * Selects the next topic for production using smart diversity balancing:
   * 1. Inspects the last 3-5 published or selected reels/topics.
   * 2. Avoids back-to-back duplicate categories (e.g. no 3 Kubernetes reels in a row).
   * 3. Alternates difficulty (Beginner vs Intermediate).
   * 4. Balances between LearnOps Lessons and General DevOps references.
   * 5. Selects the highest priority score within the balanced candidate pool.
   */
  async selectNextTopicForProduction(brandId: string): Promise<any | null> {
    // 1. Fetch recent topics (last 5 in production or published)
    const recentTopics = await prisma.topic.findMany({
      where: {
        brandId,
        status: { in: ['SELECTED', 'IN_PRODUCTION', 'PUBLISHED'] },
      },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { category: true, audienceLevel: true, sourceType: true },
    });

    const recentCategories = new Set(recentTopics.slice(0, 2).map((t) => t.category));
    const lastDifficulty = recentTopics[0]?.audienceLevel || 'beginner';
    const lastSourceType = recentTopics[0]?.sourceType || 'GENERAL_DEVOPS';

    // 2. Query all queued topics
    let queued = await prisma.topic.findMany({
      where: { brandId, status: 'QUEUED', isUsed: false },
      include: {
        documents: {
          include: { document: true },
        },
      },
      orderBy: [{ priorityScore: 'desc' }, { createdAt: 'asc' }],
    });

    if (queued.length === 0) {
      await this.ensureBacklog(brandId, 25);
      queued = await prisma.topic.findMany({
        where: { brandId, status: 'QUEUED', isUsed: false },
        include: {
          documents: {
            include: { document: true },
          },
        },
        orderBy: [{ priorityScore: 'desc' }, { createdAt: 'asc' }],
      });
    }

    if (queued.length === 0) return null;

    // 3. Filter candidate pool for category diversity (avoiding immediate category repeats)
    let candidatePool = queued.filter((t) => !recentCategories.has(t.category));
    if (candidatePool.length === 0) {
      candidatePool = queued; // fallback if all queued share the same category
    }

    // 4. Prefer alternating difficulty and balanced source type
    const preferredPool = candidatePool.filter(
      (t) => t.audienceLevel !== lastDifficulty || t.sourceType !== lastSourceType
    );
    const finalPool = preferredPool.length > 0 ? preferredPool : candidatePool;

    // Pick top scored idea in balanced pool
    const selected = finalPool[0] || queued[0];

    await prisma.topic.update({
      where: { id: selected.id },
      data: { status: 'SELECTED' },
    });

    return selected;
  }
}

export const topicDiscoveryService = new TopicDiscoveryService();
