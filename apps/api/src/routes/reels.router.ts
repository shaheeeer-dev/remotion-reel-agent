import { Router } from 'express';
import crypto from 'node:crypto';
import { prisma } from '../prisma/client.js';
import { queueService } from '../services/queue.service.js';
import { REEL_STATUS } from '@learnops/schema';
import { resolveBrand } from '../middleware/resolve-brand.js';

export const reelsRouter = Router();

// GET /api/v1/brands/:brandId/reels
export const brandReelsRouter = Router({ mergeParams: true });
brandReelsRouter.use(resolveBrand);
brandReelsRouter.get('/', async (req, res, next) => {
  try {
    const brandId = res.locals.brandId as string;
    const { status } = req.query;

    const reels = await prisma.reel.findMany({
      where: {
        brandId,
        ...(status ? { status: String(status) } : {}),
      },
      include: {
        mediaAssets: true,
        publishAttempts: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: reels });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/reels/:reelId
reelsRouter.get('/:reelId', async (req, res, next) => {
  try {
    const reel = await prisma.reel.findUniqueOrThrow({
      where: { id: req.params.reelId },
      include: {
        scenes: { orderBy: { sequence: 'asc' } },
        mediaAssets: true,
        publishAttempts: true,
        topic: true,
        brand: true,
      },
    });
    res.json({ data: reel });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/reels/:reelId
reelsRouter.patch('/:reelId', async (req, res, next) => {
  try {
    const { title, hook, caption, hashtags, scriptJson } = req.body;
    const reel = await prisma.reel.update({
      where: { id: req.params.reelId },
      data: {
        ...(title ? { title } : {}),
        ...(hook ? { hook } : {}),
        ...(caption ? { caption } : {}),
        ...(hashtags ? { hashtags } : {}),
        ...(scriptJson ? { scriptJson } : {}),
      },
    });
    res.json({ data: reel });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/reels/:reelId/render
reelsRouter.post('/:reelId/render', async (req, res, next) => {
  try {
    const { reelId } = req.params;
    const idempotencyKey =
      (req.headers['idempotency-key'] as string) ||
      `render_${reelId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const { jobId } = await queueService.enqueueJob('RENDER_VIDEO', { reelId }, idempotencyKey);
    res.status(202).json({
      message: 'Video rendering job enqueued',
      jobId,
      idempotencyKey,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/reels/:reelId/approve
reelsRouter.post('/:reelId/approve', async (req, res, next) => {
  try {
    const current = await prisma.reel.findUniqueOrThrow({
      where: { id: req.params.reelId },
      include: { mediaAssets: true },
    });
    if (current.status !== REEL_STATUS.NEEDS_REVIEW || current.mediaAssets.length === 0) {
      return res.status(409).json({
        error: { message: 'Only a rendered Reel awaiting review can be approved.' },
      });
    }

    const reel = await prisma.reel.update({
      where: { id: req.params.reelId },
      data: { status: REEL_STATUS.APPROVED },
    });
    res.json({ message: 'Reel approved for publishing', data: reel });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/reels/:reelId/publish
reelsRouter.post('/:reelId/publish', async (req, res, next) => {
  try {
    const { reelId } = req.params;
    const reel = await prisma.reel.findUniqueOrThrow({ where: { id: reelId } });
    if (reel.status !== REEL_STATUS.APPROVED && reel.status !== REEL_STATUS.SCHEDULED) {
      return res.status(409).json({ error: { message: 'Approve the rendered Reel before publishing.' } });
    }

    const idempotencyKey =
      (req.headers['idempotency-key'] as string) ||
      `publish_${reelId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const { jobId } = await queueService.enqueueJob('PUBLISH_REEL', { reelId }, idempotencyKey);
    res.status(202).json({
      message: 'Publishing job enqueued',
      jobId,
      idempotencyKey,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/reels/:reelId/retry
reelsRouter.post('/:reelId/retry', async (req, res, next) => {
  try {
    const { reelId } = req.params;
    const reel = await prisma.reel.findUniqueOrThrow({
      where: { id: reelId },
      include: { mediaAssets: true },
    });

    const idempotencyKey = `retry_${reelId}_${Date.now()}`;
    // If it failed at render or publish, re-enqueue appropriate step
    const targetJob = reel.mediaAssets.length > 0 ? 'PUBLISH_REEL' : 'RENDER_VIDEO';
    const { jobId } = await queueService.enqueueJob(targetJob, { reelId }, idempotencyKey);

    res.json({ message: `Retrying via ${targetJob}`, jobId, idempotencyKey });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/reels/:reelId/cancel
reelsRouter.post('/:reelId/cancel', async (req, res, next) => {
  try {
    const reel = await prisma.reel.update({
      where: { id: req.params.reelId },
      data: { status: REEL_STATUS.CANCELLED },
    });
    res.json({ message: 'Reel cancelled', data: reel });
  } catch (err) {
    next(err);
  }
});

