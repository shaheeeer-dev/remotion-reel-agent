import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { defaultTheme } from '../styles/theme.js';
import type { PipelineScene as PipelineSceneType } from '@learnops/schema';

export const PipelineScene: React.FC<{ scene: PipelineSceneType }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Header animation
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Calculate dynamic active stage based on current frame progression
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
      }}
    >
      {/* Title */}
      <div
        style={{
          transform: `translateY(${(1 - headerSpring) * 30}px)`,
          opacity: headerSpring,
          textAlign: 'center',
          marginBottom: '32px',
        }}
      >
        <span
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: defaultTheme.colors.success,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: defaultTheme.fonts.heading,
          }}
        >
          DevOps Workflow
        </span>
        <h2
          style={{
            fontSize: '52px',
            fontWeight: 800,
            color: defaultTheme.colors.textPrimary,
            marginTop: '8px',
            fontFamily: defaultTheme.fonts.heading,
            letterSpacing: '-0.02em',
          }}
        >
          {scene.title}
        </h2>
      </div>

      {/* Trigger Event Banner */}
      <div
        style={{
          backgroundColor: 'rgba(21, 29, 42, 0.85)',
          border: `1.5px solid ${defaultTheme.colors.bgCardBorder}`,
          borderRadius: '18px',
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '28px' }}>🚀</span>
          <span
            style={{
              fontFamily: defaultTheme.fonts.mono,
              fontSize: '24px',
              color: defaultTheme.colors.primary,
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
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${defaultTheme.colors.success}`,
            color: defaultTheme.colors.success,
            fontSize: '18px',
            fontWeight: 700,
            fontFamily: defaultTheme.fonts.mono,
          }}
        >
          TRIGGERED
        </span>
      </div>

      {/* Pipeline Stage Cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          position: 'relative',
        }}
      >
        {scene.stages.map((stage, idx) => {
          const stageStartFrame = idx * stageDurationFrames;
          const stageFinishedFrame = stageStartFrame + stageDurationFrames * 0.75;

          const isStarted = frame >= stageStartFrame;
          const isFinished = frame >= stageFinishedFrame;

          const stageSpring = spring({
            frame: frame - (10 + idx * 8),
            fps,
            config: { damping: 14, stiffness: 120 },
          });

          const statusColor = isFinished
            ? defaultTheme.colors.success
            : isStarted
            ? defaultTheme.colors.primary
            : defaultTheme.colors.textMuted;

          const statusLabel = isFinished
            ? 'PASSED'
            : isStarted
            ? 'RUNNING...'
            : 'PENDING';

          return (
            <div
              key={stage.name}
              style={{
                transform: `translateX(${(1 - stageSpring) * 30}px)`,
                opacity: stageSpring,
                backgroundColor: isStarted
                  ? 'rgba(21, 29, 42, 0.95)'
                  : 'rgba(15, 23, 42, 0.5)',
                border: isStarted
                  ? `2px solid ${statusColor}`
                  : '1.5px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '20px',
                padding: '24px 30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: isStarted ? `0 8px 30px rgba(0, 0, 0, 0.4)` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {/* Stage Number / Status Icon */}
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: isFinished
                      ? defaultTheme.colors.success
                      : isStarted
                      ? 'rgba(255, 107, 0, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: `2px solid ${statusColor}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 800,
                    color: isFinished ? '#FFFFFF' : statusColor,
                    boxShadow: isStarted ? `0 0 15px ${statusColor}` : 'none',
                  }}
                >
                  {isFinished ? '✓' : idx + 1}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '30px',
                      fontWeight: 800,
                      color: isStarted ? defaultTheme.colors.textPrimary : defaultTheme.colors.textMuted,
                      fontFamily: defaultTheme.fonts.heading,
                    }}
                  >
                    {stage.name}
                  </div>
                  {stage.details && (
                    <div
                      style={{
                        fontSize: '20px',
                        color: defaultTheme.colors.textSecondary,
                        fontFamily: defaultTheme.fonts.mono,
                        marginTop: '4px',
                      }}
                    >
                      {stage.details}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Pill */}
              <div
                style={{
                  padding: '8px 18px',
                  borderRadius: '999px',
                  backgroundColor: isFinished
                    ? 'rgba(16, 185, 129, 0.15)'
                    : isStarted
                    ? 'rgba(255, 107, 0, 0.15)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: `1.5px solid ${statusColor}`,
                  color: statusColor,
                  fontSize: '18px',
                  fontWeight: 700,
                  fontFamily: defaultTheme.fonts.mono,
                  letterSpacing: '0.05em',
                }}
              >
                {statusLabel}
              </div>
            </div>
          );
        })}
      </div>

      {/* Takeaway / Summary Banner */}
      <div
        style={{
          marginTop: '36px',
          padding: '24px 32px',
          borderRadius: '20px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderLeft: `6px solid ${defaultTheme.colors.success}`,
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <span style={{ fontSize: '36px' }}>⚡</span>
        <span
          style={{
            fontSize: '28px',
            lineHeight: 1.4,
            color: defaultTheme.colors.textPrimary,
            fontFamily: defaultTheme.fonts.body,
            fontWeight: 500,
          }}
        >
          {scene.takeaway}
        </span>
      </div>
    </div>
  );
};

