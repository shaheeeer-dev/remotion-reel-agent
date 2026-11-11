import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBrandTheme } from '../styles/theme.js';
import type { OutroScene as OutroSceneType } from '@learnops/schema';

/**
 * Scene 4: The Outro & CTA (00:14 - 00:17, 2-3 sec)
 *
 * Rule-based Generalized Dynamic Theming:
 * - Background: Brand Background (Deep dark matte)
 * - Brand Title: Brand Text Primary (White)
 * - Sub-headline: Brand Text Secondary (Muted)
 * - Follow Button: Brand Primary Color fill, Brand Text Primary text
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

  const brandTitle = scene.brandName || 'Brand';
  const subHeadline = scene.tagline || 'Follow for daily tutorials.';
  const ctaLabel = scene.callToAction || 'Follow';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: theme.colors.bg, // Dynamic Brand Background
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
              color: theme.colors.textPrimary, // Dynamic Brand Text Primary
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
              color: theme.colors.textSecondary, // Dynamic Brand Text Secondary
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
            backgroundColor: theme.colors.primary, // Dynamic Brand Primary CTA fill
            color: theme.colors.textPrimary,
            padding: '16px 36px',
            borderRadius: '50px',
            fontWeight: 'bold',
            fontSize: '24px',
            border: 'none',
            boxShadow: `0 0 25px ${theme.colors.primaryGlow}`,
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
