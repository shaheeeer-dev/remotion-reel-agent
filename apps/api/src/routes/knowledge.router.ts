import { Router } from 'express';
import { resolveBrand } from '../middleware/resolve-brand.js';
import { prisma } from '../prisma/client.js';
import { knowledgeService } from '../services/knowledge.service.js';

export const knowledgeRouter = Router({ mergeParams: true });
knowledgeRouter.use(resolveBrand);

// POST /api/v1/brands/:brandId/knowledge/sync
knowledgeRouter.post('/sync', async (req, res, next) => {
  try {
    const brandId = res.locals.brandId as string;
    const syncResult = await knowledgeService.syncAll(brandId);
    res.json({ message: 'Knowledge sync complete', data: syncResult });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/brands/:brandId/knowledge/coverage
knowledgeRouter.get('/coverage', async (req, res, next) => {
  try {
    const brandId = res.locals.brandId as string;
    const report = await knowledgeService.getKnowledgeCoverage(brandId);
    res.json({ data: report });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/brands/:brandId/knowledge
knowledgeRouter.get('/', async (req, res, next) => {
  try {
    const brandId = res.locals.brandId as string;
    const documents = await prisma.knowledgeDocument.findMany({
      where: { brandId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: documents });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/brands/:brandId/knowledge
knowledgeRouter.post('/', async (req, res, next) => {
  try {
    const brandId = res.locals.brandId as string;
    const { title, category, source, content, isApproved } = req.body;

    const doc = await prisma.knowledgeDocument.create({
      data: {
        brandId,
        title,
        category,
        source: source || 'learnops-official',
        content,
        isApproved: Boolean(isApproved),
        approvedAt: isApproved ? new Date() : null,
      },
    });
    res.status(201).json({ data: doc });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/brands/:brandId/knowledge/:documentId
knowledgeRouter.patch('/:documentId', async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { title, category, content, isApproved } = req.body;

    const doc = await prisma.knowledgeDocument.update({
      where: { id: documentId },
      data: {
        ...(title ? { title } : {}),
        ...(category ? { category } : {}),
        ...(content ? { content } : {}),
        ...(typeof isApproved === 'boolean'
          ? { isApproved, approvedAt: isApproved ? new Date() : null }
          : {}),
      },
    });
    res.json({ data: doc });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/brands/:brandId/knowledge/:documentId
knowledgeRouter.delete('/:documentId', async (req, res, next) => {
  try {
    await prisma.knowledgeDocument.delete({
      where: { id: req.params.documentId },
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

