import { Router } from 'express';
import crypto from 'node:crypto';
import { prisma } from '../prisma/client.js';
import { queueService } from '../services/queue.service.js';

export const topicsRouter = Router({ mergeParams: true });

// GET /api/v1/brands/:brandId/topics
topicsRouter.get('/', async (req, res, next) => {
  try {
    const { brandId } = req.params;
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
    const { brandId } = req.params;
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
    const { brandId, topicId } = req.params;
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

