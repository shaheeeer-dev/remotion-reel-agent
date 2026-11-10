import { Router } from 'express';
import { prisma } from '../prisma/client.js';

export const jobsRouter = Router();

// GET /api/v1/jobs/:jobId
jobsRouter.get('/:jobId', async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.jobRun.findFirst({
      where: {
        OR: [{ id: jobId }, { idempotencyKey: jobId }, { bullMqJobId: jobId }],
      },
      include: { brand: true, reel: true },
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ data: job });
  } catch (err) {
    next(err);
  }
});

