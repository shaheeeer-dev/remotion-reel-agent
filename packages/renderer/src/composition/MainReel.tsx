import React from 'react';
import { Series, useVideoConfig } from 'remotion';
import type { ReelRenderInput } from '@learnops/schema';
import { BackgroundGrid } from '../components/BackgroundGrid.js';
import { BrandHeader } from '../components/BrandHeader.js';
import { SceneDispatcher } from '../scenes/SceneDispatcher.js';
import { BrandThemeProvider, defaultTheme } from '../styles/theme.js';

export const MainReel: React.FC<ReelRenderInput> = ({ script, brand }) => {
  const { fps } = useVideoConfig();

  const brandName = brand?.name || 'Brand';

  return (
    <BrandThemeProvider brand={brand}>
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          backgroundColor: brand?.backgroundColor || defaultTheme.colors.bg,
          overflow: 'hidden',
        }}
      >
        <BackgroundGrid />
        <BrandHeader brandName={brandName} topicTag={script.topic} />

        <Series>
          {script.scenes.map((scene, idx) => {
            const sceneFrames = Math.round(scene.durationSeconds * fps);
            const sceneForRender =
              scene.kind === 'outro' && brand?.creatorCredit
                ? { ...scene, creatorCredit: brand.creatorCredit }
                : scene;

            const isHook = scene.kind === 'hook';
            const isOutro = scene.kind === 'outro';

            return (
              <Series.Sequence key={scene.id || idx} durationInFrames={sceneFrames}>
                <div
                  style={{
                    width: '100%',
                    height: '1536px', // Platform UI Safe Area: Upper 80% (top 1536px), reserving bottom 384px
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    paddingTop: isHook || isOutro ? '0px' : '150px',
                    paddingBottom: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxSizing: 'border-box',
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
