export const REEL_STATUS = {
  DRAFT: 'DRAFT',
  SCRIPT_READY: 'SCRIPT_READY',
  READY_TO_RENDER: 'READY_TO_RENDER',
  RENDERING: 'RENDERING',
  RENDERED: 'RENDERED',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  APPROVED: 'APPROVED',
  SCHEDULED: 'SCHEDULED',
  PUBLISHING: 'PUBLISHING',
  PUBLISHED: 'PUBLISHED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;

export type ReelStatus = (typeof REEL_STATUS)[keyof typeof REEL_STATUS];

export const JOB_STATUS = {
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  RETRY_WAIT: 'RETRY_WAIT',
  SUCCEEDED: 'SUCCEEDED',
  FAILED_FINAL: 'FAILED_FINAL',
  CANCELLED: 'CANCELLED',
} as const;

export type JobStatus = (typeof JOB_STATUS)[keyof typeof JOB_STATUS];

export const SCENE_KINDS = {
  HOOK: 'hook',
  KINETIC_TYPE: 'kinetic_type',
  COMPARISON: 'comparison',
  FOLDER_TREE: 'folder_tree',
  TERMINAL: 'terminal',
  CONTAINER_DIAGRAM: 'container_diagram',
  PIPELINE: 'pipeline',
  OUTRO: 'outro',
} as const;

export type SceneKind = (typeof SCENE_KINDS)[keyof typeof SCENE_KINDS];

export const VIDEO_CONFIG = {
  WIDTH: 1080,
  HEIGHT: 1920,
  FPS: 30,
  MIN_DURATION_SECONDS: 10,
  MAX_DURATION_SECONDS: 30,
  DEFAULT_DURATION_SECONDS: 20,
} as const;

