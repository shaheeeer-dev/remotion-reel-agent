import path from 'node:path';
import fs from 'node:fs/promises';
import type { Scene, SceneAudio } from '@learnops/schema';
import { getMonorepoRoot } from './remotion.service.js';
import { getSharedTTSInstance, CURATED_KOKORO_VOICES } from './voice.service.js';

export function cleanTextForSpeech(text: string): string {
  return text
    // Remove markdown bold / italic formatting
    .replace(/[*_~]{1,3}(.*?)[*_~]{1,3}/g, '$1')
    // Remove inline code backticks
    .replace(/`([^`]+)`/g, '$1')
    // Remove markdown links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Convert common technical paths like /etc or /var so TTS reads naturally
    .replace(/(?<=\s|^)\/([a-zA-Z0-9_-]+)/g, 'slash $1')
    // Strip standalone markdown hashes, bullets, brackets
    .replace(/[#><|]/g, ' ')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Trims leading and trailing silence from Kokoro RawAudio so narration
 * begins promptly and fits cleanly within the allocated scene slot.
 */
export function trimSilence(audio: { audio: Float32Array; sampling_rate: number }, padMs = 40): void {
  const samples = audio.audio;
  const threshold = 0.005;
  let start = 0;
  while (start < samples.length && Math.abs(samples[start]) < threshold) {
    start++;
  }
  let end = samples.length - 1;
  while (end > start && Math.abs(samples[end]) < threshold) {
    end--;
  }

  const padSamples = Math.round((padMs / 1000) * audio.sampling_rate);
  const startPadded = Math.max(0, start - padSamples);
  const endPadded = Math.min(samples.length, end + padSamples);

  audio.audio = samples.subarray(startPadded, endPadded);
}

export class TtsService {
  private validVoiceIds = new Set(CURATED_KOKORO_VOICES.map((v) => v.id));

  private resolveVoiceId(voiceId?: string): string {
    if (voiceId && this.validVoiceIds.has(voiceId)) {
      return voiceId;
    }
    return 'af_heart'; // High quality default
  }

  async synthesizeReelAudio(
    reelId: string,
    scenes: Scene[],
    voiceId?: string
  ): Promise<SceneAudio[]> {
    const selectedVoice = this.resolveVoiceId(voiceId);
    const rootDir = getMonorepoRoot();
    const audioDir = path.resolve(rootDir, 'storage/media/audio/reels', reelId);
    await fs.mkdir(audioDir, { recursive: true });

    const tts = await getSharedTTSInstance();
    const sceneAudios: SceneAudio[] = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const rawText = scene.voiceover?.trim();
      if (!rawText) {
        continue;
      }

      const cleanText = cleanTextForSpeech(rawText);
      if (!cleanText) {
        continue;
      }

      const slotSeconds = scene.durationSeconds;
      // Target speech duration: reserve comfortable cushion so speech finishes cleanly before scene cut
      const targetDuration = Math.max(0.8, slotSeconds - 0.35);

      console.log(`[TtsService] Synthesizing Scene ${i} ("${selectedVoice}", slot: ${slotSeconds}s): "${cleanText}"`);

      // Initial synthesis at normal speed (1.0)
      let speed = 1.0;
      let audio = await tts.generate(cleanText, {
        voice: selectedVoice as any,
        speed,
      });
      trimSilence(audio);

      let durationSeconds = audio.audio.length / audio.sampling_rate;

      // If speech duration exceeds slot target cushion, dynamically adjust speed to fit
      if (durationSeconds > targetDuration) {
        const neededSpeed = (durationSeconds / targetDuration) * 1.05; // 5% extra margin
        speed = Math.min(1.5, Math.max(1.05, Number(neededSpeed.toFixed(2))));

        console.log(
          `[TtsService] Scene ${i} audio duration (${durationSeconds.toFixed(2)}s) exceeds target (${targetDuration.toFixed(2)}s). ` +
          `Pacing with ${speed}x speed to fit cleanly in slot.`
        );

        audio = await tts.generate(cleanText, {
          voice: selectedVoice as any,
          speed,
        });
        trimSilence(audio);
        durationSeconds = audio.audio.length / audio.sampling_rate;

        // If still over slot duration, try one more adjustment step up to 1.6x
        if (durationSeconds > slotSeconds - 0.15 && speed < 1.6) {
          speed = Math.min(1.6, Number((speed * (durationSeconds / (slotSeconds - 0.25))).toFixed(2)));
          console.log(`[TtsService] Fine-tuning Scene ${i} pacing to ${speed}x.`);
          audio = await tts.generate(cleanText, {
            voice: selectedVoice as any,
            speed,
          });
          trimSilence(audio);
          durationSeconds = audio.audio.length / audio.sampling_rate;
        }
      }

      // Hard safety guard: guarantee audio ends within slotSeconds by fading out last 50ms if necessary
      const maxAllowedSamples = Math.floor((slotSeconds - 0.05) * audio.sampling_rate);
      if (audio.audio.length > maxAllowedSamples) {
        const fadeSamples = Math.round(0.05 * audio.sampling_rate);
        const clamped = audio.audio.subarray(0, maxAllowedSamples);
        const fadeStart = maxAllowedSamples - fadeSamples;
        for (let s = fadeStart; s < maxAllowedSamples; s++) {
          const factor = (maxAllowedSamples - s) / fadeSamples;
          clamped[s] *= factor;
        }
        audio.audio = clamped;
        durationSeconds = audio.audio.length / audio.sampling_rate;
      }

      const outPath = path.join(audioDir, `scene_${i}.wav`);
      await audio.save(outPath);

      const fileBuffer = await fs.readFile(outPath);
      const audioDataUri = `data:audio/wav;base64,${fileBuffer.toString('base64')}`;
      const audioUrl = `/media/audio/reels/${reelId}/scene_${i}.wav`;

      const sceneAudio: SceneAudio = {
        sceneIndex: i,
        audioPath: outPath,
        audioUrl,
        audioDataUri,
        durationSeconds: Number(durationSeconds.toFixed(2)),
      };

      sceneAudios.push(sceneAudio);
      console.log(
        `[TtsService] Scene ${i} voiceover ready: ${durationSeconds.toFixed(2)}s / ${slotSeconds}s slot (cushion: ${(slotSeconds - durationSeconds).toFixed(2)}s)`
      );
    }

    return sceneAudios;
  }
}

export const ttsService = new TtsService();
