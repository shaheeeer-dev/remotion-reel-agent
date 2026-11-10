import React from 'react';
import type { Scene } from '@learnops/schema';
import { HookScene } from './HookScene.js';
import { FolderTreeScene } from './FolderTreeScene.js';
import { TerminalScene } from './TerminalScene.js';
import { ContainerDiagramScene } from './ContainerDiagramScene.js';
import { PipelineScene } from './PipelineScene.js';
import { OutroScene } from './OutroScene.js';

export const SceneDispatcher: React.FC<{ scene: Scene }> = ({ scene }) => {
  switch (scene.kind) {
    case 'hook':
      return <HookScene scene={scene} />;
    case 'folder_tree':
      return <FolderTreeScene scene={scene} />;
    case 'terminal':
      return <TerminalScene scene={scene} />;
    case 'container_diagram':
      return <ContainerDiagramScene scene={scene} />;
    case 'pipeline':
      return <PipelineScene scene={scene} />;
    case 'outro':
      return <OutroScene scene={scene} />;
    default:
      return null;
  }
};

