import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Public healthcheck
  if (req.path === '/health') {
    return next();
  }

  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'];

  const providedToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : apiKeyHeader;

  // In production, enforce strict authentication matching SESSION_SECRET
  if (env.NODE_ENV === 'production') {
    if (!providedToken || providedToken !== env.SESSION_SECRET) {
      return res.status(401).json({
        error: { message: 'Unauthorized. Valid Bearer token or x-api-key required.' },
      });
    }
  }

  // In development, allow with warning if no token provided
  if (!providedToken && env.NODE_ENV === 'development') {
    res.setHeader('X-Auth-Warning', 'Development mode: Unauthenticated request permitted');
  }

  next();
}
