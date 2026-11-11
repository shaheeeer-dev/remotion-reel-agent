import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBrandTheme, LearnOpsTheme } from '../styles/theme.js';
import type { OutroScene as OutroSceneType } from '@learnops/schema';

/**
 * Scene 4: The Outro & CTA (00:14 - 00:17, 2-3 sec)
 *
 * Exact Color Mapping & Layout per specification:
 * - Background: #110F17 (Dark Amethyst)
 * - Brand Title: #FFFFFF (White)
 * - Sub-headline: #91899C (Muted Purple-Gray)
 * - Button Fill: #783CEB (Brand Purple)
 * - Button Text: #FFFFFF (White)
 */
export const OutroScene: React.FC<{ scene: OutroSceneType }> = ({ scene }) => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animation
  const entranceSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const buttonSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 12, stiffness: 130 },
  });

  const brandTitle = scene.brandName || 'LearnOps';
  const subHeadline = scene.tagline || 'Follow for daily tutorials.';
  const ctaLabel = scene.callToAction || 'Follow';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: LearnOpsTheme.bgDarkAmethyst, // #110F17
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '80%',
          transform: `scale(${entranceSpring})`,
          opacity: entranceSpring,
        }}
      >
        <div>
          <h1
            style={{
              color: LearnOpsTheme.textWhite, // #FFFFFF
              fontSize: '48px',
              fontWeight: 'bold',
              margin: '0 0 12px 0',
              fontFamily: theme.fonts.heading,
              letterSpacing: '-0.02em',
            }}
          >
            {brandTitle}
          </h1>
          <p
            style={{
              color: LearnOpsTheme.textMutedPurple, // #91899C
              fontSize: '24px',
              margin: 0,
              fontFamily: theme.fonts.body,
            }}
          >
            {subHeadline}
          </p>
        </div>

        <button
          style={{
            backgroundColor: LearnOpsTheme.brandPurple, // #783CEB
            color: LearnOpsTheme.textWhite, // #FFFFFF
            padding: '16px 36px',
            borderRadius: '50px',
            fontWeight: 'bold',
            fontSize: '24px',
            border: 'none',
            boxShadow: '0 0 25px rgba(120, 60, 235, 0.45)',
            transform: `scale(${buttonSpring})`,
            cursor: 'pointer',
          }}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
};
