import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBrandTheme, LearnOpsTheme, renderHighlightedText } from '../styles/theme.js';
import type { TerminalScene as TerminalSceneType } from '@learnops/schema';

/**
 * Scene 3: Practical Code / Terminal (00:08 - 00:14, 6 sec)
 *
 * Exact Color Mapping:
 * - Background: #110F17 (Dark Amethyst)
 * - Terminal Box: #1C1824 with 1px solid #783CEB border & glow
 * - Prompt String (`learner@linux:~$`): #B28BFF (Lavender)
 * - Command Input (typed): #FFFFFF (White)
 * - Output Lines: #FFFFFF (White), comments/subtext in #91899C
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
  // Command starts typing at frame 8 and finishes around frame 32
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

  // Prompt string formatting: user learner@linux:~$
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
        backgroundColor: LearnOpsTheme.bgDarkAmethyst, // #110F17 matte
      }}
    >
      {/* Terminal Window */}
      <div
        style={{
          transform: `scale(${windowSpring})`,
          opacity: windowSpring,
          backgroundColor: LearnOpsTheme.surfaceAmethyst, // #1C1824
          border: `1px solid ${LearnOpsTheme.brandPurple}`, // 1px solid #783CEB
          boxShadow: '0 0 15px rgba(120, 60, 235, 0.20), 0 30px 70px rgba(0, 0, 0, 0.70)',
          borderRadius: '24px',
          overflow: 'hidden',
        }}
      >
        {/* Terminal Title Bar */}
        <div
          style={{
            backgroundColor: '#15131C',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(120, 60, 235, 0.25)',
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
              color: LearnOpsTheme.textMutedPurple, // #91899C
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
            {/* Prompt String (~$): #B28BFF (Lavender) */}
            <span style={{ color: LearnOpsTheme.accentLavender, fontWeight: 700 }}>
              {promptUser}
            </span>

            {/* Command Input: #FFFFFF (White) */}
            <span style={{ color: LearnOpsTheme.textWhite, fontWeight: 700 }}>
              {displayedCommand}
            </span>

            {/* Blinking Cursor */}
            <span
              style={{
                display: 'inline-block',
                width: '14px',
                height: '30px',
                backgroundColor: cursorBlink ? LearnOpsTheme.accentLavender : 'transparent',
                marginLeft: '2px',
                verticalAlign: 'middle',
              }}
            />
          </div>

          {/* Command Output Lines (Appears after command is typed) */}
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
                        ? LearnOpsTheme.textMutedPurple // #91899C
                        : isSuccess
                        ? '#34B1AA'
                        : LearnOpsTheme.textWhite, // #FFFFFF
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
          💡 {renderHighlightedText(scene.explanation, LearnOpsTheme.textWhite, LearnOpsTheme.accentLavender)}
        </div>
      )}
    </div>
  );
};
