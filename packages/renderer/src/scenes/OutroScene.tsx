import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBrandTheme } from '../styles/theme.js';
import type { OutroScene as OutroSceneType } from '@learnops/schema';

export const OutroScene: React.FC<{ scene: OutroSceneType }> = ({ scene }) => {
  const theme = useBrandTheme();
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
          backgroundColor: theme.colors.bgCard,
          border: `2px solid ${theme.colors.primary}`,
          borderRadius: '36px',
          padding: '60px 50px',
          boxShadow: `0 20px 60px ${theme.colors.primaryGlow}`,
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
            background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '54px',
            fontWeight: 900,
            color: '#FFFFFF',
            boxShadow: `0 0 35px ${theme.colors.primaryGlow}`,
            fontFamily: theme.fonts.heading,
          }}
        >
          {scene.brandName.slice(0, 1).toUpperCase()}
        </div>

        <div>
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 900,
              color: theme.colors.textPrimary,
              fontFamily: theme.fonts.heading,
              letterSpacing: '-0.02em',
            }}
          >
            {scene.brandName}
          </h1>
          <p
            style={{
              fontSize: '30px',
              color: theme.colors.textSecondary,
              fontFamily: theme.fonts.body,
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
            backgroundColor: theme.colors.primary,
            color: '#FFFFFF',
            fontSize: '32px',
            fontWeight: 800,
            fontFamily: theme.fonts.heading,
            letterSpacing: '0.02em',
            boxShadow: `0 10px 30px ${theme.colors.primaryGlow}`,
          }}
        >
          {scene.callToAction}
        </div>

        {/* Creator / Open Source Project Credit (Optional) */}
        {scene.creatorCredit && (
          <div
            style={{
              fontSize: '20px',
              color: theme.colors.textMuted,
              fontFamily: theme.fonts.mono,
              letterSpacing: '0.04em',
              marginTop: '4px',
            }}
          >
            {scene.creatorCredit}
          </div>
        )}
      </div>
    </div>
  );
};

