import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { defaultTheme } from '../styles/theme.js';
import type { HookScene as HookSceneType } from '@learnops/schema';

export const HookScene: React.FC<{ scene: HookSceneType }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Badge entrance spring
  const badgeSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Headline entrance spring (staggered by 6 frames)
  const headlineSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Subtext entrance spring (staggered by 14 frames)
  const subtextSpring = spring({
    frame: frame - 14,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Subtle floating scale effect
  const pulse = interpolate(Math.sin(frame / 15), [-1, 1], [0.99, 1.01]);

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
        transform: `scale(${pulse})`,
      }}
    >
      {/* Category Pill / Badge */}
      <div
        style={{
          transform: `translateY(${(1 - badgeSpring) * 40}px)`,
          opacity: badgeSpring,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 36px',
          borderRadius: '999px',
          background: 'rgba(111, 65, 236, 0.18)',
          border: `2px solid ${defaultTheme.colors.primary}`,
          boxShadow: `0 0 35px ${defaultTheme.colors.primaryGlow}`,
          marginBottom: '50px',
        }}
      >
        <span
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: defaultTheme.colors.primary,
            boxShadow: `0 0 12px ${defaultTheme.colors.primary}`,
          }}
        />
        <span
          style={{
            fontSize: '28px',
            fontWeight: 800,
            color: defaultTheme.colors.secondary,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: defaultTheme.fonts.heading,
          }}
        >
          {scene.badge}
        </span>
      </div>

      {/* Main Hook Headline */}
      <div
        style={{
          transform: `translateY(${(1 - headlineSpring) * 60}px)`,
          opacity: headlineSpring,
          fontSize: '72px',
          fontWeight: 900,
          lineHeight: 1.15,
          color: defaultTheme.colors.textPrimary,
          fontFamily: defaultTheme.fonts.heading,
          letterSpacing: '-0.03em',
          marginBottom: '40px',
          maxWidth: '920px',
        }}
      >
        {scene.headline}
      </div>

      {/* Subtext description */}
      {scene.subtext && (
        <div
          style={{
            transform: `translateY(${(1 - subtextSpring) * 40}px)`,
            opacity: subtextSpring,
            fontSize: '34px',
            lineHeight: 1.45,
            color: defaultTheme.colors.textSecondary,
            fontFamily: defaultTheme.fonts.body,
            maxWidth: '820px',
            padding: '28px 40px',
            borderRadius: '20px',
            backgroundColor: 'rgba(21, 29, 42, 0.7)',
            border: `1px solid ${defaultTheme.colors.bgCardBorder}`,
            backdropFilter: 'blur(10px)',
          }}
        >
          {scene.subtext}
        </div>
      )}
    </div>
  );
};

