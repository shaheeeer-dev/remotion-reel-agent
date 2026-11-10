import React from 'react';
import { Series, useVideoConfig } from 'remotion';
import type { ReelRenderInput } from '@learnops/schema';
import { BackgroundGrid } from '../components/BackgroundGrid.js';
import { BrandHeader } from '../components/BrandHeader.js';
import { SceneDispatcher } from '../scenes/SceneDispatcher.js';
import { BrandThemeProvider } from '../styles/theme.js';

export const MainReel: React.FC<ReelRenderInput> = ({ script, brand }) => {
  const { fps } = useVideoConfig();

  return (
    <BrandThemeProvider brand={brand}>
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          backgroundColor: brand?.backgroundColor || '#0B0F17',
          overflow: 'hidden',
        }}
      >
        <BackgroundGrid />
        <BrandHeader brandName={brand?.name || 'Brand'} topicTag={script.topic} />

        <Series>
          {script.scenes.map((scene, idx) => {
            const sceneFrames = Math.round(scene.durationSeconds * fps);
            const sceneForRender =
              scene.kind === 'outro' && brand?.creatorCredit
                ? { ...scene, creatorCredit: brand.creatorCredit }
                : scene;

            return (
              <Series.Sequence key={scene.id || idx} durationInFrames={sceneFrames}>
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    paddingTop: '160px',
                    paddingBottom: '80px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SceneDispatcher scene={sceneForRender} />
                </div>
              </Series.Sequence>
            );
          })}
        </Series>
      </div>
    </BrandThemeProvider>
  );
};
