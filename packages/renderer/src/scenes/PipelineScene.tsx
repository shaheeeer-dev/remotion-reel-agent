import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { GitBranch, Check, Sparkles } from 'lucide-react';
import { useBrandTheme, renderHighlightedText } from '../styles/theme.js';
import type { PipelineScene as PipelineSceneType } from '@learnops/schema';

/**
 * Scene 2 Variant: CI/CD Automated Pipeline Diagram
 *
 * Rule-based Generalized Dynamic Theming:
 * - Background: Brand Background
 * - Stage Cards: Brand Card Surface with Brand Primary border & glow
 * - Primary Text: Brand Text Primary
 * - Active / Highlights: Brand Secondary / Accent
 * - Secondary Subtext & Connectors: Brand Text Secondary
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
        backgroundColor: theme.colors.bg, // Dynamic Brand Background
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
            color: theme.colors.secondary, // Dynamic Brand Secondary
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
            color: theme.colors.textPrimary, // Dynamic Brand Text Primary
            marginTop: '8px',
            fontFamily: theme.fonts.heading,
            letterSpacing: '-0.02em',
          }}
        >
          {renderHighlightedText(scene.title, theme.colors.textPrimary, theme.colors.secondary)}
        </h2>
      </div>

      {/* Trigger Event Banner */}
      <div
        style={{
          backgroundColor: theme.colors.bgCard, // Dynamic Brand Card Surface
          border: `1px solid ${theme.colors.primary}`, // Dynamic Brand Primary Border
          boxShadow: theme.colors.cardGlow,
          borderRadius: '18px',
          padding: '18px 26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '26px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <GitBranch size={26} color={theme.colors.secondary} strokeWidth={2.2} />
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: '24px',
              color: theme.colors.secondary, // Dynamic Brand Secondary
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
            backgroundColor: theme.colors.secondarySurface,
            border: `1px solid ${theme.colors.secondary}`,
            color: theme.colors.secondary,
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
                  backgroundColor: theme.colors.bgCard, // Dynamic Brand Card Surface
                  border: isDone || isActive
                    ? `1.5px solid ${theme.colors.secondary}`
                    : `1px solid ${theme.colors.primary}`,
                  boxShadow: isActive
                    ? theme.colors.cardGlow
                    : 'none',
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
                      ? theme.colors.success
                      : isActive
                      ? theme.colors.secondary
                      : 'rgba(255, 255, 255, 0.05)',
                    color: isDone || isActive ? theme.colors.bg : theme.colors.textSecondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    fontWeight: 900,
                  }}
                >
                  {isDone ? <Check size={22} color="#FFFFFF" strokeWidth={3} /> : index + 1}
                </div>

                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 800,
                    color: theme.colors.textPrimary,
                    fontFamily: theme.fonts.heading,
                  }}
                >
                  {stage.name}
                </div>

                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: isDone ? theme.colors.success : isActive ? theme.colors.secondary : theme.colors.textSecondary,
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
                    color: isDone ? theme.colors.secondary : theme.colors.textSecondary,
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
            backgroundColor: theme.colors.bgCard,
            border: `1px solid ${theme.colors.primary}`,
            boxShadow: theme.colors.cardGlow,
            fontSize: '22px',
            lineHeight: 1.45,
            color: theme.colors.textPrimary,
            fontFamily: theme.fonts.body,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          <Sparkles size={22} color={theme.colors.secondary} />
          <span>{renderHighlightedText(scene.takeaway, theme.colors.textPrimary, theme.colors.secondary)}</span>
        </div>
      )}
    </div>
  );
};
