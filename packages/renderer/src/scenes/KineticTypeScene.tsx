import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Sparkles } from 'lucide-react';
import type { KineticTypeScene as KineticTypeSceneType } from '@learnops/schema';
import { renderHighlightedText, useBrandTheme } from '../styles/theme.js';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const KineticTypeScene: React.FC<{ scene: KineticTypeSceneType }> = ({ scene }) => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const beatFrames = durationInFrames / Math.max(scene.phrases.length + 1, 2);
  const emphasisPattern = scene.emphasis ? new RegExp(`(${escapeRegExp(scene.emphasis)})`, 'gi') : null;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '24px',
        padding: '0 74px',
        boxSizing: 'border-box',
        backgroundColor: theme.colors.deepBackground,
      }}
    >
      <div
        style={{
          color: theme.colors.mutedText,
          fontFamily: theme.fonts.mono,
          fontSize: '22px',
          fontWeight: 800,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          marginBottom: '12px',
        }}
      >
        <Sparkles size={24} color={theme.colors.brightAccent} strokeWidth={2.2} />
        Key idea
      </div>
      {scene.phrases.map((phrase, index) => {
        const startFrame = Math.round(beatFrames * index * 0.72);
        const entrance = spring({
          frame: frame - startFrame,
          fps,
          config: { damping: 16, stiffness: 125 },
        });
        const phraseWithEmphasis = emphasisPattern
          ? phrase.replace(emphasisPattern, '*$1*')
          : phrase;
        return (
          <div
            key={`${index}-${phrase}`}
            style={{
              opacity: entrance,
              transform: `translateY(${(1 - entrance) * 34}px)`,
              color: theme.colors.primaryText,
              fontFamily: theme.fonts.heading,
              fontSize: scene.phrases.length > 4 ? '48px' : '62px',
              fontWeight: 900,
              letterSpacing: '-0.035em',
              lineHeight: 1.12,
              maxWidth: '930px',
            }}
          >
            {renderHighlightedText(
              phraseWithEmphasis,
              theme.colors.primaryText,
              theme.colors.brightAccent
            )}
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: 74,
          bottom: '96px',
          width: `${interpolate(frame, [0, durationInFrames], [0, 100], { extrapolateRight: 'clamp' })}%`,
          maxWidth: 'calc(100% - 148px)',
          height: '5px',
          borderRadius: '999px',
          backgroundColor: theme.colors.brandPrimary,
          boxShadow: `0 0 16px ${theme.colors.primaryGlow}`,
        }}
      />
    </div>
  );
};
