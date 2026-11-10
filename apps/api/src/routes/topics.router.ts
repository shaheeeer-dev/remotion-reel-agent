import { Router } from 'express';
import { resolveBrand } from '../middleware/resolve-brand.js';
import crypto from 'node:crypto';
import { prisma } from '../prisma/client.js';
import { queueService } from '../services/queue.service.js';

export const topicsRouter = Router({ mergeParams: true });
topicsRouter.use(resolveBrand);

// GET /api/v1/brands/:brandId/topics
topicsRouter.get('/', async (req, res, next) => {
  try {
    const brandId = res.locals.brandId as string;
    const topics = await prisma.topic.findMany({
      where: { brandId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: topics });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/brands/:brandId/topics
topicsRouter.post('/', async (req, res, next) => {
  try {
    const brandId = res.locals.brandId as string;
    const { title, category, brief } = req.body;

    const topic = await prisma.topic.create({
      data: {
        brandId,
        title,
        category,
        brief,
      },
    });
    res.status(201).json({ data: topic });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/brands/:brandId/topics/:topicId/generate
topicsRouter.post('/:topicId/generate', async (req, res, next) => {
  try {
    const brandId = res.locals.brandId as string;
    const { topicId } = req.params as { topicId: string };
    const idempotencyKey =
      (req.headers['idempotency-key'] as string) ||
      `generate_${brandId}_${topicId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const { jobId } = await queueService.enqueueJob(
      'GENERATE_SCRIPT',
      { brandId, topicId },
      idempotencyKey
    );

    res.status(202).json({
      message: 'Script generation job enqueued',
      jobId,
      idempotencyKey,
    });
  } catch (err) {
    next(err);
  }
});

