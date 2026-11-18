import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { healthRouter } from './routes/health.router.js';
import { brandsRouter } from './routes/brands.router.js';
import { knowledgeRouter } from './routes/knowledge.router.js';
import { topicsRouter } from './routes/topics.router.js';
import { reelsRouter, brandReelsRouter } from './routes/reels.router.js';
import { jobsRouter } from './routes/jobs.router.js';
import { instagramRouter } from './routes/instagram.router.js';
import { voicesRouter } from './routes/voices.router.js';
import { requireAuth } from './middleware/auth.js';
import { env } from './config/env.js';
import { getMonorepoRoot } from './services/remotion.service.js';

// Enable BigInt serialization in JSON responses for Prisma models
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

export const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.APP_BASE_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Static serving for rendered media (Instagram and dashboard preview)
const storageDir = path.resolve(getMonorepoRoot(), env.MEDIA_STORAGE_DIR);
app.use('/media', express.static(storageDir));

// Public Routes
app.use('/health', healthRouter);

// Protected API Routes
app.use('/api/v1', requireAuth);
app.use('/api/v1/brands', brandsRouter);
app.use('/api/v1/brands/:brandId/knowledge', knowledgeRouter);
app.use('/api/v1/brands/:brandId/topics', topicsRouter);
app.use('/api/v1/brands/:brandId/reels', brandReelsRouter);
app.use('/api/v1/brands/:brandId/integrations/instagram', instagramRouter);
app.use('/api/v1/reels', reelsRouter);
app.use('/api/v1/jobs', jobsRouter);
app.use('/api/v1/voices', voicesRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Error]:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
  });
});

