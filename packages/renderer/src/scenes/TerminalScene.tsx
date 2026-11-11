import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Sparkles, Terminal as TerminalIcon } from 'lucide-react';
import { useBrandTheme, renderHighlightedText } from '../styles/theme.js';
import type { TerminalScene as TerminalSceneType } from '@learnops/schema';

/**
 * Scene 4: Practical Code / Terminal (Content Scene 3)
 *
 * Adheres strictly to the Unified 3-Tier Visual Architecture:
 * - Tier 1 (Top): Kicker & 84px bold headline left-aligned directly on canvas.
 * - Tier 2 (Middle): Interactive terminal window with live command typing.
 * - Tier 3 (Bottom): Explanatory subtext & monospace pill open directly on canvas.
 * - Safe Area: Contained within upper 80% (1536px), bottom 20% clear.
 * - Zero Emojis: Lucide SVG icons only.
 */
export const TerminalScene: React.FC<{ scene: TerminalSceneType }> = ({ scene }) => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animations
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const windowSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const subtextSpring = spring({
    frame: frame - 28,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Typing effect calculation
  const charsToType = scene.command.length;
  const typedCount = Math.floor(
    interpolate(frame, [8, 8 + charsToType * 1.5], [0, charsToType], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const displayedCommand = scene.command.slice(0, typedCount);
  const isTypingDone = typedCount === charsToType;

  // Blinking cursor
  const cursorBlink = Math.floor(frame / 8) % 2 === 0;

  const defaultPrompt = 'learner@linux:~$';
  const promptUser = scene.promptUser || defaultPrompt;

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
              TERMINAL INSPECTION • 03
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
            {renderHighlightedText(scene.title || 'Live System Inspection', '#FFFFFF', theme.colors.brightAccent)}
          </h1>
        </div>

        {/* Tier 2 (Middle): Sleek Mac Terminal Window */}
        <div
          style={{
            transform: `scale(${windowSpring})`,
            opacity: windowSpring,
            backgroundColor: theme.colors.terminalBg,
            border: `1.5px solid ${theme.colors.brandPrimary}`,
            boxShadow: `${theme.colors.cardGlow}, 0 30px 70px rgba(0, 0, 0, 0.70)`,
            borderRadius: '28px',
            overflow: 'hidden',
            margin: 'auto 0',
            width: '100%',
          }}
        >
          {/* Terminal Title Bar */}
          <div
            style={{
              backgroundColor: theme.colors.terminalBar,
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid rgba(255, 255, 255, 0.08)`,
            }}
          >
            {/* Mac window dots */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#FF5F56' }} />
              <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
              <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TerminalIcon size={18} color={theme.colors.mutedText} />
              <span
                style={{
                  fontSize: '18px',
                  fontFamily: theme.fonts.mono,
                  color: theme.colors.mutedText,
                  fontWeight: 700,
                }}
              >
                bash — 80x24
              </span>
            </div>

            <div style={{ width: '56px' }} />
          </div>

          {/* Terminal Body */}
          <div
            style={{
              padding: '36px',
              minHeight: '420px',
              fontFamily: theme.fonts.mono,
              fontSize: '28px',
              lineHeight: 1.6,
            }}
          >
            {/* Prompt + Command Input */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <span style={{ color: theme.colors.brightAccent, fontWeight: 700 }}>
                {promptUser}
              </span>

              <span style={{ color: '#FFFFFF', fontWeight: 700 }}>
                {displayedCommand}
              </span>

              {/* Blinking Cursor */}
              {(!isTypingDone || cursorBlink) && (
                <span
                  style={{
                    display: 'inline-block',
                    width: '14px',
                    height: '28px',
                    backgroundColor: theme.colors.brightAccent,
                    boxShadow: `0 0 10px ${theme.colors.primaryGlow}`,
                  }}
                />
              )}
            </div>

            {/* Output Lines (Reveal once typed) */}
            {isTypingDone && (
              <div
                style={{
                  marginTop: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  opacity: interpolate(frame, [8 + charsToType * 1.5, 8 + charsToType * 1.5 + 8], [0, 1]),
                }}
              >
                {scene.outputLines.map((line, idx) => (
                  <div
                    key={idx}
                    style={{
                      color: line.startsWith('+') || line.includes('PASSED') || line.includes('SUCCESS')
                        ? '#10B981'
                        : line.startsWith('-') || line.includes('ERROR')
                        ? '#EF4444'
                        : theme.colors.mutedText,
                      fontSize: '24px',
                      wordBreak: 'break-all',
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tier 3 (Bottom): Explanatory Subtext & Monospace Pill directly on canvas */}
        <div
          style={{
            transform: `translateY(${(1 - subtextSpring) * 20}px)`,
            opacity: subtextSpring,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'center',
          }}
        >
          {scene.explanation && (
            <p
              style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#FFFFFF',
                margin: 0,
                fontFamily: theme.fonts.heading,
                maxWidth: '920px',
                lineHeight: 1.25,
              }}
            >
              {renderHighlightedText(scene.explanation, '#FFFFFF', theme.colors.brightAccent)}
            </p>
          )}

          <span
            style={{
              fontSize: '20px',
              fontFamily: theme.fonts.mono,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.75)',
            }}
          >
            INTERACTIVE SHELL VERIFICATION
          </span>
        </div>
      </div>
    </div>
  );
};
