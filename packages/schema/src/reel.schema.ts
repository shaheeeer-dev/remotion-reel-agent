import { z } from 'zod';
import { SceneSchema } from './scene.schema.js';
import { VIDEO_CONFIG } from './constants.js';

export const ReelScriptSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  topic: z.string().min(5).max(120),
  hook: z.string().min(5).max(150),
  durationSeconds: z.number().min(VIDEO_CONFIG.MIN_DURATION_SECONDS).max(VIDEO_CONFIG.MAX_DURATION_SECONDS),
  narrationText: z.string().nullable().optional(),
  scenes: z.array(SceneSchema).min(2).max(8),
  caption: z.string().min(10).max(1000),
  hashtags: z.array(z.string().regex(/^[A-Za-z0-9_]+$/)).min(1).max(15),
}).refine(
  (data) => {
    const totalScenesDuration = data.scenes.reduce((acc, scene) => acc + scene.durationSeconds, 0);
    return Math.abs(totalScenesDuration - data.durationSeconds) <= 1;
  },
  {
    message: 'The sum of all scene durations must match the total durationSeconds (within 1s tolerance).',
    path: ['durationSeconds'],
  }
);

export type ReelScript = z.infer<typeof ReelScriptSchema>;

export const SceneAudioSchema = z.object({
  sceneIndex: z.number().int().min(0),
  audioPath: z.string().optional(),
  audioUrl: z.string().optional(),
  audioDataUri: z.string().optional(),
  durationSeconds: z.number().positive().optional(),
});

export type SceneAudio = z.infer<typeof SceneAudioSchema>;

export const MasterAudioSchema = z.object({
  audioPath: z.string().optional(),
  audioUrl: z.string().optional(),
  audioDataUri: z.string().optional(),
  durationSeconds: z.number().positive().optional(),
});

export type MasterAudio = z.infer<typeof MasterAudioSchema>;

export const ReelRenderInputSchema = z.object({
  reelId: z.string().optional(),
  brand: z.object({
    name: z.string().default('Brand'),
    primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/),
    secondaryColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/),
    backgroundColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/),
    cardBackground: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).optional(),
    textColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).optional(),
    mutedTextColor: z.string().optional(),
    fontFamily: z.string().optional(),
    creatorCredit: z.string().url().optional(),
    tagline: z.string().optional(),
    callToAction: z.string().optional(),
  }),
  script: ReelScriptSchema,
  masterAudio: MasterAudioSchema.optional(),
  sceneAudios: z.array(SceneAudioSchema).optional(),
});

export type ReelRenderInput = z.infer<typeof ReelRenderInputSchema>;

