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
  /**
   * Normalizes text for semantic duplicate comparison.
   */
  private normalizeForComparison(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !['what', 'how', 'why', 'the', 'and', 'for', 'with', 'does'].includes(w));
  }

  /**
   * Computes Jaccard word-overlap similarity between two topics.
   */
  private computeSimilarity(textA: string, textB: string): number {
    const setA = new Set(this.normalizeForComparison(textA));
    const setB = new Set(this.normalizeForComparison(textB));
    if (setA.size === 0 || setB.size === 0) return 0;

    let intersection = 0;
    for (const w of setA) {
      if (setB.has(w)) intersection++;
    }
    const union = new Set([...setA, ...setB]).size;
    return intersection / union;
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

    const userPrompt = `EXISTING TOPICS TO AVOID (DO NOT REPEAT):
${existingTitlesAndBriefs.slice(0, 40).map((t) => `- ${t}`).join('\n')}

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
        'gemini-3.5-flash',
        'gemini-3.1-flash-lite',
        'gemini-2.5-flash-lite',
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
      return { added: 0, totalQueued: currentQueued, topics: [] };
    }

    // 5. Semantic Deduplication & Database Persistence
    let addedCount = 0;
    const queuedTopics: any[] = [];

    for (const candidate of generatedCandidates) {
      if (!candidate.title || !candidate.category || !candidate.semanticKey) continue;

      // Check 1: Exact semantic key match
      if (existingSemanticKeys.has(candidate.semanticKey)) {
        console.log(`[TopicDiscovery] Skipping duplicate semantic key: ${candidate.semanticKey}`);
        continue;
      }

      // Check 2: Word-overlap semantic similarity against all existing topics (> 0.55 is a duplicate)
      const fullText = `${candidate.title} ${candidate.brief}`;
      let isDuplicate = false;
      for (const existing of existingTitlesAndBriefs) {
        const sim = this.computeSimilarity(fullText, existing);
        if (sim > 0.55) {
          console.log(`[TopicDiscovery] Skipping semantically similar idea: "${candidate.title}" (similarity: ${(sim * 100).toFixed(0)}% with "${existing.slice(0, 40)}")`);
          isDuplicate = true;
          break;
        }
      }
      if (isDuplicate) continue;

      // 6. Persist to database with relational join table
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

    const updatedQueuedTotal = currentQueued + addedCount;
    console.log(`[TopicDiscovery] Success: Added ${addedCount} new topics to backlog. Total active queued: ${updatedQueuedTotal}.`);

    return {
      added: addedCount,
      totalQueued: updatedQueuedTotal,
      topics: queuedTopics,
    };
  }

  /**
   * Selects the highest-priority unused topic for daily reel production.
   * Promotes the topic status to 'SELECTED'.
   */
  async selectNextTopicForProduction(brandId: string): Promise<any | null> {
    const topic = await prisma.topic.findFirst({
      where: {
        brandId,
        status: 'QUEUED',
        isUsed: false,
      },
      include: {
        documents: {
          include: { document: true },
        },
      },
      orderBy: [
        { priorityScore: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    if (!topic) {
      // Trigger backlog refresh if empty
      await this.ensureBacklog(brandId, 25);
      return prisma.topic.findFirst({
        where: { brandId, status: 'QUEUED', isUsed: false },
        include: { documents: { include: { document: true } } },
        orderBy: [{ priorityScore: 'desc' }, { createdAt: 'asc' }],
      });
    }

    await prisma.topic.update({
      where: { id: topic.id },
      data: { status: 'SELECTED' },
    });

    return topic;
  }
}

export const topicDiscoveryService = new TopicDiscoveryService();
