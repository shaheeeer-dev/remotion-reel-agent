import React from 'react';
import { Series, useVideoConfig } from 'remotion';
import type { ReelRenderInput } from '@learnops/schema';
import { BackgroundGrid } from '../components/BackgroundGrid.js';
import { BrandHeader } from '../components/BrandHeader.js';
import { SceneDispatcher } from '../scenes/SceneDispatcher.js';

export const MainReel: React.FC<ReelRenderInput> = ({ script, brand }) => {
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: brand?.backgroundColor || '#0B0F17',
        overflow: 'hidden',
      }}
    >
      {/* Background layer */}
      <BackgroundGrid />

      {/* Brand header and progress bar overlay */}
      <BrandHeader brandName={brand?.name || 'LearnOps'} topicTag={script.topic} />

      {/* Sequential Scenes */}
      <Series>
        {script.scenes.map((scene, idx) => {
          const sceneFrames = Math.round(scene.durationSeconds * fps);
          return (
            <Series.Sequence key={idx} durationInFrames={sceneFrames}>
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  paddingTop: '160px', // Space for BrandHeader
                  paddingBottom: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SceneDispatcher scene={scene} />
              </div>
            </Series.Sequence>
          );
        })}
      </Series>
    </div>
  );
};

