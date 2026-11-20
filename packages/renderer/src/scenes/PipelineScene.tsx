import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { GitBranch, CheckCircle2, Box, Layers, FileText, Rocket } from 'lucide-react';
import { useBrandTheme, renderHighlightedText } from '../styles/theme.js';
import { AnimatedSubtitles } from '../components/AnimatedSubtitles.js';
import type { PipelineScene as PipelineSceneType } from '@learnops/schema';

/**
 * Scene 2: Pipeline Explanation (CI/CD Workflow)
 *
 * Adheres strictly to the Unified 3-Tier Visual Architecture:
 * - Tier 1 (Top): Kicker & 84px bold headline left-aligned directly on canvas.
 * - Tier 2 (Middle): Vertical 3-card stack branching from a central Git trigger node.
 * - Tier 3 (Bottom): Explanatory subtext & monospace pill open directly on canvas.
 * - Safe Area: Contained within upper 80% (1536px), bottom 20% clear.
 * - Zero Emojis: Lucide SVG icons only.
 */
export const PipelineScene: React.FC<{ scene: PipelineSceneType }> = ({ scene }) => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Entrance spring animations
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const nodeSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const subtextSpring = spring({
    frame: frame - 28,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Calculate dynamic active stages
  const stageDurationFrames = durationInFrames / Math.max(1, scene.stages.length);

  const stageIcons = [FileText, Layers, Rocket, Box];

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
              DEVOPS WORKFLOW • 01
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

        {/* Tier 2 (Middle): Vertical 3-Card Stack with Trigger Node */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            margin: 'auto 0',
            width: '100%',
          }}
        >
          {/* Central Git Trigger Root Pill */}
          <div
            style={{
              transform: `scale(${nodeSpring})`,
              opacity: nodeSpring,
              padding: '14px 38px',
              borderRadius: '18px',
              backgroundColor: theme.colors.cardSurface,
              border: '1.5px solid #FFFFFF', // White border
              boxShadow: '0 0 25px rgba(255, 255, 255, 0.15)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <GitBranch size={28} color="#FFFFFF" strokeWidth={2.4} />
            <span
              style={{
                fontSize: '26px',
                fontWeight: 800,
                fontFamily: theme.fonts.mono,
                color: '#FFFFFF',
              }}
            >
              {scene.trigger}
            </span>
            <span
              style={{
                fontSize: '15px',
                padding: '4px 12px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid #FFFFFF',
                color: '#FFFFFF',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontFamily: theme.fonts.mono,
              }}
            >
              TRIGGERED
            </span>
          </div>

          {/* Vertical Connecting Stem Line */}
          <div
            style={{
              width: '3px',
              height: '24px',
              backgroundColor: '#FFFFFF',
              opacity: nodeSpring,
            }}
          />

          {/* 3 Staggered Pipeline Stage Cards */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              width: '100%',
            }}
          >
            {scene.stages.slice(0, 3).map((stage, idx) => {
              const cardSpring = spring({
                frame: frame - (6 + idx * 5),
                fps,
                config: { damping: 14, stiffness: 130 },
              });

              const IconComponent = stageIcons[idx % stageIcons.length];
              const isCurrent = frame >= idx * stageDurationFrames;
              const isFinished = frame >= (idx + 1) * stageDurationFrames;

              return (
                <div
                  key={stage.name}
                  style={{
                    transform: `translateY(${(1 - cardSpring) * 25}px)`,
                    opacity: cardSpring,
                    backgroundColor: theme.colors.cardSurface,
                    borderRadius: '24px',
                    padding: '22px 30px',
                    border: isCurrent
                      ? '2px solid #FFFFFF' // White border on active
                      : '1.5px solid rgba(255, 255, 255, 0.25)', // White border on inactive
                    boxShadow: isCurrent
                      ? '0 15px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(255, 255, 255, 0.2)'
                      : '0 15px 40px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
                    {/* Lucide SVG Icon Badge */}
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        border: isCurrent
                          ? '1.5px solid #FFFFFF'
                          : '1px solid rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent
                        size={28}
                        color="#FFFFFF"
                        strokeWidth={2.2}
                      />
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '22px',
                          fontFamily: theme.fonts.mono,
                          fontWeight: 800,
                          color: isCurrent ? theme.colors.brightAccent : 'rgba(255, 255, 255, 0.65)',
                          marginBottom: '4px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        STAGE 0{idx + 1} • {stage.name}
                      </div>
                      <div
                        style={{
                          fontSize: '30px',
                          fontWeight: 800,
                          color: '#FFFFFF',
                          fontFamily: theme.fonts.heading,
                        }}
                      >
                        {stage.details || (idx === 0 ? 'Compile & Lint Artifacts' : idx === 1 ? 'Automated Unit & E2E Tests' : 'Zero-Downtime Container Deploy')}
                      </div>
                    </div>
                  </div>

                  {/* Right Status Badge */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '16px',
                      fontFamily: theme.fonts.mono,
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      color: isFinished ? '#10B981' : isCurrent ? theme.colors.brightAccent : theme.colors.mutedText,
                      textTransform: 'uppercase',
                    }}
                  >
                    {isFinished && <CheckCircle2 size={20} color="#10B981" />}
                    <span>{isFinished ? 'PASSED' : isCurrent ? 'RUNNING' : 'PENDING'}</span>
                  </div>
                </div>
              );
            })}
          </div>
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
