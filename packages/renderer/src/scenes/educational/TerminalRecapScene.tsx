import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Terminal, Folder } from 'lucide-react';
import { useBrandTheme } from '../../styles/theme.js';

interface TerminalRecapSceneProps {
  brandName?: string;
}

/**
 * Scene 4: Recap
 *
 * Single learning point: Practical command to inspect the directory: `ls /etc`.
 * Visual metaphor: Interactive terminal window revealing the real configuration files.
 * Platform UI Safe Area: Essential content is kept within the upper 80% (top 1536px).
 * Bottom 20% (384px) is strictly reserved for platform UI overlays.
 */
export const TerminalRecapScene: React.FC<TerminalRecapSceneProps> = ({ brandName = 'LearnOps' }) => {
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
        backgroundColor: theme.colors.deepBackground, // Deep dark matte background
        overflow: 'hidden',
      }}
    >
      {/* 
        Platform Safe Area Container:
        Height: 1536px (Upper 4/5ths, 80% of 1920px)
        Leaves the bottom 384px completely unobstructed for platform UI overlays.
      */}
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
              TAKE A LOOK
            </span>

            <div
              style={{
                width: '48px',
                height: '6px',
                borderRadius: '999px',
                backgroundColor: theme.colors.brandPrimary,
              }}
            />
          </div>

          <h1
            style={{
              fontSize: '80px',
              fontWeight: 900,
              lineHeight: 1.1,
              color: theme.colors.primaryText,
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
            backgroundColor: theme.colors.cardSurface,
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
              padding: '18px 26px',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ width: '13px', height: '13px', borderRadius: '50%', backgroundColor: '#FF5F56' }} />
              <span style={{ width: '13px', height: '13px', borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
              <span style={{ width: '13px', height: '13px', borderRadius: '50%', backgroundColor: '#27C93F' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={17} color="rgba(255, 255, 255, 0.5)" />
              <span
                style={{
                  fontSize: '15px',
                  fontFamily: theme.fonts.mono,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  color: 'rgba(255, 255, 255, 0.45)',
                  textTransform: 'uppercase',
                }}
              >
                TERMINAL
              </span>
            </div>
          </div>

          {/* Terminal Body */}
          <div
            style={{
              padding: '40px',
              fontFamily: theme.fonts.mono,
              fontSize: '30px',
              lineHeight: 1.8,
              minHeight: '250px',
            }}
          >
            {/* Prompt + Command */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <span style={{ color: theme.colors.brightAccent, fontWeight: 800 }}>
                learner@linux:~$
              </span>
              <span style={{ color: '#FFFFFF', fontWeight: 800 }}>
                {displayedCommand.startsWith('ls') ? (
                  <>
                    <span style={{ color: '#FFFFFF' }}>ls </span>
                    <span style={{ color: theme.colors.brandPrimary, fontWeight: 900 }}>
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
                  width: '13px',
                  height: '30px',
                  backgroundColor: cursorBlink ? theme.colors.brightAccent : 'transparent',
                  marginLeft: '2px',
                  verticalAlign: 'middle',
                }}
              />
            </div>

            {/* Directory Listing Output with Lucide Folder Icon (NO EMOJIS) */}
            <div
              style={{
                opacity: outputOpacity,
                marginTop: '26px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                color: theme.colors.primaryText,
                fontWeight: 700,
              }}
            >
              <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                <span>hosts</span>
                <span style={{ color: theme.colors.brandPrimary }}>fstab</span>
                <span style={{ color: theme.colors.brightAccent, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Folder size={22} color={theme.colors.brightAccent} strokeWidth={2.2} />
                  ssh/
                </span>
              </div>
              <div style={{ display: 'flex', gap: '32px', alignItems: 'center', color: 'rgba(255, 255, 255, 0.8)' }}>
                <span>hostname</span>
                <span>resolv.conf</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.4)' }}>...</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Takeaway & Dynamic Brand Badge */}
        <div
          style={{
            transform: `translateY(${(1 - takeawaySpring) * 25}px)`,
            opacity: takeawaySpring,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '40px',
              fontWeight: 900,
              color: theme.colors.primaryText,
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
              color: theme.colors.brightAccent,
            }}
          >
            {brandName.toUpperCase()} • /ETC DIRECTORY
          </span>
        </div>
      </div>
    </div>
  );
};
