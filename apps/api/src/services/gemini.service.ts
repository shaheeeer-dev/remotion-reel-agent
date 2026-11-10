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
      `Gemini daily free-tier safety cap reached (${env.GEMINI_MAX_REQUESTS_PER_DAY} requests/day). Halting generation to avoid quota exhaustion or unexpected costs.`
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
    targetDurationSeconds?: number;
    approvedKnowledge: Array<{ title: string; content: string }>;
  }): Promise<ReelScript> {
    checkDailyQuota();

    if (!this.ai) {
      console.warn('⚠️ GEMINI_API_KEY is not configured. Returning deterministic fallback script for topic:', options.topic);
      return this.generateDeterministicFallback(options.topic, options.category, options.targetDurationSeconds || 16);
    }

    const knowledgeContext = options.approvedKnowledge.length > 0
      ? options.approvedKnowledge.map((k) => `### ${k.title}\n${k.content}`).join('\n\n')
      : 'No specific approved documents provided; use verified Linux and DevOps facts only.';

    const systemPrompt = `You are an expert social media content creator and DevOps instructor for LearnOps.
Your goal is to generate high-retention, educational Instagram Reels scripts for developers studying Linux, Docker, and DevOps.

STRICT RULES:
1. ONLY return valid raw JSON adhering exactly to the requested schema. Do NOT wrap in markdown backticks or commentary.
2. The video duration must be between 15 and 18 seconds (default: ${options.targetDurationSeconds || 16}s).
3. The sum of all scene durations must strictly equal the total durationSeconds.
4. ONLY use the following allowlisted scene kinds:
   - "hook" (duration: 2-3s, props: badge, headline, subtext)
   - "folder_tree" (duration: 4-6s, props: title, rootPath, highlightPath, tree: [{name, isDirectory, description}], explanation)
   - "terminal" (duration: 4-5s, props: title, command, outputLines: string[], explanation)
   - "container_diagram" (duration: 5-7s, props: title, hostOs, containerEngine, containers: [{name, app, binsLibs}], comparisonNote)
   - "pipeline" (duration: 5-7s, props: title, trigger, stages: [{name, status, details}], takeaway)
   - "outro" (duration: 2-3s, props: brandName: "LearnOps", tagline, callToAction)
5. NEVER invent false LearnOps product claims. Use ONLY the approved facts below.

APPROVED KNOWLEDGE:
${knowledgeContext}
`;

    const userPrompt = `Generate an Instagram Reel script for:
Topic: "${options.topic}"
Category: "${options.category}"
Target duration: ${options.targetDurationSeconds || 16} seconds`;

    try {
      dailyRequestsCount++;
      const response = await this.ai.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text || '';
      const parsedJson = JSON.parse(responseText.trim());

      // Strict validation against versioned Zod schema
      const validated = ReelScriptSchema.parse(parsedJson);
      return validated;
    } catch (err: any) {
      console.error('Gemini generation error:', err?.message || err);
      // Fallback gracefully without breaking pipeline
      return this.generateDeterministicFallback(options.topic, options.category, options.targetDurationSeconds || 16);
    }
  }

  private generateDeterministicFallback(topic: string, category: string, durationSeconds: number): ReelScript {
    return {
      schemaVersion: 1,
      topic,
      hook: `Why every DevOps engineer must understand ${topic}`,
      durationSeconds: 16,
      narrationText: null,
      scenes: [
        {
          kind: 'hook',
          durationSeconds: 3,
          badge: category.toUpperCase(),
          headline: `Understanding ${topic}`,
          subtext: 'The key concepts explained visually in seconds.',
        },
        {
          kind: 'terminal',
          durationSeconds: 5,
          title: 'bash — terminal demo',
          command: `learnops status --inspect ${category.toLowerCase()}`,
          outputLines: [
            `Inspecting ${topic}...`,
            'Status: Active & Verified',
            'Architecture: Native Linux / POSIX standard',
          ],
          explanation: 'Inspecting running processes and configurations in real time.',
        },
        {
          kind: 'pipeline',
          durationSeconds: 5,
          title: 'Automation Workflow',
          trigger: 'git push origin main',
          stages: [
            { name: '1. Validation', status: 'success', details: 'Config syntax OK' },
            { name: '2. Execution', status: 'running', details: 'Applying changes' },
            { name: '3. Verify', status: 'pending', details: 'Healthcheck 200' },
          ],
          takeaway: 'Repeatable, code-driven infrastructure.',
        },
        {
          kind: 'outro',
          durationSeconds: 3,
          brandName: 'LearnOps',
          tagline: 'Master Linux & DevOps step by step',
          callToAction: 'Follow @learnops for daily reels',
        },
      ],
      caption: `Quick breakdown of ${topic} for developers. #LearnOps #${category}`,
      hashtags: ['DevOps', 'Linux', 'Engineering', 'LearnOps'],
    };
  }
}

export const geminiService = new GeminiService();

