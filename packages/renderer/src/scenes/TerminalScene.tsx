import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Sparkles } from 'lucide-react';
import { useBrandTheme, renderHighlightedText } from '../styles/theme.js';
import type { TerminalScene as TerminalSceneType } from '@learnops/schema';

/**
 * Scene 3: Practical Code / Terminal (00:08 - 00:14, 6 sec)
 *
 * Rule-based Generalized Dynamic Theming:
 * - Background: Brand Background (Deep dark matte)
 * - Terminal Box: Brand Card / Terminal Background with Brand Primary border & glow
 * - Prompt String: Brand Secondary / Accent color
 * - Command Input: Brand Text Primary (typed)
 * - Output Lines: Brand Text Primary & Secondary
 */
export const TerminalScene: React.FC<{ scene: TerminalSceneType }> = ({ scene }) => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Terminal window entrance
  const windowSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
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
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 60px',
        backgroundColor: theme.colors.bg, // Dynamic Brand Background
      }}
    >
      {/* Terminal Window */}
      <div
        style={{
          transform: `scale(${windowSpring})`,
          opacity: windowSpring,
          backgroundColor: theme.colors.terminalBg, // Dynamic Brand Card Surface
          border: `1px solid ${theme.colors.primary}`, // Dynamic Brand Primary Border
          boxShadow: `${theme.colors.cardGlow}, 0 30px 70px rgba(0, 0, 0, 0.70)`,
          borderRadius: '24px',
          overflow: 'hidden',
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

          <span
            style={{
              fontSize: '18px',
              fontFamily: theme.fonts.mono,
              color: theme.colors.textSecondary,
            }}
          >
            {scene.title || 'learner@linux: ~'}
          </span>

          <div style={{ width: '56px' }} />
        </div>

        {/* Terminal Body */}
        <div
          style={{
            padding: '36px',
            minHeight: '440px',
            fontFamily: theme.fonts.mono,
            fontSize: '28px',
            lineHeight: 1.6,
          }}
        >
          {/* Prompt + Command Input */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {/* Prompt String: Dynamic Brand Secondary / Accent */}
            <span style={{ color: theme.colors.secondary, fontWeight: 700 }}>
              {promptUser}
            </span>

            {/* Command Input: Dynamic Brand Text Primary */}
            <span style={{ color: theme.colors.textPrimary, fontWeight: 700 }}>
              {displayedCommand}
            </span>

            {/* Blinking Cursor */}
            <span
              style={{
                display: 'inline-block',
                width: '14px',
                height: '30px',
                backgroundColor: cursorBlink ? theme.colors.secondary : 'transparent',
                marginLeft: '2px',
                verticalAlign: 'middle',
              }}
            />
          </div>

          {/* Command Output Lines */}
          {isTypingDone && scene.outputLines && scene.outputLines.length > 0 && (
            <div
              style={{
                marginTop: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {scene.outputLines.map((line, idx) => {
                const lineDelay = 8 + charsToType * 1.5 + idx * 4;
                const isLineVisible = frame >= lineDelay;

                if (!isLineVisible) return null;

                const isComment = line.trim().startsWith('#');
                const isSuccess = line.toLowerCase().includes('ok') || line.toLowerCase().includes('success');

                return (
                  <div
                    key={idx}
                    style={{
                      color: isComment
                        ? theme.colors.textSecondary
                        : isSuccess
                        ? theme.colors.success
                        : theme.colors.textPrimary,
                      fontSize: '24px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                    }}
                  >
                    {line}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Explanation Callout */}
      {scene.explanation && (
        <div
          style={{
            marginTop: '22px',
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
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Sparkles size={20} color={theme.colors.secondary} />
            <span>{renderHighlightedText(scene.explanation, theme.colors.textPrimary, theme.colors.secondary)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
