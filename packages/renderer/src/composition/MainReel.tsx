import React from 'react';
import { Audio, Series, useVideoConfig } from 'remotion';
import type { ReelRenderInput } from '@learnops/schema';
import { BackgroundGrid } from '../components/BackgroundGrid.js';
import { BrandHeader } from '../components/BrandHeader.js';
import { SceneDispatcher } from '../scenes/SceneDispatcher.js';
import { BrandThemeProvider, defaultTheme } from '../styles/theme.js';

export const MainReel: React.FC<ReelRenderInput> = ({ script, brand, masterAudio, sceneAudios }) => {
  const { fps } = useVideoConfig();

  const brandName = brand?.name || 'Brand';
  const hookEndFrame = Math.round((script.scenes[0]?.durationSeconds || 0) * fps);
  const outroStartFrame = Math.round(
    script.scenes.slice(0, -1).reduce((total, scene) => total + scene.durationSeconds, 0) * fps
  );

  const masterAudioSrc = masterAudio?.audioDataUri || masterAudio?.audioUrl || masterAudio?.audioPath;

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

        {/* Master continuous story audio track */}
        {masterAudioSrc ? <Audio src={masterAudioSrc} /> : null}

        <Series>
          {script.scenes.map((scene, idx) => {
            const sceneFrames = Math.round(scene.durationSeconds * fps);
            const sceneForRender =
              scene.kind === 'outro' && brand?.creatorCredit
                ? { ...scene, creatorCredit: brand.creatorCredit }
                : scene;

            const isHook = scene.kind === 'hook';
            const isOutro = scene.kind === 'outro';
            // Only play per-scene audio if no master audio track is provided
            const sceneAudio = !masterAudioSrc ? sceneAudios?.find((a) => a.sceneIndex === idx) : null;
            const audioSrc = sceneAudio?.audioDataUri || sceneAudio?.audioUrl || sceneAudio?.audioPath;

            return (
              <Series.Sequence key={scene.id || idx} durationInFrames={sceneFrames}>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    overflow: 'hidden',
                    backgroundColor: isHook
                      ? brand?.primaryColor || defaultTheme.colors.brandPrimary
                      : brand?.backgroundColor || defaultTheme.colors.deepBackground,
                  }}
                >
                  <SceneDispatcher scene={sceneForRender} />
                </div>
                {audioSrc ? <Audio src={audioSrc} /> : null}
              </Series.Sequence>
            );
          })}
        </Series>
      </div>
    </BrandThemeProvider>
  );
};
