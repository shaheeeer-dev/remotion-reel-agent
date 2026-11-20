import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { prisma } from '../prisma/client.js';
import { env } from '../config/env.js';
import { getMonorepoRoot } from './remotion.service.js';

export interface IngestionResult {
  added: number;
  updated: number;
  skipped: number;
  total: number;
  errors: string[];
}

export interface KnowledgeCoverageReport {
  brandId: string;
  brandName: string;
  learnopsLessons: {
    total: number;
    categories: Record<string, number>;
  };
  generalDevops: {
    total: number;
    verified: number;
    unverified: number;
    categories: Record<string, number>;
  };
  backlogStatus: {
    target: number;
    currentQueued: number;
    byStatus: Record<string, number>;
  };
}

/**
 * Parses simple YAML-style frontmatter from markdown content.
 */
export function parseFrontmatter(rawContent: string): { frontmatter: Record<string, any>; body: string } {
  const match = rawContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, body: rawContent.trim() };
  }

  const yamlBlock = match[1];
  const body = match[2].trim();
  const frontmatter: Record<string, any> = {};

  for (const line of yamlBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    let val = trimmed.slice(colonIdx + 1).trim();

    // Strip quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    } else if (val === 'true') {
      val = true as any;
    } else if (val === 'false') {
      val = false as any;
    } else if (val.startsWith('[') && val.endsWith(']')) {
      // Parse simple string array
      val = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean) as any;
    }

    frontmatter[key] = val;
  }

  return { frontmatter, body };
}

export class KnowledgeService {
  /**
   * Resolves the LearnOps repository path.
   * Checks explicit env, sibling directory, and known local paths.
   */
  async resolveLearnOpsRepoPath(): Promise<string | null> {
    const rootDir = getMonorepoRoot();
    const candidatePaths = [
      env.LEARNOPS_REPO_PATH,
      path.resolve(rootDir, '../LearnOps'),
      '/Users/shaheer/Code/Web Dev/LearnOps',
    ];

    for (const p of candidatePaths) {
      if (!p) continue;
      const absPath = path.isAbsolute(p) ? p : path.resolve(rootDir, p);
      try {
        const stat = await fs.stat(absPath);
        if (stat.isDirectory()) {
          const lessonsDir = path.join(absPath, 'backend/lessons');
          const lessonsStat = await fs.stat(lessonsDir);
          if (lessonsStat.isDirectory()) {
            return absPath;
          }
        }
      } catch {
        // Continue checking other candidates
      }
    }

    return null;
  }

  /**
   * Source A: Ingests all actual LearnOps course content.md files from the real repository.
   * Preserves exact lesson IDs, slugs, learning objectives, and categories.
   */
  async syncLearnOpsLessons(brandId: string): Promise<IngestionResult> {
    const result: IngestionResult = { added: 0, updated: 0, skipped: 0, total: 0, errors: [] };
    const repoPath = await this.resolveLearnOpsRepoPath();

    if (!repoPath) {
      result.errors.push('LearnOps repository not found at configured paths.');
      console.warn('[KnowledgeService] LearnOps repository not found.');
      return result;
    }

    const lessonsBase = path.join(repoPath, 'backend/lessons');
    console.log(`[KnowledgeService] Syncing LearnOps lessons from: ${lessonsBase}`);

    const activePaths = new Set<string>();
    let trackDirs: string[] = [];
    try {
      const entries = await fs.readdir(lessonsBase, { withFileTypes: true });
      trackDirs = entries.filter((e) => e.isDirectory()).map((e) => path.join(lessonsBase, e.name));
    } catch (err: any) {
      result.errors.push(`Failed to read lessons root: ${err.message}`);
      return result;
    }

    for (const trackDir of trackDirs) {
      const trackName = path.basename(trackDir); // e.g. "Linux-Fundamentals" or "Shell-Scripting"
      const normalizedCategory = trackName.toLowerCase().includes('shell')
        ? 'Shell Scripting'
        : 'Linux Fundamentals';

      let lessonDirs: string[] = [];
      try {
        const entries = await fs.readdir(trackDir, { withFileTypes: true });
        lessonDirs = entries.filter((e) => e.isDirectory() && e.name.startsWith('lesson-')).map((e) => path.join(trackDir, e.name));
      } catch {
        continue;
      }

      for (const lessonDir of lessonDirs) {
        result.total++;
        const contentPath = path.join(lessonDir, 'content.md');
        const metadataPath = path.join(lessonDir, 'metadata.json');

        try {
          const contentRaw = await fs.readFile(contentPath, 'utf8');
          let metadata: any = {};
          try {
            const metaRaw = await fs.readFile(metadataPath, 'utf8');
            metadata = JSON.parse(metaRaw);
          } catch {
            // metadata fallback
          }

          const lessonId = metadata.id || path.basename(lessonDir);
          const title = metadata.title || lessonId.replace(/-/g, ' ');
          const sourcePath = path.relative(repoPath, contentPath);
          activePaths.add(sourcePath);
          const sourceUrl = `https://www.learnops.dev/lessons/${metadata.slug || lessonId}`;
          const checksum = crypto.createHash('sha256').update(contentRaw).digest('hex');

          // Append learning objectives to content context if available
          let enrichedContent = contentRaw;
          if (metadata.learningObjectives && Array.isArray(metadata.learningObjectives)) {
            enrichedContent = `## Verified Lesson Objectives:\n${metadata.learningObjectives.map((o: string) => `- ${o}`).join('\n')}\n\n` + contentRaw;
          }

          const existing = await prisma.knowledgeDocument.findUnique({
            where: {
              brandId_sourcePath: { brandId, sourcePath },
            },
          });

          if (existing) {
            if (existing.checksumSha256 === checksum) {
              result.skipped++;
              continue;
            }

            await prisma.knowledgeDocument.update({
              where: { id: existing.id },
              data: {
                title,
                category: normalizedCategory,
                content: enrichedContent,
                checksumSha256: checksum,
                sourceUrl,
                lessonId,
                isVerified: true,
                isApproved: true,
                approvedAt: new Date(),
                version: { increment: 1 },
              },
            });
            result.updated++;
          } else {
            await prisma.knowledgeDocument.create({
              data: {
                brandId,
                title,
                category: normalizedCategory,
                source: 'learnops-official',
                sourceType: 'LEARNOPS_LESSON',
                sourcePath,
                sourceUrl,
                lessonId,
                content: enrichedContent,
                checksumSha256: checksum,
                isVerified: true,
                isApproved: true,
                approvedAt: new Date(),
              },
            });
            result.added++;
          }
        } catch (err: any) {
          result.errors.push(`Error syncing ${path.basename(lessonDir)}: ${err.message}`);
        }
      }
    }

    // Handle stale or deleted LearnOps lessons
    const staleDocs = await prisma.knowledgeDocument.updateMany({
      where: {
        brandId,
        sourceType: 'LEARNOPS_LESSON',
        sourcePath: { notIn: Array.from(activePaths) },
        isApproved: true,
      },
      data: {
        isApproved: false,
      },
    });
    if (staleDocs.count > 0) {
      console.log(`[KnowledgeService] Deactivated ${staleDocs.count} stale/deleted LearnOps lessons.`);
    }

    console.log(
      `[KnowledgeService] LearnOps Sync Finished: ${result.added} added, ${result.updated} updated, ${result.skipped} skipped.`
    );
    return result;
  }

  /**
   * Source B: Ingests General DevOps reference documents from `knowledge-base/devops` and `knowledge-base/brand`.
   * Only documents marked with `verified: true` are approved for script generation.
   */
  async syncGeneralDevops(brandId: string): Promise<IngestionResult> {
    const result: IngestionResult = { added: 0, updated: 0, skipped: 0, total: 0, errors: [] };
    const rootDir = getMonorepoRoot();
    const kbDir = path.resolve(rootDir, env.KNOWLEDGE_BASE_DIR);
    const activePaths = new Set<string>();

    const subDirs = ['devops', 'brand'];
    for (const sub of subDirs) {
      const targetDir = path.join(kbDir, sub);
      try {
        await fs.access(targetDir);
      } catch {
        continue;
      }

      const files = await this.findMarkdownFiles(targetDir);
      for (const filePath of files) {
        result.total++;
        try {
          const raw = await fs.readFile(filePath, 'utf8');
          const { frontmatter, body } = parseFrontmatter(raw);
          const relativePath = path.relative(kbDir, filePath);
          activePaths.add(relativePath);
          const checksum = crypto.createHash('sha256').update(raw).digest('hex');

          const title = frontmatter.title || path.basename(filePath, '.md').replace(/-/g, ' ');
          const category = frontmatter.category || (sub === 'brand' ? 'Brand' : 'DevOps');
          const sourceType =
            sub === 'brand'
              ? 'BRAND_PROFILE'
              : frontmatter.source_type === 'general_devops'
              ? 'GENERAL_DEVOPS'
              : 'GENERAL_DEVOPS';
          const sourceUrl = frontmatter.source_url || 'https://learnops.dev';
          const docVersion = frontmatter.doc_version || '1.0';
          const isVerified = Boolean(frontmatter.is_verified ?? frontmatter.verified ?? false);

          const existing = await prisma.knowledgeDocument.findUnique({
            where: {
              brandId_sourcePath: { brandId, sourcePath: relativePath },
            },
          });

          if (existing) {
            if (existing.checksumSha256 === checksum) {
              result.skipped++;
              continue;
            }

            await prisma.knowledgeDocument.update({
              where: { id: existing.id },
              data: {
                title,
                category,
                content: body,
                sourceUrl,
                docVersion,
                checksumSha256: checksum,
                isVerified,
                isApproved: isVerified,
                approvedAt: isVerified ? new Date() : null,
                version: { increment: 1 },
              },
            });
            result.updated++;
          } else {
            await prisma.knowledgeDocument.create({
              data: {
                brandId,
                title,
                category,
                source: 'devops-reference',
                sourceType,
                sourcePath: relativePath,
                sourceUrl,
                docVersion,
                content: body,
                checksumSha256: checksum,
                isVerified,
                isApproved: isVerified,
                approvedAt: isVerified ? new Date() : null,
              },
            });
            result.added++;
          }
        } catch (err: any) {
          result.errors.push(`Error syncing ${filePath}: ${err.message}`);
        }
      }
    }

    // Handle stale or deleted DevOps reference documents
    const staleDocs = await prisma.knowledgeDocument.updateMany({
      where: {
        brandId,
        sourceType: { in: ['GENERAL_DEVOPS', 'BRAND_PROFILE'] },
        sourcePath: { notIn: Array.from(activePaths) },
        isApproved: true,
      },
      data: {
        isApproved: false,
      },
    });
    if (staleDocs.count > 0) {
      console.log(`[KnowledgeService] Deactivated ${staleDocs.count} stale/deleted DevOps documents.`);
    }

    console.log(
      `[KnowledgeService] General DevOps Sync Finished: ${result.added} added, ${result.updated} updated, ${result.skipped} skipped.`
    );
    return result;
  }

  /**
   * Helper to recursively discover markdown files.
   */
  private async findMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const nested = await this.findMarkdownFiles(fullPath);
        files.push(...nested);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Syncs both LearnOps lessons and General DevOps reference materials.
   */
  async syncAll(brandId: string): Promise<{ learnops: IngestionResult; generalDevops: IngestionResult }> {
    const learnops = await this.syncLearnOpsLessons(brandId);
    const generalDevops = await this.syncGeneralDevops(brandId);
    return { learnops, generalDevops };
  }

  /**
   * Generates a Knowledge Coverage Report showing what the AI knows across all categories,
   * verification status, and rolling topic backlog health.
   */
  async getKnowledgeCoverage(brandId: string): Promise<KnowledgeCoverageReport> {
    const brand = await prisma.brand.findUniqueOrThrow({
      where: { id: brandId },
      select: { displayName: true },
    });

    const docs = await prisma.knowledgeDocument.findMany({
      where: { brandId },
      select: { sourceType: true, category: true, isVerified: true, isApproved: true },
    });

    const learnopsCategories: Record<string, number> = {};
    const devopsCategories: Record<string, number> = {};
    let learnopsTotal = 0;
    let devopsTotal = 0;
    let devopsVerified = 0;
    let devopsUnverified = 0;

    for (const doc of docs) {
      if (doc.sourceType === 'LEARNOPS_LESSON') {
        learnopsTotal++;
        learnopsCategories[doc.category] = (learnopsCategories[doc.category] || 0) + 1;
      } else if (doc.sourceType === 'GENERAL_DEVOPS') {
        devopsTotal++;
        devopsCategories[doc.category] = (devopsCategories[doc.category] || 0) + 1;
        if (doc.isVerified) devopsVerified++;
        else devopsUnverified++;
      }
    }

    const topics = await prisma.topic.groupBy({
      by: ['status'],
      where: { brandId },
      _count: { id: true },
    });

    const byStatus: Record<string, number> = {};
    let currentQueued = 0;
    for (const t of topics) {
      byStatus[t.status] = t._count.id;
      if (t.status === 'QUEUED' || t.status === 'DISCOVERED') {
        currentQueued += t._count.id;
      }
    }

    return {
      brandId,
      brandName: brand.displayName,
      learnopsLessons: {
        total: learnopsTotal,
        categories: learnopsCategories,
      },
      generalDevops: {
        total: devopsTotal,
        verified: devopsVerified,
        unverified: devopsUnverified,
        categories: devopsCategories,
      },
      backlogStatus: {
        target: 25,
        currentQueued,
        byStatus,
      },
    };
  }
}

export const knowledgeService = new KnowledgeService();
