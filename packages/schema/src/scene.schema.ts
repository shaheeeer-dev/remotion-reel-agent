import { z } from 'zod';
import { SCENE_KINDS } from './constants.js';

export const BaseSceneSchema = z.object({
  id: z.string().optional(),
  durationSeconds: z.number().min(1).max(10),
  voiceover: z.string().max(200).optional(),
});

export const HookSceneSchema = BaseSceneSchema.extend({
  kind: z.literal(SCENE_KINDS.HOOK),
  badge: z.string().max(40),
  headline: z.string().max(120),
  subtext: z.string().max(160).optional(),
  visualMetaphor: z.enum([
    'folder_drawer',
    'container_stack',
    'pipeline_flow',
    'permissions_matrix',
    'git_graph',
    'network_flow',
  ]).optional(),
});

export const KineticTypeSceneSchema = BaseSceneSchema.extend({
  kind: z.literal(SCENE_KINDS.KINETIC_TYPE),
  phrases: z.array(z.string().max(50)).min(1).max(6),
  emphasis: z.string().max(60),
});

export const ComparisonSceneSchema = BaseSceneSchema.extend({
  kind: z.literal(SCENE_KINDS.COMPARISON),
  title: z.string().max(80),
  leftLabel: z.string().max(40),
  leftTitle: z.string().max(50),
  leftDescription: z.string().max(120),
  leftIcon: z.enum(['server', 'user', 'layers', 'box', 'git-branch', 'rocket', 'file-text', 'settings']).optional(),
  rightLabel: z.string().max(40),
  rightTitle: z.string().max(50),
  rightDescription: z.string().max(120),
  rightIcon: z.enum(['server', 'user', 'layers', 'box', 'git-branch', 'rocket', 'file-text', 'settings']).optional(),
  takeaway: z.string().max(140),
});

export interface FolderNode {
  name: string;
  isDirectory: boolean;
  highlight?: boolean;
  description?: string;
  children?: FolderNode[];
}

export const FolderNodeSchema: z.ZodType<FolderNode> = z.lazy(() =>
  z.object({
    name: z.string().max(60),
    isDirectory: z.boolean(),
    highlight: z.boolean().optional(),
    description: z.string().max(100).optional(),
    children: z.array(FolderNodeSchema).optional(),
  })
);

export const FolderTreeSceneSchema = BaseSceneSchema.extend({
  kind: z.literal(SCENE_KINDS.FOLDER_TREE),
  title: z.string().max(80),
  rootPath: z.string().max(60).default('/'),
  highlightPath: z.string().max(80),
  tree: z.array(FolderNodeSchema).min(1).max(8),
  explanation: z.string().max(180),
});

export const TerminalSceneSchema = BaseSceneSchema.extend({
  kind: z.literal(SCENE_KINDS.TERMINAL),
  title: z.string().max(60).default('bash — 80x24'),
  promptUser: z.string().max(40).optional(),
  command: z.string().max(100),
  outputLines: z.array(z.string().max(120)).min(1).max(10),
  explanation: z.string().max(180),
});

export const ContainerItemSchema = z.object({
  name: z.string().max(50),
  app: z.string().max(50),
  binsLibs: z.string().max(60),
  color: z.string().optional(),
});

export const ContainerDiagramSceneSchema = BaseSceneSchema.extend({
  kind: z.literal(SCENE_KINDS.CONTAINER_DIAGRAM),
  title: z.string().max(80),
  hostOs: z.string().max(80).default('Host OS & Linux Kernel'),
  containerEngine: z.string().max(80).default('Docker Engine (cgroups + namespaces)'),
  containers: z.array(ContainerItemSchema).min(1).max(4),
  comparisonNote: z.string().max(160).optional(),
});

export const PipelineStageSchema = z.object({
  name: z.string().max(50),
  status: z.enum(['success', 'running', 'pending']),
  icon: z.string().optional(),
  details: z.string().max(80).optional(),
});

export const PipelineSceneSchema = BaseSceneSchema.extend({
  kind: z.literal(SCENE_KINDS.PIPELINE),
  title: z.string().max(80),
  trigger: z.string().max(80),
  stages: z.array(PipelineStageSchema).min(2).max(6),
  takeaway: z.string().max(180),
});

export const OutroSceneSchema = BaseSceneSchema.extend({
  kind: z.literal(SCENE_KINDS.OUTRO),
  brandName: z.string().max(50).default('Brand'),
  tagline: z.string().max(100).default('Learn something useful, one step at a time'),
  callToAction: z.string().max(120).default('Follow for more'),
  creatorCredit: z.string().max(100).optional(),
});

export const SceneSchema = z.discriminatedUnion('kind', [
  HookSceneSchema,
  KineticTypeSceneSchema,
  ComparisonSceneSchema,
  FolderTreeSceneSchema,
  TerminalSceneSchema,
  ContainerDiagramSceneSchema,
  PipelineSceneSchema,
  OutroSceneSchema,
]);

export interface BaseScene {
  id?: string;
  durationSeconds: number;
  voiceover?: string;
}

export interface HookScene extends BaseScene {
  kind: 'hook';
  badge: string;
  headline: string;
  subtext?: string;
  visualMetaphor?:
    | 'folder_drawer'
    | 'container_stack'
    | 'pipeline_flow'
    | 'permissions_matrix'
    | 'git_graph'
    | 'network_flow';
}

export interface KineticTypeScene extends BaseScene {
  kind: 'kinetic_type';
  phrases: string[];
  emphasis: string;
}

export interface ComparisonScene extends BaseScene {
  kind: 'comparison';
  title: string;
  leftLabel: string;
  leftTitle: string;
  leftDescription: string;
  leftIcon?: 'server' | 'user' | 'layers' | 'box' | 'git-branch' | 'rocket' | 'file-text' | 'settings';
  rightLabel: string;
  rightTitle: string;
  rightDescription: string;
  rightIcon?: 'server' | 'user' | 'layers' | 'box' | 'git-branch' | 'rocket' | 'file-text' | 'settings';
  takeaway: string;
}

export interface FolderTreeScene extends BaseScene {
  kind: 'folder_tree';
  title: string;
  rootPath: string;
  highlightPath: string;
  tree: FolderNode[];
  explanation: string;
}

export interface TerminalScene extends BaseScene {
  kind: 'terminal';
  title?: string;
  promptUser?: string;
  command: string;
  outputLines: string[];
  explanation: string;
}

export interface ContainerDiagramScene extends BaseScene {
  kind: 'container_diagram';
  title: string;
  hostOs: string;
  containerEngine: string;
  containers: Array<{
    name: string;
    app: string;
    binsLibs: string;
    color?: string;
  }>;
  comparisonNote?: string;
}

export interface PipelineStage {
  name: string;
  status: 'success' | 'running' | 'pending';
  icon?: string;
  details?: string;
}

export interface PipelineScene extends BaseScene {
  kind: 'pipeline';
  title: string;
  trigger: string;
  stages: PipelineStage[];
  takeaway: string;
}

export interface OutroScene extends BaseScene {
  kind: 'outro';
  brandName: string;
  tagline: string;
  callToAction: string;
  creatorCredit?: string;
}

export type Scene =
  | HookScene
  | KineticTypeScene
  | ComparisonScene
  | FolderTreeScene
  | TerminalScene
  | ContainerDiagramScene
  | PipelineScene
  | OutroScene;

