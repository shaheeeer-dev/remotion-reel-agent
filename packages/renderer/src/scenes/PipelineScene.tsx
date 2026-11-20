import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { GitBranch, Code2, Settings, CheckCircle2, Rocket, ArrowRight, Check } from 'lucide-react';
import { useBrandTheme, renderHighlightedText } from '../styles/theme.js';
import { AnimatedSubtitles } from '../components/AnimatedSubtitles.js';
import type { PipelineScene as PipelineSceneType } from '@learnops/schema';

/**
 * Scene 2: Pipeline Explanation (CI/CD Workflow)
 *
 * Implements the Horizontal 3-Stage Pipeline Layout matching ref_cicd_4s.png:
 * - Tier 1 (Top): Kicker & 84px bold headline left-aligned on canvas.
 * - Tier 2 (Middle):
 *   - Git Trigger header pill: "TRIGGER: git push origin main"
 *   - Horizontal 3-Stage Pipeline: [CODE] → [BUILD] → [TEST]
 *     Each stage in a dedicated vertical card with circular icon badge,
 *     animated horizontal connecting wires, and status pill.
 *   - Monospace telemetry footer: "PIPELINE #104 • 3 OF 3 JOBS PASSED"
 * - Tier 3 (Bottom): Animated Subtitles starting from 0:00.
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

  const triggerSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const pipelineSpring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  const footerSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Calculate dynamic active stages
  const rawStages = scene.stages && scene.stages.length >= 3 ? scene.stages.slice(0, 3) : [
    { name: 'CODE', status: 'success' as const, details: 'git push origin main' },
    { name: 'BUILD', status: 'success' as const, details: 'compile & containerize' },
    { name: 'TEST', status: 'success' as const, details: 'automated test suite' },
  ];

  const stageIcons = [Code2, Settings, CheckCircle2];
  const stageDurationFrames = durationInFrames / 3;

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
              AUTOMATION PIPELINE • 01
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

        {/* Tier 2 (Middle): Horizontal 3-Stage Pipeline Flow */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            margin: 'auto 0',
            width: '100%',
          }}
        >
          {/* Git Trigger Header Pill */}
          <div
            style={{
              transform: `scale(${triggerSpring})`,
              opacity: triggerSpring,
              padding: '12px 32px',
              borderRadius: '999px',
              backgroundColor: theme.colors.cardSurface,
              border: '1.5px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <GitBranch size={24} color="#10B981" strokeWidth={2.4} />
            <span
              style={{
                fontSize: '22px',
                fontWeight: 800,
                fontFamily: theme.fonts.mono,
                color: '#FFFFFF',
              }}
            >
              TRIGGER: {scene.trigger || 'git push origin main'}
            </span>
            <span
              style={{
                fontSize: '13px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10B981',
                color: '#10B981',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: theme.fonts.mono,
              }}
            >
              AUTOMATED
            </span>
          </div>

          {/* Horizontal 3-Stage Pipeline Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              opacity: pipelineSpring,
              transform: `translateY(${(1 - pipelineSpring) * 20}px)`,
            }}
          >
            {rawStages.map((stage, idx) => {
              const cardSpring = spring({
                frame: frame - (8 + idx * 6),
                fps,
                config: { damping: 14, stiffness: 120 },
              });

              const IconComponent = stageIcons[idx % stageIcons.length];
              const isCurrent = frame >= idx * stageDurationFrames;
              const isFinished = frame >= (idx + 1) * stageDurationFrames - 5;

              return (
                <React.Fragment key={stage.name}>
                  {/* Stage Card */}
                  <div
                    style={{
                      flex: 1,
                      minHeight: '340px',
                      backgroundColor: theme.colors.cardSurface,
                      borderRadius: '26px',
                      padding: '28px 22px',
                      border: isCurrent
                        ? '2.5px solid #FFFFFF'
                        : '1.5px solid rgba(255, 255, 255, 0.22)',
                      boxShadow: isCurrent
                        ? '0 16px 45px rgba(0, 0, 0, 0.6), 0 0 25px rgba(255, 255, 255, 0.25)'
                        : '0 12px 30px rgba(0, 0, 0, 0.4)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'center',
                      transform: `scale(${cardSpring})`,
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Top Circular Icon Badge */}
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '20px',
                        backgroundColor: isFinished
                          ? 'rgba(16, 185, 129, 0.16)'
                          : isCurrent
                          ? 'rgba(255, 255, 255, 0.12)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: isFinished
                          ? '2px solid #10B981'
                          : isCurrent
                          ? '2px solid #FFFFFF'
                          : '1px solid rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent
                        size={32}
                        color={isFinished ? '#10B981' : '#FFFFFF'}
                        strokeWidth={2.4}
                      />
                    </div>

                    {/* Stage Header & Subtitle */}
                    <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                      <div
                        style={{
                          fontSize: '15px',
                          fontFamily: theme.fonts.mono,
                          fontWeight: 800,
                          letterSpacing: '0.12em',
                          color: isCurrent ? theme.colors.brightAccent : 'rgba(255, 255, 255, 0.6)',
                          marginBottom: '6px',
                          textTransform: 'uppercase',
                        }}
                      >
                        STAGE 0{idx + 1}
                      </div>

                      <div
                        style={{
                          fontSize: '32px',
                          fontWeight: 900,
                          color: '#FFFFFF',
                          fontFamily: theme.fonts.heading,
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {stage.name.toUpperCase()}
                      </div>

                      <div
                        style={{
                          fontSize: '17px',
                          fontFamily: theme.fonts.mono,
                          color: 'rgba(255, 255, 255, 0.7)',
                          marginTop: '8px',
                          lineHeight: 1.35,
                          maxWidth: '220px',
                        }}
                      >
                        {stage.details || (idx === 0 ? 'git push & lint' : idx === 1 ? 'build image' : 'e2e verify')}
                      </div>
                    </div>

                    {/* Bottom Status Pill */}
                    <div
                      style={{
                        padding: '6px 16px',
                        borderRadius: '999px',
                        backgroundColor: isFinished
                          ? 'rgba(16, 185, 129, 0.18)'
                          : isCurrent
                          ? 'rgba(255, 255, 255, 0.12)'
                          : 'rgba(255, 255, 255, 0.04)',
                        border: isFinished
                          ? '1.5px solid #10B981'
                          : isCurrent
                          ? '1.5px solid #FFFFFF'
                          : '1px solid rgba(255, 255, 255, 0.15)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '14px',
                        fontFamily: theme.fonts.mono,
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        color: isFinished ? '#10B981' : isCurrent ? '#FFFFFF' : theme.colors.mutedText,
                        textTransform: 'uppercase',
                      }}
                    >
                      {isFinished ? (
                        <>
                          <Check size={16} color="#10B981" strokeWidth={3} />
                          <span>PASSED</span>
                        </>
                      ) : isCurrent ? (
                        <span>RUNNING</span>
                      ) : (
                        <span>WAITING</span>
                      )}
                    </div>
                  </div>

                  {/* Horizontal Wire / Arrow connecting stages */}
                  {idx < 2 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '4px',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '3px',
                          backgroundColor: isFinished ? '#10B981' : 'rgba(255, 255, 255, 0.3)',
                          borderRadius: '999px',
                          boxShadow: isFinished ? '0 0 10px rgba(16, 185, 129, 0.6)' : 'none',
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Telemetry Summary Bar */}
          <div
            style={{
              transform: `translateY(${(1 - footerSpring) * 15}px)`,
              opacity: footerSpring,
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 28px',
              borderRadius: '14px',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '17px',
              fontFamily: theme.fonts.mono,
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.75)',
            }}
          >
            <span style={{ color: '#10B981' }}>✓ 3/3 JOBS SUCCEEDED</span>
            <span>•</span>
            <span>PIPELINE RUN #104</span>
            <span>•</span>
            <span style={{ color: theme.colors.brightAccent }}>ZERO DOWNTIME</span>
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
