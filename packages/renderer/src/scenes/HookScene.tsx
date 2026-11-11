import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBrandTheme, renderHighlightedText } from '../styles/theme.js';
import type { HookScene as HookSceneType } from '@learnops/schema';

/**
 * Scene 1: The Hook (00:00 - 00:03, 3 sec)
 *
 * Rule-based Generalized Dynamic Theming:
 * - Background: Brand Primary Color (Full-screen solid)
 * - Header Text: Brand Text Primary (White)
 * - Card Surface: Brand Card / Container Surface
 * - Card Badge: Brand Secondary / Accent text on Brand BG pill
 */
export const HookScene: React.FC<{ scene: HookSceneType }> = ({ scene }) => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Badge entrance spring
  const badgeSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Card container entrance spring
  const cardSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // Subtle floating scale effect
  const pulse = interpolate(Math.sin(frame / 15), [-1, 1], [0.99, 1.01]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.primary, // Dynamic Brand Primary Color (Solid full-screen)
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 60px',
        textAlign: 'center',
        zIndex: 10,
      }}
    >
      {/* Central UI Card Container with subtle shadow */}
      <div
        style={{
          transform: `scale(${cardSpring * pulse}) translateY(${(1 - cardSpring) * 40}px)`,
          opacity: cardSpring,
          backgroundColor: theme.colors.bgCard, // Dynamic Brand Card Surface
          borderRadius: '32px',
          padding: '56px 48px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '960px',
          width: '100%',
        }}
      >
        {/* Card Badge: Secondary Accent text on Brand BG pill */}
        <div
          style={{
            transform: `translateY(${(1 - badgeSpring) * 20}px)`,
            opacity: badgeSpring,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 28px',
            borderRadius: '999px',
            backgroundColor: theme.colors.bg, // Dynamic Brand Background pill
            border: `1.5px solid ${theme.colors.primary}`, // Dynamic Brand Primary border
            marginBottom: '40px',
          }}
        >
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: theme.colors.secondary,
              boxShadow: `0 0 10px ${theme.colors.secondary}`,
            }}
          />
          <span
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: theme.colors.secondary, // Dynamic Brand Secondary / Accent
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: theme.fonts.heading,
            }}
          >
            {scene.badge}
          </span>
        </div>

        {/* Header Text: Bold Question/Hook Text */}
        <h1
          style={{
            fontSize: '66px',
            fontWeight: 900,
            lineHeight: 1.15,
            color: theme.colors.textPrimary, // Dynamic Brand Text Primary
            fontFamily: theme.fonts.heading,
            letterSpacing: '-0.03em',
            margin: '0 0 28px 0',
            maxWidth: '860px',
          }}
        >
          {renderHighlightedText(scene.headline, theme.colors.textPrimary, theme.colors.secondary)}
        </h1>

        {/* Card Subtext */}
        {scene.subtext && (
          <p
            style={{
              fontSize: '30px',
              lineHeight: 1.45,
              color: theme.colors.textSecondary, // Dynamic Brand Secondary Subtext
              fontFamily: theme.fonts.body,
              maxWidth: '800px',
              margin: 0,
            }}
          >
            {renderHighlightedText(scene.subtext, theme.colors.textSecondary, theme.colors.secondary)}
          </p>
        )}
      </div>
    </div>
  );
};
