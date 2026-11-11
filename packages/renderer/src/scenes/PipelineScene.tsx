import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBrandTheme, LearnOpsTheme, renderHighlightedText } from '../styles/theme.js';
import type { PipelineScene as PipelineSceneType } from '@learnops/schema';

/**
 * Scene 2 Variant: CI/CD Automated Pipeline Diagram
 *
 * Exact Color Mapping:
 * - Background: #110F17 (Dark Amethyst)
 * - Stage Cards: #1C1824 with 1px solid #783CEB border & glow
 * - Primary Text: #FFFFFF (White)
 * - Active / Highlights: #B28BFF (Lavender)
 * - Secondary Subtext & Connectors: #91899C (Muted Purple)
 */
export const PipelineScene: React.FC<{ scene: PipelineSceneType }> = ({ scene }) => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Header animation
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Calculate dynamic active stage based on frame progression
  const stageDurationFrames = durationInFrames / scene.stages.length;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 60px',
        backgroundColor: LearnOpsTheme.bgDarkAmethyst, // #110F17 matte
      }}
    >
      {/* Title */}
      <div
        style={{
          transform: `translateY(${(1 - headerSpring) * 30}px)`,
          opacity: headerSpring,
          textAlign: 'center',
          marginBottom: '28px',
        }}
      >
        <span
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: LearnOpsTheme.accentLavender, // #B28BFF
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontFamily: theme.fonts.heading,
          }}
        >
          DevOps Workflow
        </span>
        <h2
          style={{
            fontSize: '52px',
            fontWeight: 900,
            color: LearnOpsTheme.textWhite, // #FFFFFF
            marginTop: '8px',
            fontFamily: theme.fonts.heading,
            letterSpacing: '-0.02em',
          }}
        >
          {renderHighlightedText(scene.title, LearnOpsTheme.textWhite, LearnOpsTheme.accentLavender)}
        </h2>
      </div>

      {/* Trigger Event Banner */}
      <div
        style={{
          backgroundColor: LearnOpsTheme.surfaceAmethyst, // #1C1824
          border: `1px solid ${LearnOpsTheme.brandPurple}`, // 1px #783CEB
          boxShadow: '0 0 15px rgba(120, 60, 235, 0.20)',
          borderRadius: '18px',
          padding: '18px 26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '26px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '28px' }}>🚀</span>
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: '24px',
              color: LearnOpsTheme.accentLavender, // #B28BFF
              fontWeight: 700,
            }}
          >
            {scene.trigger}
          </span>
        </div>
        <span
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(52, 177, 170, 0.15)',
            border: '1px solid #34B1AA',
            color: '#34B1AA',
            fontSize: '16px',
            fontWeight: 800,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          Triggered
        </span>
      </div>

      {/* Pipeline Stages Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          position: 'relative',
        }}
      >
        {scene.stages.map((stage, index) => {
          const stageSpring = spring({
            frame: frame - (15 + index * 10),
            fps,
            config: { damping: 14, stiffness: 120 },
          });

          const isActive = frame >= index * stageDurationFrames;
          const isDone = frame >= (index + 1) * stageDurationFrames;

          return (
            <React.Fragment key={stage.name}>
              {/* Pipeline Step Card */}
              <div
                style={{
                  flex: 1,
                  transform: `translateY(${(1 - stageSpring) * 30}px)`,
                  opacity: stageSpring,
                  backgroundColor: LearnOpsTheme.surfaceAmethyst, // #1C1824
                  border: isDone || isActive
                    ? `1.5px solid ${LearnOpsTheme.accentLavender}`
                    : `1px solid ${LearnOpsTheme.brandPurple}`,
                  boxShadow: isActive
                    ? '0 0 20px rgba(178, 139, 255, 0.35)'
                    : '0 0 15px rgba(120, 60, 235, 0.20)',
                  borderRadius: '20px',
                  padding: '24px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: isDone
                      ? '#34B1AA'
                      : isActive
                      ? LearnOpsTheme.accentLavender
                      : 'rgba(255, 255, 255, 0.05)',
                    color: isDone || isActive ? '#110F17' : LearnOpsTheme.textMutedPurple,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    fontWeight: 900,
                  }}
                >
                  {isDone ? '✓' : index + 1}
                </div>

                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    color: LearnOpsTheme.textWhite,
                    fontFamily: theme.fonts.heading,
                  }}
                >
                  {stage.name}
                </div>

                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isDone ? '#34B1AA' : isActive ? LearnOpsTheme.accentLavender : LearnOpsTheme.textMutedPurple,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {isDone ? 'Passed' : isActive ? 'Running...' : 'Pending'}
                </span>
              </div>

              {/* Connecting arrow if not last */}
              {index < scene.stages.length - 1 && (
                <div
                  style={{
                    fontSize: '28px',
                    color: isDone ? LearnOpsTheme.accentLavender : LearnOpsTheme.textMutedPurple, // #91899C
                    fontWeight: 900,
                  }}
                >
                  →
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Takeaway Card */}
      {scene.takeaway && (
        <div
          style={{
            marginTop: '26px',
            padding: '18px 26px',
            borderRadius: '16px',
            backgroundColor: LearnOpsTheme.surfaceAmethyst, // #1C1824
            border: `1px solid ${LearnOpsTheme.brandPurple}`, // 1px #783CEB
            boxShadow: '0 0 15px rgba(120, 60, 235, 0.20)',
            fontSize: '22px',
            lineHeight: 1.45,
            color: LearnOpsTheme.textWhite,
            fontFamily: theme.fonts.body,
            textAlign: 'center',
          }}
        >
          ✨ {renderHighlightedText(scene.takeaway, LearnOpsTheme.textWhite, LearnOpsTheme.accentLavender)}
        </div>
      )}
    </div>
  );
};
