import { Router } from 'express';
import { prisma } from '../prisma/client.js';
import { instagramService } from '../services/instagram.service.js';
import { encryptToken, sanitizeSocialAccount } from '../utils/crypto.js';

export const instagramRouter = Router({ mergeParams: true });

// GET /api/v1/brands/:brandId/integrations/instagram
instagramRouter.get('/', async (req, res, next) => {
  try {
    const { brandId } = req.params as { brandId: string };
    const account = await prisma.socialAccount.findFirst({
      where: { brandId, platform: 'INSTAGRAM' },
    });

    if (!account) {
      return res.json({
        data: {
          isConnected: false,
          eligibility: {
            isEligible: false,
            reasons: ['No Instagram account connected for this brand.'],
          },
        },
      });
    }

    const eligibility = await instagramService.checkEligibility(account.id);

    res.json({
      data: {
        isConnected: account.isConnected,
        account: sanitizeSocialAccount(account),
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
    const { brandId } = req.params as { brandId: string };
    const { providerUserId, accountUsername, token } = req.body;

    if (!providerUserId || !token) {
      return res.status(400).json({
        error: { message: 'providerUserId and valid token are required to connect an Instagram account.' },
      });
    }

    const encryptedToken = encryptToken(token);

    const account = await prisma.socialAccount.upsert({
      where: {
        brandId_platform_providerUserId: {
          brandId,
          platform: 'INSTAGRAM',
          providerUserId,
        },
      },
      update: {
        isConnected: true,
        accountUsername: accountUsername || 'unnamed_account',
        encryptedToken,
      },
      create: {
        brandId,
        platform: 'INSTAGRAM',
        providerUserId,
        accountUsername: accountUsername || 'unnamed_account',
        encryptedToken,
        isConnected: true,
      },
    });

    res.json({
      message: 'Instagram account connected securely',
      data: sanitizeSocialAccount(account),
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/brands/:brandId/integrations/instagram
instagramRouter.delete('/', async (req, res, next) => {
  try {
    const { brandId } = req.params as { brandId: string };
    await prisma.socialAccount.deleteMany({
      where: { brandId, platform: 'INSTAGRAM' },
    });
    res.json({ message: 'Instagram account disconnected' });
  } catch (err) {
    next(err);
  }
});
