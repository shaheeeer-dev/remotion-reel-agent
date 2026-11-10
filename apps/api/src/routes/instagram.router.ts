import { Router } from 'express';
import { prisma } from '../prisma/client.js';
import { instagramService } from '../services/instagram.service.js';

export const instagramRouter = Router({ mergeParams: true });

// GET /api/v1/brands/:brandId/integrations/instagram
instagramRouter.get('/', async (req, res, next) => {
  try {
    const { brandId } = req.params;
    const account = await prisma.socialAccount.findFirst({
      where: { brandId, platform: 'INSTAGRAM' },
      select: {
        id: true,
        platform: true,
        providerUserId: true,
        accountUsername: true,
        isConnected: true,
        tokenExpiresAt: true,
        createdAt: true,
      },
    });

    if (!account) {
      return res.json({
        data: {
          isConnected: false,
          eligibility: { isEligible: false, reasons: ['No Instagram account connected'] },
        },
      });
    }

    const eligibility = await instagramService.checkEligibility(account.id);

    res.json({
      data: {
        isConnected: account.isConnected,
        account,
        eligibility,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/brands/:brandId/integrations/instagram/connect
instagramRouter.post('/connect', async (req, res, next) => {
  try {
    const { brandId } = req.params;
    const { providerUserId, accountUsername, token } = req.body;

    const account = await prisma.socialAccount.upsert({
      where: {
        brandId_platform_providerUserId: {
          brandId,
          platform: 'INSTAGRAM',
          providerUserId: providerUserId || 'act_1029384756',
        },
      },
      update: {
        isConnected: true,
        accountUsername: accountUsername || 'learnops.io',
        encryptedToken: token || 'mock_encrypted_token',
      },
      create: {
        brandId,
        platform: 'INSTAGRAM',
        providerUserId: providerUserId || 'act_1029384756',
        accountUsername: accountUsername || 'learnops.io',
        encryptedToken: token || 'mock_encrypted_token',
        isConnected: true,
      },
    });

    res.json({ message: 'Instagram account connected', data: account });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/brands/:brandId/integrations/instagram
instagramRouter.delete('/', async (req, res, next) => {
  try {
    const { brandId } = req.params;
    await prisma.socialAccount.deleteMany({
      where: { brandId, platform: 'INSTAGRAM' },
    });
    res.json({ message: 'Instagram account disconnected' });
  } catch (err) {
    next(err);
  }
});

