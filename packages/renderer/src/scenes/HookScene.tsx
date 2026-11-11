import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBrandTheme, LearnOpsTheme, renderHighlightedText } from '../styles/theme.js';
import type { HookScene as HookSceneType } from '@learnops/schema';

/**
 * Scene 1: The Hook (00:00 - 00:03, 3 sec)
 *
 * Exact Color Mapping:
 * - Background: #783CEB (Brand Purple) full-screen solid
 * - Header Text: #FFFFFF (White)
 * - Card Surface: #1C1824 (Dark Container)
 * - Card Badge: #B28BFF (Lavender) text on #110F17 pill
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

  const hookBg = theme.colors.primary || LearnOpsTheme.brandPurple; // #783CEB

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: hookBg, // Solid full-screen Brand Purple
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
          backgroundColor: LearnOpsTheme.surfaceAmethyst, // #1C1824 (Dark Container)
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
        {/* Card Badge: #B28BFF (Lavender) text on #110F17 pill */}
        <div
          style={{
            transform: `translateY(${(1 - badgeSpring) * 20}px)`,
            opacity: badgeSpring,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 28px',
            borderRadius: '999px',
            backgroundColor: LearnOpsTheme.bgDarkAmethyst, // #110F17 pill
            border: `1.5px solid ${LearnOpsTheme.brandPurple}`, // 1px #783CEB border
            marginBottom: '40px',
          }}
        >
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: LearnOpsTheme.accentLavender, // #B28BFF
              boxShadow: `0 0 10px ${LearnOpsTheme.accentLavender}`,
            }}
          />
          <span
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: LearnOpsTheme.accentLavender, // #B28BFF (Lavender) text
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontFamily: theme.fonts.heading,
            }}
          >
            {scene.badge}
          </span>
        </div>

        {/* Header Text: #FFFFFF (White) Bold Question/Hook Text */}
        <h1
          style={{
            fontSize: '66px',
            fontWeight: 900,
            lineHeight: 1.15,
            color: LearnOpsTheme.textWhite, // #FFFFFF (White)
            fontFamily: theme.fonts.heading,
            letterSpacing: '-0.03em',
            margin: '0 0 28px 0',
            maxWidth: '860px',
          }}
        >
          {renderHighlightedText(scene.headline, LearnOpsTheme.textWhite, LearnOpsTheme.accentLavender)}
        </h1>

        {/* Card Subtext */}
        {scene.subtext && (
          <p
            style={{
              fontSize: '30px',
              lineHeight: 1.45,
              color: LearnOpsTheme.textMutedPurple, // #91899C (Muted Purple)
              fontFamily: theme.fonts.body,
              maxWidth: '800px',
              margin: 0,
            }}
          >
            {renderHighlightedText(scene.subtext, LearnOpsTheme.textMutedPurple, LearnOpsTheme.accentLavender)}
          </p>
        )}
      </div>
    </div>
  );
};
