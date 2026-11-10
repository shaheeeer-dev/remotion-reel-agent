import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client.js';

export async function resolveBrand(req: Request, res: Response, next: NextFunction) {
  try {
    const identifier = req.params.brandId;
    if (!identifier) {
      return res.status(400).json({ error: { message: 'Brand ID or slug is required.' } });
    }

    const brand = await prisma.brand.findFirst({
      where: { OR: [{ id: identifier }, { slug: identifier }] },
      select: { id: true },
    });

    if (!brand) {
      return res.status(404).json({ error: { message: 'Brand not found.' } });
    }

    res.locals.brandId = brand.id;
    next();
  } catch (err) {
    next(err);
  }
}
