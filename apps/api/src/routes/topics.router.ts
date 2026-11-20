import { Router } from 'express';
import { resolveBrand } from '../middleware/resolve-brand.js';
import crypto from 'node:crypto';
import { prisma } from '../prisma/client.js';
import { queueService } from '../services/queue.service.js';
import { topicDiscoveryService } from '../services/topic-discovery.service.js';

export const topicsRouter = Router({ mergeParams: true });
topicsRouter.use(resolveBrand);

// POST /api/v1/brands/:brandId/topics/discover
topicsRouter.post('/discover', async (req, res, next) => {
  try {
    const brandId = res.locals.brandId as string;
    const targetBacklog = Number(req.body.targetBacklog) || 25;
    const result = await topicDiscoveryService.ensureBacklog(brandId, targetBacklog);
    res.json({ message: 'Topic discovery complete', data: result });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/brands/:brandId/topics/backlog
topicsRouter.get('/backlog', async (req, res, next) => {
  try {
    const brandId = res.locals.brandId as string;
    const topics = await prisma.topic.findMany({
      where: { brandId, status: 'QUEUED' },
      include: {
        documents: {
          include: { document: true },
        },
      },
      orderBy: { priorityScore: 'desc' },
    });
    res.json({ data: topics, count: topics.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/brands/:brandId/topics
topicsRouter.get('/', async (req, res, next) => {
  try {
    const brandId = res.locals.brandId as string;
    const topics = await prisma.topic.findMany({
      where: { brandId },
      include: {
        documents: {
          include: { document: true },
        },
      },
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

