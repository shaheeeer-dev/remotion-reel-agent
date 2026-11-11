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

// GET /api/v1/brands/:brandId/analytics
brandsRouter.get('/:brandId/analytics', async (req, res, next) => {
  try {
    const brand = await prisma.brand.findFirst({
      where: { OR: [{ id: req.params.brandId }, { slug: req.params.brandId }] },
      include: { profile: true },
    });
    if (!brand) return res.status(404).json({ error: { message: 'Brand not found.' } });

    const [reels, topics, docs, jobs] = await Promise.all([
      prisma.reel.findMany({
        where: { brandId: brand.id },
        include: {
          mediaAssets: { orderBy: { createdAt: 'desc' }, take: 1 },
          topic: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.topic.findMany({
        where: { brandId: brand.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.knowledgeDocument.findMany({
        where: { brandId: brand.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.jobRun.findMany({
        where: { brandId: brand.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Compute real KPIs
    const totalReels = reels.length;
    const totalVideoSeconds = reels.reduce((acc, r) => acc + (r.durationSeconds || 0), 0);
    const renderedReels = reels.filter((r) => r.mediaAssets && r.mediaAssets.length > 0);
    const renderedCount = renderedReels.length;

    const renderJobs = jobs.filter((j) => j.jobType === 'RENDER_VIDEO');
    const successfulRenders = renderJobs.filter((j) => j.status === 'SUCCEEDED').length;
    const renderSuccessRate = renderJobs.length > 0
      ? Math.round((successfulRenders / renderJobs.length) * 100)
      : (renderedCount > 0 ? 100 : 0);

    const avgDuration = totalReels > 0 ? (totalVideoSeconds / totalReels).toFixed(1) : '16.0';
    const topicsTotal = topics.length;
    const topicsUsed = topics.filter((t) => t.isUsed).length;
    const topicsUnused = topicsTotal - topicsUsed;
    const pendingReviewCount = reels.filter((r) => r.status === 'NEEDS_REVIEW' || r.status === 'SCRIPT_READY').length;

    // Weekly activity (Sun - Sat): calculate real distribution
    const now = new Date();
    const thisWeek = [0, 0, 0, 0, 0, 0, 0];
    const lastWeek = [0, 0, 0, 0, 0, 0, 0];

    const oneDayMs = 24 * 60 * 60 * 1000;
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    // Map each reel and completed job into this week or last week
    const activityItems = [
      ...reels.map((r) => ({ date: new Date(r.createdAt), type: 'reel' })),
      ...jobs.filter((j) => j.status === 'SUCCEEDED').map((j) => ({ date: new Date(j.createdAt), type: 'job' })),
    ];

    activityItems.forEach((item) => {
      const itemTime = item.date.getTime();
      const diffDays = Math.floor((startOfToday - itemTime) / oneDayMs);
      const itemDayOfWeek = item.date.getDay();

      if (diffDays >= 0 && diffDays < 7) {
        thisWeek[itemDayOfWeek] += 1;
      } else if (diffDays >= 7 && diffDays < 14) {
        lastWeek[itemDayOfWeek] += 1;
      }
    });

    // Monthly volume breakdown across 12 months (JAN - DEC) of current year
    const monthsShort = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const currentYear = now.getFullYear();
    const monthlyData = monthsShort.map((m, idx) => {
      const monthReels = reels.filter((r) => {
        const d = new Date(r.createdAt);
        return d.getFullYear() === currentYear && d.getMonth() === idx;
      });
      const rendered = monthReels.filter((r) => r.mediaAssets && r.mediaAssets.length > 0).length;
      const drafts = monthReels.length - rendered;
      return {
        month: m,
        rendered,
        drafts,
        total: monthReels.length,
      };
    });

    // Topic utilization and render completion percentages
    const topicUtilizationPct = topicsTotal > 0 ? Math.round((topicsUsed / topicsTotal) * 100) : 0;
    const renderCompletionPct = totalReels > 0 ? Math.round((renderedCount / totalReels) * 100) : 0;

    // Real Actionable Reminders / Activity stream
    const reminders: any[] = [];

    // 1. Unused topics that can be converted to reels
    topics
      .filter((t) => !t.isUsed)
      .slice(0, 2)
      .forEach((t) => {
        reminders.push({
          id: `topic-${t.id}`,
          type: 'TOPIC_READY',
          title: `Generate Script: ${t.title}`,
          subtitle: `Category: ${t.category} • In topic pool`,
          date: new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          statusLabel: 'Script Ready',
          statusColor: 'blue',
          link: '/topics',
        });
      });

    // 2. Reels needing review or ready to render
    reels
      .filter((r) => r.status === 'SCRIPT_READY' || r.status === 'NEEDS_REVIEW')
      .slice(0, 2)
      .forEach((r) => {
        reminders.push({
          id: `reel-review-${r.id}`,
          type: 'NEEDS_RENDER',
          title: `Render Video: ${r.title}`,
          subtitle: `${r.durationSeconds}s reel • Ready to trigger Remotion render`,
          date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          statusLabel: r.status === 'SCRIPT_READY' ? 'Ready to Render' : 'Needs Review',
          statusColor: 'yellow',
          link: '/reels',
        });
      });

    // 3. Rendered reels ready to publish or preview
    renderedReels.slice(0, 3).forEach((r) => {
      const asset = r.mediaAssets[0];
      reminders.push({
        id: `reel-done-${r.id}`,
        type: 'RENDERED',
        title: `Rendered: ${r.title}`,
        subtitle: `${r.durationSeconds}s 1080x1920 MP4 ready for Instagram`,
        date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        statusLabel: 'Done',
        statusColor: 'teal',
        link: '/reels',
        mediaUrl: asset?.publicUrl || null,
      });
    });

    // 4. Pending knowledge documents if any
    docs
      .filter((d) => !d.isApproved)
      .slice(0, 1)
      .forEach((d) => {
        reminders.push({
          id: `doc-${d.id}`,
          type: 'DOC_READY',
          title: `Approve Knowledge: ${d.title}`,
          subtitle: `${d.category} • Knowledge source`,
          date: new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          statusLabel: 'Pending Approval',
          statusColor: 'peach',
          link: '/knowledge',
        });
      });

    res.json({
      data: {
        brand: {
          id: brand.id,
          slug: brand.slug,
          displayName: brand.displayName,
          profile: brand.profile,
        },
        kpis: {
          renderSuccessRate: `${renderSuccessRate}%`,
          totalReels,
          totalVideoSeconds: `${totalVideoSeconds}s`,
          renderedCount,
          avgDuration: `${avgDuration}s`,
          topicsTotal,
          topicsUsed,
          topicsUnused,
          pendingReviewCount,
          jobsTotal: jobs.length,
        },
        performanceWeekly: {
          days: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'],
          thisWeek,
          lastWeek,
        },
        monthlyVolume: {
          year: currentYear,
          months: monthlyData,
          totalThisYear: reels.filter((r) => new Date(r.createdAt).getFullYear() === currentYear).length,
        },
        gauges: {
          topicUtilizationPct,
          renderCompletionPct,
        },
        statusSummary: {
          totalRendered: renderedCount,
          totalVideoSeconds,
          sparkline: [
            renderedCount > 0 ? 1 : 0,
            renderedCount > 1 ? 2 : 1,
            renderedCount > 2 ? 3 : 2,
            renderedCount,
          ],
        },
        reminders,
        recentReels: reels.slice(0, 5).map((r) => ({
          id: r.id,
          title: r.title,
          status: r.status,
          durationSeconds: r.durationSeconds,
          createdAt: r.createdAt,
          mediaUrl: r.mediaAssets[0]?.publicUrl || null,
        })),
      },
    });
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

