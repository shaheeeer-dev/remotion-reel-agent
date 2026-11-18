import path from 'node:path';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import { env as hfEnv } from '@huggingface/transformers';
import { KokoroTTS } from 'kokoro-js';
import { getMonorepoRoot } from './remotion.service.js';

export interface VoiceMeta {
  id: string;
  name: string;
  gender: 'female' | 'male';
  accent: 'American' | 'British';
  grade: string;
  description: string;
  previewUrl: string;
}

export const CURATED_KOKORO_VOICES: Omit<VoiceMeta, 'previewUrl'>[] = [
  {
    id: 'af_heart',
    name: 'Heart',
    gender: 'female',
    accent: 'American',
    grade: 'A',
    description: 'Warm, natural, and expressive. Top overall quality.',
  },
  {
    id: 'af_bella',
    name: 'Bella',
    gender: 'female',
    accent: 'American',
    grade: 'A-',
    description: 'Dynamic, clear, and confident narration.',
  },
  {
    id: 'af_nicole',
    name: 'Nicole',
    gender: 'female',
    accent: 'American',
    grade: 'B+',
    description: 'Calm, measured, and conversational tech educator.',
  },
  {
    id: 'af_sarah',
    name: 'Sarah',
    gender: 'female',
    accent: 'American',
    grade: 'B',
    description: 'Professional, articulate documentary-style tone.',
  },
  {
    id: 'am_michael',
    name: 'Michael',
    gender: 'male',
    accent: 'American',
    grade: 'B+',
    description: 'Engaging, authentic developer and tech educator.',
  },
  {
    id: 'am_adam',
    name: 'Adam',
    gender: 'male',
    accent: 'American',
    grade: 'B',
    description: 'Direct, clear, and authoritative narrator.',
  },
  {
    id: 'am_fenrir',
    name: 'Fenrir',
    gender: 'male',
    accent: 'American',
    grade: 'B',
    description: 'Deep, crisp, and resonant tech explainer.',
  },
  {
    id: 'bf_emma',
    name: 'Emma',
    gender: 'female',
    accent: 'British',
    grade: 'A-',
    description: 'Polished, articulate British academic narrator.',
  },
  {
    id: 'bm_george',
    name: 'George',
    gender: 'male',
    accent: 'British',
    grade: 'B+',
    description: 'Distinguished, authoritative British tech guide.',
  },
];

const PREVIEW_SAMPLE_TEXT = 'Welcome to LearnOps. Master Linux, Docker, and DevOps one command at a time.';

let ttsInstancePromise: Promise<KokoroTTS> | null = null;

export class VoiceService {
  private getStorageDir(): string {
    const rootDir = getMonorepoRoot();
    return path.resolve(rootDir, 'storage/media/audio/previews');
  }

  private async getTTSInstance(): Promise<KokoroTTS> {
    if (!ttsInstancePromise) {
      ttsInstancePromise = (async () => {
        const rootDir = getMonorepoRoot();
        const modelCacheDir = path.resolve(rootDir, 'storage/models/kokoro');

        hfEnv.cacheDir = modelCacheDir;
        hfEnv.useFSCache = true;
        hfEnv.allowLocalModels = true;
        hfEnv.allowRemoteModels = false; // Strictly offline

        return await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
          dtype: 'q8',
          device: 'cpu',
        });
      })();
    }
    return ttsInstancePromise;
  }

  getAvailableVoices(): VoiceMeta[] {
    return CURATED_KOKORO_VOICES.map((voice) => ({
      ...voice,
      previewUrl: `/api/v1/voices/${voice.id}/preview`,
    }));
  }

  async getPreviewFilePath(voiceId: string): Promise<string> {
    const voice = CURATED_KOKORO_VOICES.find((v) => v.id === voiceId);
    if (!voice) {
      throw new Error(`Invalid voice ID: ${voiceId}`);
    }

    const previewDir = this.getStorageDir();
    await fs.mkdir(previewDir, { recursive: true });

    const previewFilePath = path.join(previewDir, `${voiceId}.wav`);

    if (fsSync.existsSync(previewFilePath)) {
      return previewFilePath;
    }

    // Synthesize offline on CPU
    const tts = await this.getTTSInstance();
    const audio = await tts.generate(PREVIEW_SAMPLE_TEXT, { voice: voiceId as any });
    await audio.save(previewFilePath);

    return previewFilePath;
  }

  async pregenerateAllPreviews(): Promise<void> {
    const previewDir = this.getStorageDir();
    await fs.mkdir(previewDir, { recursive: true });

    const tts = await this.getTTSInstance();
    for (const voice of CURATED_KOKORO_VOICES) {
      const outPath = path.join(previewDir, `${voice.id}.wav`);
      if (!fsSync.existsSync(outPath)) {
        console.log(`[VoiceService] Pre-generating preview for voice: ${voice.name} (${voice.id})...`);
        const audio = await tts.generate(PREVIEW_SAMPLE_TEXT, { voice: voice.id as any });
        await audio.save(outPath);
      }
    }
    console.log('[VoiceService] All voice previews are ready in cache.');
  }
}

export const voiceService = new VoiceService();
