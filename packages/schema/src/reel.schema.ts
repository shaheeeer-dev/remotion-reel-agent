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

export const ReelRenderInputSchema = z.object({
  reelId: z.string().optional(),
  brand: z.object({
    name: z.string().default('LearnOps'),
    primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).default('#6F41EC'),
    secondaryColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).default('#C4B5FD'),
    backgroundColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).default('#0D1117'),
    cardBackground: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).default('#161B22'),
    textColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).default('#E6EDF3'),
  }).default({
    name: 'LearnOps',
    primaryColor: '#6F41EC',
    secondaryColor: '#C4B5FD',
    backgroundColor: '#0B0F17',
    cardBackground: '#161B22',
    textColor: '#E6EDF3',
  }),
  script: ReelScriptSchema,
});

export type ReelRenderInput = z.infer<typeof ReelRenderInputSchema>;

