import { z } from 'zod';

export const BrandProfileSchema = z.object({
  id: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  displayName: z.string().min(2).max(60),
  timezone: z.string().default('UTC'),
  isActive: z.boolean().default(true),
  autoPublish: z.boolean().default(false),
  audience: z.string().max(250),
  voiceTone: z.string().max(250),
  contentPillars: z.array(z.string().max(60)).min(1).max(10),
  theme: z.object({
    primaryColor: z.string().default('#6F41EC'),
    secondaryColor: z.string().default('#C4B5FD'),
    backgroundColor: z.string().default('#0D1117'),
    cardBackground: z.string().default('#161B22'),
    textColor: z.string().default('#E6EDF3'),
  }),
});

export type BrandProfile = z.infer<typeof BrandProfileSchema>;

export const KnowledgeDocumentSchema = z.object({
  id: z.string().optional(),
  brandId: z.string(),
  title: z.string().min(3).max(120),
  source: z.string().max(200),
  category: z.string().max(60),
  content: z.string().min(20).max(5000),
  isApproved: z.boolean().default(false),
});

export type KnowledgeDocument = z.infer<typeof KnowledgeDocumentSchema>;

export const TopicSchema = z.object({
  id: z.string().optional(),
  brandId: z.string(),
  title: z.string().min(3).max(120),
  category: z.string().max(60),
  brief: z.string().max(500),
  isUsed: z.boolean().default(false),
});

export type Topic = z.infer<typeof TopicSchema>;

