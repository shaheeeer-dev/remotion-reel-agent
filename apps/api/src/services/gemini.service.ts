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

    const brandName = options.brandName || 'LearnOps';
    const brandTone = options.brandTone || 'Clear, technical, authoritative, encouraging';
    const brandAudience = options.brandAudience || 'Beginner to intermediate Linux & DevOps learners';

    const knowledgeContext = options.approvedKnowledge.length > 0
      ? options.approvedKnowledge.map((k) => `### ${k.title}\n${k.content}`).join('\n\n')
      : 'No specific approved documents provided; use only verified, standard technical facts.';

    const targetDuration = options.targetDurationSeconds || 16;

    const systemPrompt = `You are an expert technical curriculum designer and social video manager for "${brandName}".
Brand Voice & Tone: ${brandTone}
Target Audience: ${brandAudience}

STRICT GENERATION CONTRACT:
1. ONLY return valid raw JSON adhering exactly to the requested schema. No markdown formatting, backticks, or commentary.
2. The total video duration must be between 15 and 18 seconds (target: ${targetDuration}s).
3. The sum of all scene durations MUST equal durationSeconds exactly.
4. Allowlisted scene kinds ONLY:
   - "hook" (duration: 2-3s, props: badge, headline, subtext)
   - "folder_tree" (duration: 4-6s, props: title, rootPath, highlightPath, tree: [{name, isDirectory, description}], explanation)
   - "terminal" (duration: 4-5s, props: title, command, outputLines: string[], explanation)
   - "container_diagram" (duration: 5-7s, props: title, hostOs, containerEngine, containers: [{name, app, binsLibs}], comparisonNote)
   - "pipeline" (duration: 5-7s, props: title, trigger, stages: [{name, status, details}], takeaway)
   - "outro" (duration: 2-3s, props: brandName: "${brandName}", tagline, callToAction)
5. Do NOT invent unsupported claims or fictional commands. Use verified technical specifications.
6. The content is for educational demonstration.

APPROVED BRAND KNOWLEDGE:
${knowledgeContext}
`;

    const userPrompt = `Create an educational Instagram Reel script:
Topic: "${options.topic}"
Category: "${options.category}"
Target duration: ${targetDuration} seconds`;

    try {
      dailyRequestsCount++;
      const response = await this.ai.models.generateContent({
        model: env.GEMINI_MODEL,
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
        throw new Error('Gemini returned an empty response.');
      }

      const parsedJson = JSON.parse(responseText.trim());

      // Strict validation against versioned Zod schema
      const validated = ReelScriptSchema.parse(parsedJson);
      return validated;
    } catch (err: any) {
      console.error('[GeminiService] Script generation failed:', err?.message || err);
      throw new Error(`Gemini script generation failed: ${err?.message || 'Unknown provider error'}`);
    }
  }
}

export const geminiService = new GeminiService();
