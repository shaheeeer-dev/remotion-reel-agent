import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBrandTheme } from '../styles/theme.js';
import type { OutroScene as OutroSceneType } from '@learnops/schema';

export interface OutroSceneProps {
  scene?: OutroSceneType;
  brandName?: string;
  tagline?: string;
  callToAction?: string;
}

/**
 * Scene 5: Outro & CTA (1 second)
 *
 * Matching exact specification:
 * - Background: #110F17 (Brand deep background)
 * - Brand Title: #FFFFFF, 48px, bold
 * - Subtitle: #91899C, 24px ("Follow for daily tutorials.")
 * - Follow Button: #783CEB (Brand primary), white text, rounded pill, bold, border none
 * - Platform Safe Area: Centered cleanly within the frame
 */
export const OutroScene: React.FC<OutroSceneProps> = ({
  scene,
  brandName: directBrandName,
  tagline: directTagline,
  callToAction: directCta,
}) => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animation paced for 1s (30 frames)
  const entranceSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 140 },
  });

  const buttonSpring = spring({
    frame: frame - 2,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  const brandTitle = directBrandName || scene?.brandName || 'LearnOps';
  const subHeadline = directTagline || scene?.tagline || 'Follow for daily tutorials.';
  const ctaLabel = directCta || scene?.callToAction || 'Follow';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: theme.colors.bg, // Dynamic Brand Background (#110F17)
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
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
              color: '#FFFFFF',
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
              color: '#91899C',
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
            backgroundColor: theme.colors.primary || '#783CEB',
            color: '#FFFFFF',
            padding: '16px 36px',
            borderRadius: '50px',
            fontWeight: 'bold',
            fontSize: '24px',
            border: 'none',
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
