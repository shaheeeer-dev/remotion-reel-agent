import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { defaultTheme } from '../styles/theme.js';
import type { TerminalScene as TerminalSceneType } from '@learnops/schema';

export const TerminalScene: React.FC<{ scene: TerminalSceneType }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Terminal window entrance
  const windowSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Typing effect calculation
  // Command starts typing at frame 10 and finishes around frame 35
  const charsToType = scene.command.length;
  const typedCount = Math.floor(
    interpolate(frame, [10, 10 + charsToType * 1.5], [0, charsToType], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const displayedCommand = scene.command.slice(0, typedCount);
  const isTypingDone = typedCount === charsToType;

  // Blinking cursor
  const cursorBlink = Math.floor(frame / 8) % 2 === 0;

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
      {/* Terminal Window */}
      <div
        style={{
          transform: `scale(${windowSpring})`,
          opacity: windowSpring,
          backgroundColor: defaultTheme.colors.terminalBg,
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Terminal Title Bar */}
        <div
          style={{
            backgroundColor: defaultTheme.colors.terminalBar,
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Mac window dots */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#FF5F56' }} />
            <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
            <span style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
          </div>

          <span
            style={{
              fontSize: '20px',
              fontFamily: defaultTheme.fonts.mono,
              color: defaultTheme.colors.textMuted,
            }}
          >
            {scene.title || 'learnops@cloud-vps: ~'}
          </span>

          <div style={{ width: '56px' }} />
        </div>

        {/* Terminal Body */}
        <div
          style={{
            padding: '36px',
            minHeight: '480px',
            fontFamily: defaultTheme.fonts.mono,
            fontSize: '28px',
            lineHeight: 1.6,
          }}
        >
          {/* Prompt + Command */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span style={{ color: defaultTheme.colors.primary, fontWeight: 700 }}>
              learnops@vps:~$
            </span>
            <span style={{ color: '#00E5FF', fontWeight: 600 }}>
              {displayedCommand}
            </span>
            {(!isTypingDone || cursorBlink) && (
              <span
                style={{
                  display: 'inline-block',
                  width: '14px',
                  height: '32px',
                  backgroundColor: defaultTheme.colors.primary,
                  verticalAlign: 'middle',
                }}
              />
            )}
          </div>

          {/* Output Lines appearing sequentially */}
          <div
            style={{
              marginTop: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {scene.outputLines.map((line, idx) => {
              const lineStartFrame = 15 + charsToType * 1.5 + idx * 8;
              const lineSpring = spring({
                frame: frame - lineStartFrame,
                fps,
                config: { damping: 14, stiffness: 140 },
              });

              if (frame < lineStartFrame) return null;

              return (
                <div
                  key={idx}
                  style={{
                    opacity: lineSpring,
                    transform: `translateY(${(1 - lineSpring) * 10}px)`,
                    color: line.startsWith('drwx') || line.endsWith('/')
                      ? '#60A5FA'
                      : line.includes('error')
                      ? '#F87171'
                      : '#E2E8F0',
                    fontSize: '26px',
                    wordBreak: 'break-all',
                  }}
                >
                  {line}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Explanation Banner */}
      <div
        style={{
          marginTop: '40px',
          padding: '24px 32px',
          borderRadius: '20px',
          backgroundColor: 'rgba(21, 29, 42, 0.85)',
          border: `1.5px solid ${defaultTheme.colors.bgCardBorder}`,
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
          {scene.explanation}
        </span>
      </div>
    </div>
  );
};

