import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { defaultTheme } from '../styles/theme.js';
import type { OutroScene as OutroSceneType } from '@learnops/schema';

export const OutroScene: React.FC<{ scene: OutroSceneType }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const pulse = interpolate(Math.sin(frame / 10), [-1, 1], [0.98, 1.02]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 80px',
        textAlign: 'center',
      }}
    >
      {/* Brand Card */}
      <div
        style={{
          transform: `scale(${cardSpring * pulse})`,
          opacity: cardSpring,
          backgroundColor: 'rgba(21, 29, 42, 0.9)',
          border: `2px solid ${defaultTheme.colors.primary}`,
          borderRadius: '36px',
          padding: '60px 50px',
          boxShadow: `0 20px 60px ${defaultTheme.colors.primaryGlow}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '30px',
          maxWidth: '880px',
        }}
      >
        {/* Logo Badge */}
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '28px',
            background: `linear-gradient(135deg, ${defaultTheme.colors.primary}, #5528D4)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '54px',
            fontWeight: 900,
            color: '#FFFFFF',
            boxShadow: `0 0 35px ${defaultTheme.colors.primaryGlow}`,
            fontFamily: defaultTheme.fonts.heading,
          }}
        >
          L
        </div>

        <div>
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 900,
              color: defaultTheme.colors.textPrimary,
              fontFamily: defaultTheme.fonts.heading,
              letterSpacing: '-0.02em',
            }}
          >
            {scene.brandName}
          </h1>
          <p
            style={{
              fontSize: '30px',
              color: defaultTheme.colors.textSecondary,
              fontFamily: defaultTheme.fonts.body,
              marginTop: '12px',
            }}
          >
            {scene.tagline}
          </p>
        </div>

        {/* CTA Button */}
        <div
          style={{
            marginTop: '10px',
            padding: '22px 50px',
            borderRadius: '999px',
            backgroundColor: defaultTheme.colors.primary,
            color: '#FFFFFF',
            fontSize: '32px',
            fontWeight: 800,
            fontFamily: defaultTheme.fonts.heading,
            letterSpacing: '0.02em',
            boxShadow: `0 10px 30px ${defaultTheme.colors.primaryGlow}`,
          }}
        >
          {scene.callToAction}
        </div>
      </div>
    </div>
  );
};

