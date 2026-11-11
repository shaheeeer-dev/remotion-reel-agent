import { GoogleGenAI } from '@google/genai';
import { ReelScriptSchema, type ReelScript } from '@learnops/schema';
import { env } from '../config/env.js';

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
You must output a single, raw JSON object strictly adhering to this structure:
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
      "subtext": "Brief teaser text"
    },
    ...
    {
      "kind": "outro",
      "durationSeconds": 2,
      "brandName": "${brandName}",
      "tagline": "Follow for daily tutorials.",
      "callToAction": "Follow"
    }
  ],
  "caption": "A concise, engaging educational Instagram caption explaining key takeaways.",
  "hashtags": ["devops", "linux", "cloud"]
}

SCENE KINDS & FLAT REQUIRED FIELDS:
- "hook": { "kind": "hook", "durationSeconds": 3, "badge": string, "headline": string, "subtext": string }
- "folder_tree": { "kind": "folder_tree", "durationSeconds": 5, "title": string, "rootPath": "/", "highlightPath": string, "tree": [{"name": string, "isDirectory": boolean, "highlight": boolean, "description": string}], "explanation": string }
- "terminal": { "kind": "terminal", "durationSeconds": 6, "title": string, "promptUser": "learner@linux:~$", "command": string, "outputLines": [string], "explanation": string }
- "container_diagram": { "kind": "container_diagram", "durationSeconds": 5, "title": string, "hostOs": "Host Linux Kernel", "containerEngine": "Docker Engine", "containers": [{"name": "app-container", "app": "Node.js API", "binsLibs": "Alpine libc + Node v20"}], "comparisonNote": string }
- "pipeline": { "kind": "pipeline", "durationSeconds": 5, "title": string, "trigger": "git push origin main", "stages": [{"name": "Build", "status": "success"}, {"name": "Test", "status": "success"}, {"name": "Deploy", "status": "success"}], "takeaway": string }
- "outro": { "kind": "outro", "durationSeconds": 2, "brandName": "${brandName}", "tagline": "Follow for daily tutorials.", "callToAction": "Follow" }

STRICT RULES:
1. ONLY return valid raw JSON. No markdown backticks, no markdown formatting, no conversational text.
2. Scene fields MUST be flat directly inside each scene object (e.g. { "kind": "hook", "badge": ... }), NEVER inside a nested "props" object.
3. The sum of scene "durationSeconds" MUST equal "durationSeconds" exactly (${targetDuration}s total). Standard breakdown: Hook (3s), Core Explanation (5s), Terminal (6s), Outro (2s).
4. Keyword Highlights: Wrap critical concepts or filenames in asterisks (e.g. *configuration*, */etc*, *Docker*) so the visual renderer emphasizes them in accent Lavender (#B28BFF).
5. Hashtags MUST be simple alphanumeric strings without "#".
6. Do NOT invent unsupported claims or fictional commands. Use verified technical specifications.
7. The content is for educational demonstration.

APPROVED BRAND KNOWLEDGE:
${knowledgeContext}
`;

    const userPrompt = `Create an educational Instagram Reel script:
Topic: "${options.topic}"
Category: "${options.category}"
Target duration: ${targetDuration} seconds`;

    const modelsToTry = [env.GEMINI_MODEL, 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];
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

        // Strict validation against versioned Zod schema
        const validated = ReelScriptSchema.parse(parsedJson);
        return validated;
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
