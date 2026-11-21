import { GoogleGenAI } from '@google/genai';
import { ReelScriptSchema, type ReelScript } from '@learnops/schema';
import { env } from '../config/env.js';

const RENDER_FPS = 30;

function normalizeSceneDurations(script: ReelScript, targetDurationSeconds: number): ReelScript {
  const [hook, visual, comparison, terminal, outro] = script.scenes;
  const visualKinds = new Set(['folder_tree', 'container_diagram', 'pipeline']);

  if (
    script.scenes.length !== 5 ||
    hook?.kind !== 'hook' ||
    !visual || !visualKinds.has(visual.kind) ||
    comparison?.kind !== 'comparison' ||
    terminal?.kind !== 'terminal' ||
    outro?.kind !== 'outro'
  ) {
    throw new Error('The reel must contain, in order: hook, one visual explanation, comparison, terminal example, and outro.');
  }

  const totalFrames = Math.round(targetDurationSeconds * RENDER_FPS);
  // Allocate 2.5 seconds for outro when target >= 18s so brand CTA comfortably fits
  const outroDurationSeconds = targetDurationSeconds >= 18 ? 2.5 : targetDurationSeconds >= 14 ? 2 : 1.5;
  const outroFrames = Math.round(outroDurationSeconds * RENDER_FPS);
  const contentFrames = totalFrames - outroFrames;
  const framesPerContentScene = Math.floor(contentFrames / 4);
  const extraContentFrames = contentFrames % 4;
  const frameCounts = Array.from({ length: 4 }, (_, index) => framesPerContentScene + (index < extraContentFrames ? 1 : 0));
  frameCounts.push(outroFrames);

  const normalizedScenes = script.scenes.map((scene, index) => {
    const durSec = frameCounts[index] / RENDER_FPS;
    const maxWords = Math.floor(durSec * 2.5);

    // Clean and sanitize voiceover for TTS
    let voiceover = scene.voiceover;
    if (!voiceover || typeof voiceover !== 'string' || !voiceover.trim()) {
      // Fallback voiceover derived from visual content
      if (scene.kind === 'hook') {
        voiceover = `${scene.headline}. ${scene.subtext || ''}`;
      } else if (scene.kind === 'folder_tree') {
        voiceover = `${scene.title}. ${scene.explanation}`;
      } else if (scene.kind === 'container_diagram') {
        voiceover = `${scene.title}. ${scene.comparisonNote || ''}`;
      } else if (scene.kind === 'pipeline') {
        voiceover = `${scene.title}. ${scene.takeaway}`;
      } else if (scene.kind === 'comparison') {
        voiceover = scene.takeaway;
      } else if (scene.kind === 'terminal') {
        voiceover = scene.explanation;
      } else if (scene.kind === 'outro') {
        voiceover = scene.tagline || 'Follow for daily tutorials.';
      }
    }

    // Strip asterisks, code backticks, brackets, and markdown noise
    voiceover = (voiceover || '')
      .replace(/\*+/g, '')
      .replace(/`+/g, '')
      .replace(/[\[\]{}()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Word budget enforcement: ensure speech fits comfortably without cutting off mid-clause
    const words = voiceover.split(' ').filter(Boolean);
    if (words.length > maxWords) {
      const sliced = words.slice(0, maxWords);
      // Remove trailing prepositions/conjunctions that leave broken phrases
      while (
        sliced.length > 3 &&
        /^(and|or|using|with|the|a|an|of|for|in|on|at|to|from|by|that|this|which)$/i.test(
          sliced[sliced.length - 1].replace(/[^a-zA-Z]/g, '')
        )
      ) {
        sliced.pop();
      }
      voiceover = sliced.join(' ');
      if (!/[.?!]$/.test(voiceover)) voiceover += '.';
    }

    return {
      ...scene,
      durationSeconds: durSec,
      voiceover,
    };
  }) as ReelScript['scenes'];

  return {
    ...script,
    durationSeconds: totalFrames / RENDER_FPS,
    narrationText: normalizedScenes.map((s) => s.voiceover).filter(Boolean).join(' '),
    scenes: normalizedScenes,
  };
}

let dailyRequestsCount = 0;
let lastResetDate = new Date().toDateString();

function checkDailyQuota() {
  const today = new Date().toDateString();
  if (today !== lastResetDate) {
    dailyRequestsCount = 0;
    lastResetDate = today;
  }

  if (dailyRequestsCount >= env.GEMINI_MAX_REQUESTS_PER_DAY) {
    throw new Error(
      `Gemini daily free-tier safety cap reached (${env.GEMINI_MAX_REQUESTS_PER_DAY} requests/day). Generation deferred to avoid quota exhaustion.`
    );
  }
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    }
  }

  async generateReelScript(options: {
    topic: string;
    category: string;
    brandName?: string;
    brandTone?: string;
    brandAudience?: string;
    targetDurationSeconds?: number;
    approvedKnowledge?: Array<{ title: string; content: string }>;
  }): Promise<ReelScript> {
    checkDailyQuota();

    if (!this.ai) {
      throw new Error(
        'GEMINI_API_KEY is not configured in the host environment. A valid Gemini API key is required to generate educational Reel scripts.'
      );
    }

    const brandName = options.brandName || 'Brand';
    const brandTone = options.brandTone || 'Clear, technical, authoritative, encouraging';
    const brandAudience = options.brandAudience || 'Beginner to intermediate Linux & DevOps learners';

    const knowledgeContext = options.approvedKnowledge && options.approvedKnowledge.length > 0
      ? options.approvedKnowledge.map((k) => `### ${k.title}\n${k.content}`).join('\n\n')
      : 'No specific approved documents provided; use only verified, standard technical facts.';

    const targetDuration = options.targetDurationSeconds || 20;

    const systemPrompt = `You are an expert technical curriculum designer and social video manager for "${brandName}".
Brand Voice & Tone: ${brandTone}
Target Audience: ${brandAudience}

STRICT JSON OUTPUT CONTRACT:
You must output a single, raw JSON object strictly adhering to this exact structure:
{
  "schemaVersion": 1,
  "topic": "${options.topic}",
  "hook": "A short, engaging hook sentence questioning or introducing the concept (max 120 chars)",
  "durationSeconds": ${targetDuration},
  "narrationText": "Have you ever opened the etc directory in Linux and wondered what actually lives inside? Think of it as the control center, holding configuration files for every host service. From your nginx configs to user passwords, every setting is editable text. Follow ${brandName} for daily tutorials!",
  "scenes": [
    {
      "kind": "hook",
      "durationSeconds": 3,
      "badge": "CATEGORY OR TOPIC BADGE",
      "headline": "Main Punchy Title",
      "subtext": "Brief teaser text",
      "visualMetaphor": "folder_drawer",
      "voiceover": "Have you ever opened the etc directory in Linux and wondered what lives inside?"
    },
    {
      "kind": "folder_tree",
      "durationSeconds": 4,
      "title": "Directory Anatomy",
      "rootPath": "/",
      "highlightPath": "/etc",
      "tree": [{"name": "etc", "isDirectory": true, "highlight": true, "description": "System configuration"}],
      "explanation": "Machine-wide settings",
      "voiceover": "Think of it as the control center, holding configuration files for every host service."
    },
    {
      "kind": "comparison",
      "durationSeconds": 4,
      "title": "Scope Distinction",
      "leftLabel": "SYSTEM",
      "leftTitle": "The Machine",
      "leftDescription": "All users & services",
      "leftIcon": "server",
      "rightLabel": "USER",
      "rightTitle": "One User",
      "rightDescription": "Personal settings",
      "rightIcon": "user",
      "takeaway": "Different folders, different scope",
      "voiceover": "Unlike personal user configs, etc manages system-wide daemon and server settings."
    },
    {
      "kind": "terminal",
      "durationSeconds": 4,
      "title": "Inspect Files",
      "promptUser": "learner@linux:~$",
      "command": "ls /etc",
      "outputLines": ["hosts", "fstab", "ssh/"],
      "explanation": "Real config files",
      "voiceover": "From your nginx configs to user passwords, every setting is editable plain text."
    },
    {
      "kind": "outro",
      "durationSeconds": 2,
      "brandName": "${brandName}",
      "tagline": "Follow for daily tutorials.",
      "callToAction": "Follow",
      "voiceover": "Follow ${brandName} for daily DevOps tutorials!"
    }
  ],
  "caption": "A concise, engaging educational Instagram caption explaining key takeaways.",
  "hashtags": ["devops", "linux", "cloud"]
}

CRITICAL RULES:
- Return exactly one raw JSON object with all top-level fields: schemaVersion, topic, hook, durationSeconds, narrationText, scenes, caption, hashtags.
- Return exactly five scenes, in this order: hook, one visual explanation, comparison, terminal example, outro.
- The visual explanation must use exactly one relevant kind: folder_tree, container_diagram, or pipeline.
- Set hook.visualMetaphor to the best topic-specific option:
  * "permissions_matrix" for Linux permissions, chmod, chown, users, groups, security
  * "container_stack" for Docker, containers, images, volumes
  * "git_graph" for Git, GitHub, commits, branching, PRs, version control
  * "network_flow" for Networking, DNS, IP addresses, ports, HTTP, sockets
  * "pipeline_flow" for CI/CD workflows, automated build/test/deploy
  * "folder_drawer" for Linux filesystem, /etc, directories, configuration files
- Put every scene field directly on its scene object. Never nest fields under "props".
- Do not include Markdown backticks or conversational text. Return only valid raw JSON.

SCENE KINDS & FLAT REQUIRED FIELDS:
- "hook": { "kind": "hook", "durationSeconds": 3, "badge": string, "headline": string, "subtext": string, "visualMetaphor": "folder_drawer|container_stack|pipeline_flow|permissions_matrix|git_graph|network_flow", "voiceover": string }
- "folder_tree": { "kind": "folder_tree", "durationSeconds": 4, "title": string, "rootPath": "/", "highlightPath": string, "tree": [{"name": string, "isDirectory": boolean, "highlight": boolean, "description": string}], "explanation": string, "voiceover": string }
- "terminal": { "kind": "terminal", "durationSeconds": 4, "title": string, "promptUser": "learner@linux:~$", "command": string, "outputLines": [string], "explanation": string, "voiceover": string }
- "container_diagram": { "kind": "container_diagram", "durationSeconds": 4, "title": string, "hostOs": "Host Linux Kernel", "containerEngine": "Docker Engine", "containers": [{"name": "app-container", "app": "Node.js API", "binsLibs": "Alpine libc + Node v20"}], "comparisonNote": string, "voiceover": string }
- "pipeline": { "kind": "pipeline", "durationSeconds": 4, "title": string, "trigger": "git push origin main", "stages": [{"name": "Build", "status": "success"}, {"name": "Test", "status": "success"}, {"name": "Deploy", "status": "success"}], "takeaway": string, "voiceover": string }
- "comparison": { "kind": "comparison", "durationSeconds": 4, "title": string, "leftLabel": string, "leftTitle": string, "leftDescription": string, "leftIcon": "server|user|layers|box|git-branch|rocket|file-text|settings", "rightLabel": string, "rightTitle": string, "rightDescription": string, "rightIcon": "server|user|layers|box|git-branch|rocket|file-text|settings", "takeaway": string, "voiceover": string }
- "outro": { "kind": "outro", "durationSeconds": 2, "brandName": "${brandName}", "tagline": "Follow for daily tutorials.", "callToAction": "Follow", "voiceover": string }

RULES:
1. Keyword Highlights: Wrap only short, important terms in asterisks (e.g. *Docker*, *container*) so the visual renderer emphasizes them.
2. Hashtags MUST be simple alphanumeric strings without "#".
3. Do NOT invent unsupported claims or fictional commands. Use verified technical specifications.
4. Keep terminal commands short (40 characters or fewer), safe, and relevant.
5. CONTINUOUS STORY NARRATION (CRITICAL):
   - You MUST provide "narrationText" at the top level: a single, uninterrupted, high-energy spoken monologue that explains the concept in the form of a story from second 0 to the very end of the video.
   - THE NARRATOR MUST KEEP TALKING. Do NOT quit after 4 words or leave dead air.
   - Story Structure:
     * Hook: Start with a curiosity gap, common mistake, or relatable question.
     * Analogy/Metaphor: Give the viewer an immediate intuitive anchor ("Think of it as...").
     * Real-world Context: Connect how it actually works in real DevOps / Linux systems.
     * The Key Insight: Reveal the core takeaway that makes them feel smarter.
     * Call to Action: Seamless outro prompt to follow.
   - Natural Pacing & Word Budget (~2.2 - 2.4 words/second at natural conversational cadence):
     * Target Duration: 18 to 22 seconds (Nominal: 20 seconds).
     * Total Spoken Monologue: 46 to 52 words TOTAL across the entire monologue.
     * Each scene's "voiceover" field MUST be a complete, standalone thought or sentence that ends cleanly with punctuation:
       - Scene 0 (Hook): 8 to 10 words (curiosity question or relatable challenge).
       - Scene 1 (Visual Metaphor): 10 to 12 words (explaining the mental model or architecture).
       - Scene 2 (Comparison): 10 to 12 words (distinguishing key differences or common pitfall).
       - Scene 3 (Terminal Example): 10 to 12 words (practical command usage and concrete takeaway).
       - Scene 4 (Outro): 6 to 8 words (clear call to action: "Follow LearnOps for daily DevOps tutorials!").
     * CRITICAL: NEVER end a scene voiceover on a dangling conjunction or preposition (e.g. "using.", "and.", "with."). Each scene must stand alone grammatically.
   - PURE SPOKEN TEXT:
     * Write purely for natural human speech with natural commas for breath pauses.
     * Do NOT use asterisks, backticks, emojis, code tags, or slashes in "voiceover" or "narrationText". Write pronounceable words (e.g. "slash etc", "nginx", "nano").

APPROVED BRAND KNOWLEDGE:
${knowledgeContext}
`;

    const userPrompt = `Create an educational Instagram Reel script:
Topic: "${options.topic}"
Category: "${options.category}"
Target duration: ${targetDuration} seconds`;

    const modelsToTry = [
      env.GEMINI_MODEL,
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
    ];
    const uniqueModels = [...new Set(modelsToTry)];

    let lastError: any = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      for (const model of uniqueModels) {
        try {
          dailyRequestsCount++;
          const response = await this.ai.models.generateContent({
            model,
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
            ],
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          const responseText = response.text || '';
          if (!responseText.trim()) {
            throw new Error(`Gemini model ${model} returned an empty response.`);
          }

          const parsedJson = JSON.parse(responseText.trim());

          // Defensive hydration if model missed top-level keys
          if (!parsedJson.topic) parsedJson.topic = options.topic;
          if (!parsedJson.hook) parsedJson.hook = parsedJson.scenes?.[0]?.headline || options.topic;
          if (!parsedJson.durationSeconds) parsedJson.durationSeconds = targetDuration;
          if (!parsedJson.caption) parsedJson.caption = `${options.topic} - Educational explainer.`;
          if (!parsedJson.hashtags || !Array.isArray(parsedJson.hashtags) || parsedJson.hashtags.length === 0) {
            parsedJson.hashtags = ['devops', 'linux', 'cloud'];
          }

          // Strict validation against versioned Zod schema
          const validated = ReelScriptSchema.parse(parsedJson);
          const paced = normalizeSceneDurations(validated, targetDuration);
          return ReelScriptSchema.parse(paced);
        } catch (err: any) {
          lastError = err;
          const isTransient = err?.status === 503 || err?.status === 429 || err?.message?.includes('503') || err?.message?.includes('429') || err?.message?.includes('high demand');
          console.warn(`[GeminiService] [Attempt ${attempt}] Model ${model} generation attempt failed:`, err?.message || err);
          if (isTransient) {
            console.log(`[GeminiService] Transient demand spike detected. Backing off 2.5s before next attempt...`);
            await new Promise((resolve) => setTimeout(resolve, 2500));
          }
        }
      }

      if (attempt < maxRetries) {
        console.log(`[GeminiService] Retrying script generation pass ${attempt + 1}/${maxRetries} after 3s delay...`);
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    console.error('[GeminiService] All Gemini model generation attempts exhausted:', lastError?.message || lastError);
    throw new Error(`Gemini script generation failed: ${lastError?.message || 'Unknown provider error'}`);
  }
}

export const geminiService = new GeminiService();
