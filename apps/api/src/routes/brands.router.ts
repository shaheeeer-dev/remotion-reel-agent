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
    const {
      slug,
      displayName,
      timezone,
      audience,
      voiceTone,
      contentPillars,
      primaryColor,
      secondaryColor,
    } = req.body;
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
            primaryColor: primaryColor || '#6F41EC',
            secondaryColor: secondaryColor || '#C4B5FD',
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
    const brand = await prisma.brand.findFirst({
      where: { OR: [{ id: req.params.brandId }, { slug: req.params.brandId }] },
      include: { profile: true, socialAccounts: true },
    });
    if (!brand) return res.status(404).json({ error: { message: 'Brand not found.' } });
    res.json({ data: brand });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/brands/:brandId
brandsRouter.patch('/:brandId', async (req, res, next) => {
  try {
    const {
      slug,
      displayName,
      autoPublish,
      defaultDuration,
      primaryColor,
      secondaryColor,
      bgColor,
      audience,
      voiceTone,
      contentPillars,
      profile,
    } = req.body;

    const existing = await prisma.brand.findFirst({
      where: { OR: [{ id: req.params.brandId }, { slug: req.params.brandId }] },
      select: { id: true, slug: true },
    });
    if (!existing) return res.status(404).json({ error: { message: 'Brand not found.' } });

    // Validate sanitized slug if provided
    let newSlug: string | undefined = undefined;
    if (slug && typeof slug === 'string') {
      const sanitized = slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (sanitized && sanitized !== existing.slug) {
        // Check uniqueness
        const duplicate = await prisma.brand.findUnique({ where: { slug: sanitized } });
        if (duplicate && duplicate.id !== existing.id) {
          return res.status(409).json({ error: { message: `Brand slug "${sanitized}" is already taken.` } });
        }
        newSlug = sanitized;
      }
    }

    // Merge profile fields
    const profileData: Record<string, any> = {
      ...(profile || {}),
      ...(primaryColor ? { primaryColor } : {}),
      ...(secondaryColor ? { secondaryColor } : {}),
      ...(bgColor ? { bgColor } : {}),
      ...(audience ? { audience } : {}),
      ...(voiceTone ? { voiceTone } : {}),
      ...(contentPillars ? { contentPillars } : {}),
    };

    const brand = await prisma.brand.update({
      where: { id: existing.id },
      data: {
        ...(newSlug ? { slug: newSlug } : {}),
        ...(displayName ? { displayName } : {}),
        ...(autoPublish !== undefined ? { autoPublish: Boolean(autoPublish) } : {}),
        ...(defaultDuration !== undefined ? { defaultDuration: Number(defaultDuration) } : {}),
        ...(Object.keys(profileData).length > 0
          ? {
              profile: {
                upsert: {
                  create: {
                    audience: profileData.audience || 'Tech & developer audience',
                    voiceTone: profileData.voiceTone || 'Practical, concise, encouraging',
                    primaryColor: profileData.primaryColor || '#F29F67',
                    secondaryColor: profileData.secondaryColor || '#34B1AA',
                    bgColor: profileData.bgColor || '#1E1E2C',
                    contentPillars: profileData.contentPillars || ['Architecture', 'DevOps', 'Cloud'],
                  },
                  update: profileData,
                },
              },
            }
          : {}),
      },
      include: { profile: true },
    });
    res.json({ data: brand });
  } catch (err) {
    next(err);
  }
});

