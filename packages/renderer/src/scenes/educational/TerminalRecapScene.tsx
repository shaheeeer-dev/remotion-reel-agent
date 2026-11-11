import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBrandTheme } from '../../styles/theme.js';

/**
 * Scene 4: Recap (00:09 - 00:12, 3 sec / 90 frames @ 30fps)
 *
 * Learning Point: Practical command to inspect the directory: `ls /etc`.
 * Visual Metaphor: Interactive terminal window revealing the real configuration files.
 */
export const TerminalRecapScene: React.FC = () => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for header
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Terminal window entrance spring
  const terminalSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  // Typing effect for command "ls /etc"
  const fullCommand = 'ls /etc';
  const typedCount = Math.floor(
    interpolate(frame, [12, 28], [0, fullCommand.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const displayedCommand = fullCommand.slice(0, typedCount);
  const isTypingDone = typedCount === fullCommand.length;

  // Blinking cursor
  const cursorBlink = Math.floor(frame / 6) % 2 === 0;

  // Output lines entrance
  const outputOpacity = interpolate(frame, [30, 42], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Bottom takeaway entrance
  const takeawaySpring = spring({
    frame: frame - 38,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.bg, // Dark matte (#110F17)
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '120px 80px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Top Section: Kicker with Accent Mark & Headline */}
      <div
        style={{
          transform: `translateY(${(1 - headerSpring) * 35}px)`,
          opacity: headerSpring,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px',
          }}
        >
          <span
            style={{
              fontSize: '22px',
              fontFamily: theme.fonts.mono,
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: 'rgba(255, 255, 255, 0.45)',
              textTransform: 'uppercase',
            }}
          >
            TAKE A LOOK
          </span>

          <div
            style={{
              width: '48px',
              height: '6px',
              borderRadius: '999px',
              backgroundColor: theme.colors.primary,
            }}
          />
        </div>

        <h1
          style={{
            fontSize: '80px',
            fontWeight: 900,
            lineHeight: 1.1,
            color: '#FFFFFF',
            letterSpacing: '-0.04em',
            margin: 0,
            fontFamily: theme.fonts.heading,
          }}
        >
          Open the drawer.
        </h1>
      </div>

      {/* Middle Section: Clean macOS/Linux Terminal Window */}
      <div
        style={{
          transform: `scale(${terminalSpring}) translateY(${(1 - terminalSpring) * 40}px)`,
          opacity: terminalSpring,
          backgroundColor: theme.colors.bgCard, // #1C1824
          borderRadius: '28px',
          border: '1.5px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
          margin: 'auto 0',
          width: '100%',
        }}
      >
        {/* Terminal Header Bar */}
        <div
          style={{
            padding: '20px 28px',
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#FF5F56' }} />
          <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
          <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#27C93F' }} />

          <span
            style={{
              fontSize: '16px',
              fontFamily: theme.fonts.mono,
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: 'rgba(255, 255, 255, 0.4)',
              marginLeft: '12px',
              textTransform: 'uppercase',
            }}
          >
            TERMINAL
          </span>
        </div>

        {/* Terminal Body */}
        <div
          style={{
            padding: '44px',
            fontFamily: theme.fonts.mono,
            fontSize: '32px',
            lineHeight: 1.8,
            minHeight: '260px',
          }}
        >
          {/* Prompt + Command */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <span style={{ color: theme.colors.secondary, fontWeight: 800 }}>
              learner@linux:~$
            </span>
            <span style={{ color: '#FFFFFF', fontWeight: 800 }}>
              {displayedCommand.startsWith('ls') ? (
                <>
                  <span style={{ color: '#FFFFFF' }}>ls </span>
                  <span style={{ color: theme.colors.primary, fontWeight: 900 }}>
                    {displayedCommand.slice(3)}
                  </span>
                </>
              ) : (
                displayedCommand
              )}
            </span>

            {/* Blinking Cursor */}
            <span
              style={{
                display: 'inline-block',
                width: '14px',
                height: '32px',
                backgroundColor: cursorBlink ? theme.colors.primary : 'transparent',
                marginLeft: '2px',
                verticalAlign: 'middle',
              }}
            />
          </div>

          {/* Directory Listing Output */}
          <div
            style={{
              opacity: outputOpacity,
              marginTop: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              color: '#FFFFFF',
              fontWeight: 700,
            }}
          >
            <div style={{ display: 'flex', gap: '36px', alignItems: 'center' }}>
              <span>hosts</span>
              <span style={{ color: theme.colors.primary }}>fstab</span>
              <span style={{ color: theme.colors.secondary }}>ssh/</span>
            </div>
            <div style={{ display: 'flex', gap: '36px', alignItems: 'center', color: 'rgba(255, 255, 255, 0.8)' }}>
              <span>hostname</span>
              <span>resolv.conf</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Takeaway & Directory Badge */}
      <div
        style={{
          transform: `translateY(${(1 - takeawaySpring) * 30}px)`,
          opacity: takeawaySpring,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '40px',
            fontWeight: 900,
            color: '#FFFFFF',
            margin: 0,
            fontFamily: theme.fonts.heading,
            letterSpacing: '-0.02em',
          }}
        >
          Look inside. Learn what the system reads.
        </p>

        <span
          style={{
            fontSize: '18px',
            fontFamily: theme.fonts.mono,
            fontWeight: 800,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: theme.colors.primary,
          }}
        >
          LINUX • /ETC DIRECTORY
        </span>
      </div>
    </div>
  );
};
