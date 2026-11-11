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
  const outroFrames = RENDER_FPS;
  const contentFrames = totalFrames - outroFrames;
  const framesPerContentScene = Math.floor(contentFrames / 4);
  const extraContentFrames = contentFrames % 4;
  const frameCounts = Array.from({ length: 4 }, (_, index) => framesPerContentScene + (index < extraContentFrames ? 1 : 0));
  frameCounts.push(outroFrames);

  return {
    ...script,
    durationSeconds: totalFrames / RENDER_FPS,
    scenes: script.scenes.map((scene, index) => ({
      ...scene,
      durationSeconds: frameCounts[index] / RENDER_FPS,
    })) as ReelScript['scenes'],
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
    approvedKnowledge: Array<{ title: string; content: string }>;
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

    const knowledgeContext = options.approvedKnowledge.length > 0
      ? options.approvedKnowledge.map((k) => `### ${k.title}\n${k.content}`).join('\n\n')
      : 'No specific approved documents provided; use only verified, standard technical facts.';

    const targetDuration = options.targetDurationSeconds || 16;

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
  "scenes": [
    {
      "kind": "hook",
      "durationSeconds": 3,
      "badge": "CATEGORY OR TOPIC BADGE",
      "headline": "Main Punchy Title",
      "subtext": "Brief teaser text",
      "visualMetaphor": "folder_drawer"
    },
    {
      "kind": "folder_tree",
      "durationSeconds": 4,
      "title": "Directory Anatomy",
      "rootPath": "/",
      "highlightPath": "/etc",
      "tree": [{"name": "etc", "isDirectory": true, "highlight": true, "description": "System configuration"}],
      "explanation": "Machine-wide settings"
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
      "takeaway": "Different folders, different scope"
    },
    {
      "kind": "terminal",
      "durationSeconds": 4,
      "title": "Inspect Files",
      "promptUser": "learner@linux:~$",
      "command": "ls /etc",
      "outputLines": ["hosts", "fstab", "ssh/"],
      "explanation": "Real config files"
    },
    {
      "kind": "outro",
      "durationSeconds": 1,
      "brandName": "${brandName}",
      "tagline": "Follow for daily tutorials.",
      "callToAction": "Follow"
    }
  ],
  "caption": "A concise, engaging educational Instagram caption explaining key takeaways.",
  "hashtags": ["devops", "linux", "cloud"]
}

CRITICAL RULES:
- Return exactly one raw JSON object with all top-level fields: schemaVersion, topic, hook, durationSeconds, scenes, caption, hashtags.
- Return exactly five scenes, in this order: hook, one visual explanation, comparison, terminal example, outro.
- The visual explanation must use exactly one relevant kind: folder_tree, container_diagram, or pipeline.
- Set hook.visualMetaphor to the best topic-specific option: folder_drawer for Linux, container_stack for Docker, or pipeline_flow for CI/CD.
- Put every scene field directly on its scene object. Never nest fields under "props".
- Do not include Markdown backticks or conversational text. Return only valid raw JSON.

SCENE KINDS & FLAT REQUIRED FIELDS:
- "hook": { "kind": "hook", "durationSeconds": 3, "badge": string, "headline": string, "subtext": string, "visualMetaphor": "folder_drawer|container_stack|pipeline_flow" }
- "folder_tree": { "kind": "folder_tree", "durationSeconds": 4, "title": string, "rootPath": "/", "highlightPath": string, "tree": [{"name": string, "isDirectory": boolean, "highlight": boolean, "description": string}], "explanation": string }
- "terminal": { "kind": "terminal", "durationSeconds": 4, "title": string, "promptUser": "learner@linux:~$", "command": string, "outputLines": [string], "explanation": string }
- "container_diagram": { "kind": "container_diagram", "durationSeconds": 4, "title": string, "hostOs": "Host Linux Kernel", "containerEngine": "Docker Engine", "containers": [{"name": "app-container", "app": "Node.js API", "binsLibs": "Alpine libc + Node v20"}], "comparisonNote": string }
- "pipeline": { "kind": "pipeline", "durationSeconds": 4, "title": string, "trigger": "git push origin main", "stages": [{"name": "Build", "status": "success"}, {"name": "Test", "status": "success"}, {"name": "Deploy", "status": "success"}], "takeaway": string }
- "comparison": { "kind": "comparison", "durationSeconds": 4, "title": string, "leftLabel": string, "leftTitle": string, "leftDescription": string, "leftIcon": "server|user|layers|box|git-branch|rocket|file-text|settings", "rightLabel": string, "rightTitle": string, "rightDescription": string, "rightIcon": "server|user|layers|box|git-branch|rocket|file-text|settings", "takeaway": string }
- "outro": { "kind": "outro", "durationSeconds": 1, "brandName": "${brandName}", "tagline": "Follow for daily tutorials.", "callToAction": "Follow" }

RULES:
1. Keyword Highlights: Wrap only short, important terms in asterisks (e.g. *Docker*, *container*) so the renderer emphasizes them.
2. Hashtags MUST be simple alphanumeric strings without "#".
3. Do NOT invent unsupported claims or fictional commands. Use verified technical specifications.
4. Keep terminal commands short (40 characters or fewer), safe, and relevant.

APPROVED BRAND KNOWLEDGE:
${knowledgeContext}
`;

    const userPrompt = `Create an educational Instagram Reel script:
Topic: "${options.topic}"
Category: "${options.category}"
Target duration: ${targetDuration} seconds`;

    const modelsToTry = [
      env.GEMINI_MODEL,
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-3.5-flash-lite',
    ];
    const uniqueModels = [...new Set(modelsToTry)];

    let lastError: any = null;

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
        console.warn(`[GeminiService] Model ${model} generation attempt failed:`, err?.message || err);
        // Continue to fallback model
      }
    }

    console.error('[GeminiService] All Gemini model generation attempts exhausted:', lastError?.message || lastError);
    throw new Error(`Gemini script generation failed: ${lastError?.message || 'Unknown provider error'}`);
  }
}

export const geminiService = new GeminiService();
