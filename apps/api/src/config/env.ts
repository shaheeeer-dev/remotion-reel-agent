import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '../../.env' });
dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().default(4000),
  APP_BASE_URL: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/reel_agent_db?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  SESSION_SECRET: z.string().default('local-dev-secret-must-be-changed-in-production'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),
  GEMINI_MAX_REQUESTS_PER_DAY: z.coerce.number().default(100),
  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  META_GRAPH_API_VERSION: z.string().default('v21.0'),
  META_IG_USER_ID: z.string().optional(),
  META_ACCESS_TOKEN: z.string().optional(),
  PUBLIC_MEDIA_BASE_URL: z.string().default('http://localhost:4000/media'),
  MEDIA_STORAGE_DIR: z.string().default('./storage/media'),
  MEDIA_RETENTION_DAYS: z.coerce.number().default(30),
  SCHEDULER_TIMEZONE: z.string().default('UTC'),
  DAILY_PUBLISH_TIME: z.string().default('14:00'),
  WORKER_CONCURRENCY: z.coerce.number().default(2),
  MAX_RENDER_SECONDS: z.coerce.number().default(180),
});

export const env = EnvSchema.parse(process.env);

