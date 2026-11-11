import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Folder } from 'lucide-react';
import { useBrandTheme } from '../../styles/theme.js';

/**
 * Scene 1: Hook
 *
 * Single learning point: Linux system rules & configurations live in one central place (/etc).
 * Visual metaphor: A "LINUX MACHINE" filing cabinet with an /etc drawer sliding open.
 * Platform UI Safe Area: Essential content is kept within the upper 80% (top 1536px).
 * Bottom 20% (384px) is strictly reserved for platform UI overlays.
 */
export const FilingCabinetHookScene: React.FC = () => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Scale spring animations relative to scene duration
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const cabinetSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 15, stiffness: 110 },
  });

  const drawerSlide = spring({
    frame: frame - 18,
    fps,
    config: { damping: 12, stiffness: 90 },
  });

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
        backgroundColor: theme.colors.brandPrimary, // Dynamic Brand Primary background
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
              marginBottom: '28px',
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
            transform: `scale(${cabinetSpring}) translateY(${(1 - cabinetSpring) * 40}px)`,
            opacity: cabinetSpring,
            margin: 'auto 0',
          }}
        >
          <div
            style={{
              width: '620px',
              backgroundColor: theme.colors.deepBackground,
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
                backgroundColor: theme.colors.cardSurface,
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

            {/* Drawer 2 (SLIDING ACTIVE DRAWER): /etc with Lucide Folder Icon (NO EMOJIS) */}
            <div
              style={{
                transform: `translateX(${drawerOffset}px)`,
                backgroundColor: theme.colors.cardSurface,
                borderRadius: '20px',
                padding: '24px 32px',
                border: `2px solid ${theme.colors.brandPrimary}`,
                boxShadow: `0 10px 30px rgba(0, 0, 0, 0.6), 0 0 25px ${theme.colors.primaryGlow}`,
                display: 'flex',
                alignItems: 'center',
                gap: '18px',
                fontSize: '32px',
                fontWeight: 900,
                color: theme.colors.brandPrimary,
                fontFamily: theme.fonts.mono,
                zIndex: 10,
                transition: 'none',
              }}
            >
              <Folder size={36} color={theme.colors.brandPrimary} strokeWidth={2.5} />
              <span>/etc</span>
            </div>

            {/* Drawer 3: SYSTEM DRAWER 03 */}
            <div
              style={{
                backgroundColor: theme.colors.cardSurface,
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
            transform: `translateY(${(1 - subtextSpring) * 25}px)`,
            opacity: subtextSpring,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
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
    </div>
  );
};
