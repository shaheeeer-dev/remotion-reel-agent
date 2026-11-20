import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  Box,
  FileText,
  GitBranch,
  Layers,
  Rocket,
  Server,
  Settings,
  UserRound,
} from 'lucide-react';
import type { ComparisonScene as ComparisonSceneType } from '@learnops/schema';
import { renderHighlightedText, useBrandTheme } from '../styles/theme.js';
import { AnimatedSubtitles } from '../components/AnimatedSubtitles.js';

const iconByName = {
  server: Server,
  user: UserRound,
  layers: Layers,
  box: Box,
  'git-branch': GitBranch,
  rocket: Rocket,
  'file-text': FileText,
  settings: Settings,
} as const;

/**
 * Scene 3: Comparison Scene (Content Scene 2)
 *
 * Adheres strictly to the Unified 3-Tier Visual Architecture:
 * - Tier 1 (Top): Kicker & 84px bold headline left-aligned directly on canvas.
 * - Tier 2 (Middle): Side-by-side comparison cards with clean icon tiles & boundaries.
 * - Tier 3 (Bottom): Explanatory takeaway & monospace pill open directly on canvas.
 * - Safe Area: Contained within upper 80% (1536px), bottom 20% clear.
 * - Zero Emojis: Lucide SVG icons only.
 */
export const ComparisonScene: React.FC<{ scene: ComparisonSceneType }> = ({ scene }) => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animations
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const subtextSpring = spring({
    frame: frame - 28,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const cards = [
    {
      label: scene.leftLabel,
      title: scene.leftTitle,
      description: scene.leftDescription,
      icon: scene.leftIcon || 'layers',
      color: theme.colors.brandPrimary,
      delay: 6,
    },
    {
      label: scene.rightLabel,
      title: scene.rightTitle,
      description: scene.rightDescription,
      icon: scene.rightIcon || 'box',
      color: theme.colors.brightAccent,
      delay: 14,
    },
  ] as const;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.deepBackground, // Deep matte canvas
        overflow: 'hidden',
      }}
    >
      {/* Platform Safe Area Container (Upper 80% = 1536px) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '1080px',
          height: '1536px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '110px 80px 40px 80px',
          boxSizing: 'border-box',
        }}
      >
        {/* Tier 1 (Top): Kicker with Accent Mark & Left-Aligned Headline */}
        <div
          style={{
            transform: `translateY(${(1 - headerSpring) * 35}px)`,
            opacity: headerSpring,
          }}
        >
          {/* Top Kicker Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '28px',
            }}
          >
            <span
              style={{
                fontSize: '22px',
                fontFamily: theme.fonts.mono,
                fontWeight: 800,
                letterSpacing: '0.12em',
                color: theme.colors.mutedText,
                textTransform: 'uppercase',
              }}
            >
              SCOPE & COMPARISON • 02
            </span>

            {/* Accent Line Indicator on Top Right */}
            <div
              style={{
                width: '48px',
                height: '6px',
                borderRadius: '999px',
                backgroundColor: theme.colors.brandPrimary,
              }}
            />
          </div>

          {/* Headline (Left-aligned, massive 84px, white text) */}
          <h1
            style={{
              fontSize: '84px',
              fontWeight: 900,
              lineHeight: 1.08,
              color: '#FFFFFF',
              letterSpacing: '-0.04em',
              margin: 0,
              maxWidth: '920px',
              fontFamily: theme.fonts.heading,
            }}
          >
            {renderHighlightedText(scene.title, '#FFFFFF', theme.colors.brightAccent)}
          </h1>
        </div>

        {/* Tier 2 (Middle): Side-by-Side Comparison Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            margin: 'auto 0',
            width: '100%',
          }}
        >
          {cards.map((card) => {
            const Icon = iconByName[card.icon];
            const entrance = spring({
              frame: frame - card.delay,
              fps,
              config: { damping: 15, stiffness: 120 },
            });

            return (
              <div
                key={card.label}
                style={{
                  opacity: entrance,
                  transform: `translateY(${(1 - entrance) * 35}px)`,
                  backgroundColor: theme.colors.cardSurface,
                  borderRadius: '32px',
                  padding: '38px 34px',
                  border: '1.5px solid #FFFFFF', // White border
                  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45), 0 0 20px rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '440px',
                  boxSizing: 'border-box',
                }}
              >
                <div>
                  {/* Dedicated Icon Badge */}
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '18px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1.5px solid #FFFFFF', // White border
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '26px',
                    }}
                  >
                    <Icon size={34} color="#FFFFFF" strokeWidth={2.2} />
                  </div>

                  <h2
                    style={{
                      fontSize: '38px',
                      fontWeight: 900,
                      color: '#FFFFFF',
                      margin: '0 0 12px 0',
                      letterSpacing: '-0.02em',
                      fontFamily: theme.fonts.heading,
                    }}
                  >
                    {card.title}
                  </h2>

                  <p
                    style={{
                      fontSize: '22px',
                      lineHeight: 1.45,
                      color: theme.colors.mutedText,
                      margin: 0,
                      fontFamily: theme.fonts.body,
                    }}
                  >
                    {card.description}
                  </p>
                </div>

                <div
                  style={{
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '16px',
                    fontFamily: theme.fonts.mono,
                    fontWeight: 800,
                    letterSpacing: '0.1em',
                    color: card.color,
                    textTransform: 'uppercase',
                  }}
                >
                  {card.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tier 3 (Bottom): Animated Subtitles Pill starting immediately from 0:00 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '120px',
            width: '100%',
          }}
        >
          <AnimatedSubtitles
            voiceover={scene.voiceover || scene.takeaway}
            durationSeconds={scene.durationSeconds}
            isHook={false}
            subtitles={scene.subtitles}
          />
        </div>
      </div>
    </div>
  );
};
