import path from 'node:path';
import fs from 'node:fs/promises';
import type { Scene, SceneAudio, MasterAudio } from '@learnops/schema';
import { deriveSubtitleChunks } from '@learnops/schema';
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

/**
 * Writes a standard 16-bit mono PCM WAV file Buffer from a Float32Array.
 */
export function createWavBuffer(samples: Float32Array, sampleRate = 24000): Buffer {
  const numChannels = 1;
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Write PCM samples with soft clipping
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const pcm = s < 0 ? s * 0x8000 : s * 0x7fff;
    buffer.writeInt16LE(Math.round(pcm), offset);
    offset += 2;
  }

  return buffer;
}

export class TtsService {
  private validVoiceIds = new Set(CURATED_KOKORO_VOICES.map((v) => v.id));

  private resolveVoiceId(voiceId?: string): string {
    if (voiceId && this.validVoiceIds.has(voiceId)) {
      return voiceId;
    }
    return 'af_heart'; // High quality default
  }

  /**
   * Synthesizes audio for each scene in the reel, pacing speech naturally (1.0x - 1.05x),
   * preserving natural breath pauses, and compositing a master audio track with exact
   * scene alignment and natural stays between scenes.
   */
  async synthesizeReelAudio(
    reelId: string,
    scenes: Scene[],
    voiceId?: string
  ): Promise<{ sceneAudios: SceneAudio[]; masterAudio: MasterAudio }> {
    const selectedVoice = this.resolveVoiceId(voiceId);
    const rootDir = getMonorepoRoot();
    const audioDir = path.resolve(rootDir, 'storage/media/audio/reels', reelId);
    await fs.mkdir(audioDir, { recursive: true });

    const tts = await getSharedTTSInstance();
    const sceneAudios: SceneAudio[] = [];
    const sceneRawAudios: (Float32Array | null)[] = [];
    const sampleRate = 24000;

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      const rawText = scene.voiceover?.trim();
      if (!rawText) {
        sceneRawAudios.push(null);
        continue;
      }

      const cleanText = cleanTextForSpeech(rawText);
      if (!cleanText) {
        sceneRawAudios.push(null);
        continue;
      }

      const slotSeconds = scene.durationSeconds;
      // Target speech duration: reserve natural breathing room (~0.4s to 0.7s) before next scene starts
      const targetDuration = Math.max(1.0, slotSeconds - 0.45);

      console.log(
        `[TtsService] Synthesizing Scene ${i} [${scene.kind}] ("${selectedVoice}", slot: ${slotSeconds}s, target: ${targetDuration.toFixed(2)}s): "${cleanText}"`
      );

      // Initial synthesis at natural, relaxed conversational speed (1.0x)
      let speed = 1.0;
      let audio = await tts.generate(cleanText, {
        voice: selectedVoice as any,
        speed,
      });
      trimSilence(audio);

      let durationSeconds = audio.audio.length / audio.sampling_rate;

      // If speech duration exceeds target cushion, subtly adjust speed to fit comfortably
      if (durationSeconds > targetDuration) {
        const neededSpeed = (durationSeconds / targetDuration) * 1.02;
        // Cap speed at 1.15x max so the narrator never sounds rushed
        speed = Math.min(1.15, Math.max(1.0, Number(neededSpeed.toFixed(2))));

        console.log(
          `[TtsService] Scene ${i} speech duration (${durationSeconds.toFixed(2)}s) exceeds target (${targetDuration.toFixed(2)}s). ` +
          `Refining speed to ${speed}x for natural stay before transition.`
        );

        audio = await tts.generate(cleanText, {
          voice: selectedVoice as any,
          speed,
        });
        trimSilence(audio);
        durationSeconds = audio.audio.length / audio.sampling_rate;
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
      sceneRawAudios.push(audio.audio);

      // Generate exact subtitle chunks calibrated to actual speech duration
      const fps = 30;
      scene.subtitles = deriveSubtitleChunks(cleanText, durationSeconds, fps);

      // Natural pause between scenes: ~0.35s (matches 0.33s-0.40s in benchmark reel)
      // For outro, ensure at least 2.0s total so brand call-to-action is comfortably legible
      const isOutro = scene.kind === 'outro';
      const naturalStay = isOutro ? 0.25 : 0.35;
      const sceneVisualDuration = isOutro
        ? Math.max(2.0, Number((durationSeconds + naturalStay).toFixed(2)))
        : Number((durationSeconds + naturalStay).toFixed(2));

      scene.durationSeconds = sceneVisualDuration;

      console.log(
        `[TtsService] Scene ${i} voiceover ready: ${durationSeconds.toFixed(2)}s speech -> ${sceneVisualDuration}s visual (snappy stay: ${naturalStay}s)`
      );
    }

    // Composite master audio track with exact scene alignment and natural stays
    const totalDurationSeconds = scenes.reduce((sum, s) => sum + s.durationSeconds, 0);
    const totalSamples = Math.ceil(totalDurationSeconds * sampleRate);
    const masterSamples = new Float32Array(totalSamples);

    let sceneStartSec = 0;
    for (let i = 0; i < scenes.length; i++) {
      const startSample = Math.round(sceneStartSec * sampleRate);
      const samples = sceneRawAudios[i];
      if (samples) {
        const copyLen = Math.min(samples.length, totalSamples - startSample);
        masterSamples.set(samples.subarray(0, copyLen), startSample);
      }
      sceneStartSec += scenes[i].durationSeconds;
    }

    const masterWavBuffer = createWavBuffer(masterSamples, sampleRate);
    const masterOutPath = path.join(audioDir, 'master.wav');
    await fs.writeFile(masterOutPath, masterWavBuffer);

    const masterAudioDataUri = `data:audio/wav;base64,${masterWavBuffer.toString('base64')}`;
    const masterAudioUrl = `/media/audio/reels/${reelId}/master.wav`;

    console.log(
      `[TtsService] Master scene-aligned audio ready: ${totalDurationSeconds.toFixed(2)}s across ${scenes.length} scenes.`
    );

    const masterAudio: MasterAudio = {
      audioPath: masterOutPath,
      audioUrl: masterAudioUrl,
      audioDataUri: masterAudioDataUri,
      durationSeconds: Number(totalDurationSeconds.toFixed(2)),
    };

    return { sceneAudios, masterAudio };
  }

  /**
   * Legacy wrapper for backward compatibility.
   */
  async synthesizeStoryAudio(
    reelId: string,
    storyText: string,
    targetDurationSeconds: number,
    voiceId?: string
  ): Promise<MasterAudio> {
    const selectedVoice = this.resolveVoiceId(voiceId);
    const rootDir = getMonorepoRoot();
    const audioDir = path.resolve(rootDir, 'storage/media/audio/reels', reelId);
    await fs.mkdir(audioDir, { recursive: true });

    const cleanText = cleanTextForSpeech(storyText);
    if (!cleanText) {
      throw new Error(`Cannot synthesize voiceover: story text is empty.`);
    }

    const tts = await getSharedTTSInstance();
    const audio = await tts.generate(cleanText, {
      voice: selectedVoice as any,
      speed: 1.0,
    });
    trimSilence(audio);

    const durationSeconds = audio.audio.length / audio.sampling_rate;
    const outPath = path.join(audioDir, 'master.wav');
    await audio.save(outPath);

    const fileBuffer = await fs.readFile(outPath);
    const audioDataUri = `data:audio/wav;base64,${fileBuffer.toString('base64')}`;
    const audioUrl = `/media/audio/reels/${reelId}/master.wav`;

    return {
      audioPath: outPath,
      audioUrl,
      audioDataUri,
      durationSeconds: Number(durationSeconds.toFixed(2)),
    };
  }
}

export const ttsService = new TtsService();
