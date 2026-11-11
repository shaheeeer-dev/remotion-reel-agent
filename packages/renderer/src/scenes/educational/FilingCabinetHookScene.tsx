import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBrandTheme } from '../../styles/theme.js';

/**
 * Scene 1: Hook (00:00 - 00:03, 3 sec / 90 frames @ 30fps)
 *
 * Learning Point: Linux system rules & configurations live in one central place (/etc).
 * Visual Metaphor: A "LINUX MACHINE" filing cabinet with an /etc drawer sliding open.
 */
export const FilingCabinetHookScene: React.FC = () => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for top header
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Cabinet entrance spring
  const cabinetSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 15, stiffness: 110 },
  });

  // Drawer sliding out spring (middle /etc drawer slides right)
  const drawerSlide = spring({
    frame: frame - 18,
    fps,
    config: { damping: 12, stiffness: 90 },
  });

  // Subtext entrance
  const subtextSpring = spring({
    frame: frame - 32,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Drawer slide offset in pixels (0px -> 56px)
  const drawerOffset = interpolate(drawerSlide, [0, 1], [0, 56]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.primary, // Vibrant brand primary background (#783CEB or Coral)
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '120px 80px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Top Section: Kicker & Bold Headline */}
      <div
        style={{
          transform: `translateY(${(1 - headerSpring) * 40}px)`,
          opacity: headerSpring,
        }}
      >
        <div
          style={{
            fontSize: '22px',
            fontFamily: theme.fonts.mono,
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: 'rgba(0, 0, 0, 0.65)',
            textTransform: 'uppercase',
            marginBottom: '32px',
          }}
        >
          LINUX FILE SYSTEM • 02
        </div>

        <h1
          style={{
            fontSize: '84px',
            fontWeight: 900,
            lineHeight: 1.08,
            color: '#110F17',
            letterSpacing: '-0.04em',
            margin: 0,
            maxWidth: '920px',
            fontFamily: theme.fonts.heading,
          }}
        >
          Where Linux keeps its rules.
        </h1>
      </div>

      {/* Middle Section: LINUX MACHINE Filing Cabinet Diagram */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${cabinetSpring}) translateY(${(1 - cabinetSpring) * 50}px)`,
          opacity: cabinetSpring,
          margin: 'auto 0',
        }}
      >
        <div
          style={{
            width: '600px',
            backgroundColor: '#110F17',
            borderRadius: '36px',
            padding: '36px',
            boxShadow: '0 35px 80px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative',
          }}
        >
          {/* Cabinet Header Label */}
          <div
            style={{
              fontSize: '18px',
              fontFamily: theme.fonts.mono,
              fontWeight: 800,
              letterSpacing: '0.14em',
              color: 'rgba(255, 255, 255, 0.55)',
              textTransform: 'uppercase',
              paddingLeft: '12px',
            }}
          >
            LINUX MACHINE
          </div>

          {/* Drawer 1: SYSTEM DRAWER 01 */}
          <div
            style={{
              backgroundColor: '#1C1824',
              borderRadius: '20px',
              padding: '24px 32px',
              border: '1.5px solid rgba(255, 255, 255, 0.08)',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'rgba(255, 255, 255, 0.4)',
              fontFamily: theme.fonts.mono,
            }}
          >
            SYSTEM DRAWER 01
          </div>

          {/* Drawer 2 (SLIDING DRAWER): /etc */}
          <div
            style={{
              transform: `translateX(${drawerOffset}px)`,
              backgroundColor: '#1C1824',
              borderRadius: '20px',
              padding: '24px 32px',
              border: `2px solid ${theme.colors.primary}`,
              boxShadow: `0 10px 30px rgba(0, 0, 0, 0.6), 0 0 25px ${theme.colors.primaryGlow}`,
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              fontSize: '32px',
              fontWeight: 900,
              color: theme.colors.primary,
              fontFamily: theme.fonts.mono,
              zIndex: 10,
              transition: 'none',
            }}
          >
            <span style={{ fontSize: '36px' }}>📁</span>
            <span>/etc</span>
          </div>

          {/* Drawer 3: SYSTEM DRAWER 03 */}
          <div
            style={{
              backgroundColor: '#1C1824',
              borderRadius: '20px',
              padding: '24px 32px',
              border: '1.5px solid rgba(255, 255, 255, 0.08)',
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: 'rgba(255, 255, 255, 0.4)',
              fontFamily: theme.fonts.mono,
            }}
          >
            SYSTEM DRAWER 03
          </div>
        </div>
      </div>

      {/* Bottom Section: Explanatory Subtext & Pill */}
      <div
        style={{
          transform: `translateY(${(1 - subtextSpring) * 30}px)`,
          opacity: subtextSpring,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontSize: '36px',
            fontWeight: 800,
            color: '#110F17',
            margin: 0,
            fontFamily: theme.fonts.heading,
          }}
        >
          A directory of configuration files
        </p>

        <span
          style={{
            fontSize: '20px',
            fontFamily: theme.fonts.mono,
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#110F17',
            opacity: 0.8,
          }}
        >
          MACHINE-WIDE SETTINGS
        </span>
      </div>
    </div>
  );
};
