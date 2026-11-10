import { Router } from 'express';
import { prisma } from '../prisma/client.js';

export const brandsRouter = Router();

// GET /api/v1/brands
brandsRouter.get('/', async (req, res, next) => {
  try {
    const brands = await prisma.brand.findMany({
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: brands });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/brands
brandsRouter.post('/', async (req, res, next) => {
  try {
    const { slug, displayName, timezone, audience, voiceTone, contentPillars, primaryColor } = req.body;
    const brand = await prisma.brand.create({
      data: {
        slug,
        displayName,
        timezone: timezone || 'UTC',
        profile: {
          create: {
            audience: audience || 'Early-career software and DevOps engineers',
            voiceTone: voiceTone || 'Clear, technical, authoritative, encouraging',
            contentPillars: contentPillars || ['Linux', 'Docker', 'CI/CD', 'Kubernetes'],
            primaryColor: primaryColor || '#FF6B00',
          },
        },
      },
      include: { profile: true },
    });
    res.status(201).json({ data: brand });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/brands/:brandId
brandsRouter.get('/:brandId', async (req, res, next) => {
  try {
    const brand = await prisma.brand.findUniqueOrThrow({
      where: { id: req.params.brandId },
      include: { profile: true, socialAccounts: true },
    });
    res.json({ data: brand });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/brands/:brandId
brandsRouter.patch('/:brandId', async (req, res, next) => {
  try {
    const { displayName, autoPublish, defaultDuration, profile } = req.body;
    const brand = await prisma.brand.update({
      where: { id: req.params.brandId },
      data: {
        displayName,
        autoPublish,
        defaultDuration,
        ...(profile ? { profile: { update: profile } } : {}),
      },
      include: { profile: true },
    });
    res.json({ data: brand });
  } catch (err) {
    next(err);
  }
});

