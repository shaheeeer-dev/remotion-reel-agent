import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

function hasValidAdminToken(req: Request): boolean {
  const authorization = req.headers.authorization;
  const provided = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : req.headers['x-api-key'];

  if (typeof provided !== 'string' || !env.API_ADMIN_TOKEN) return false;

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(env.API_ADMIN_TOKEN);
  return providedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/health') return next();

  if (env.NODE_ENV === 'production') {
    if (!env.API_ADMIN_TOKEN) {
      return res.status(503).json({
        error: { message: 'API_ADMIN_TOKEN must be configured before production API access is enabled.' },
      });
    }

    if (!hasValidAdminToken(req)) {
      return res.status(401).json({ error: { message: 'Unauthorized.' } });
    }

    return next();
  }

  if (!hasValidAdminToken(req)) {
    res.setHeader('X-Auth-Warning', 'Development mode: unauthenticated request permitted');
  }
  next();
}
