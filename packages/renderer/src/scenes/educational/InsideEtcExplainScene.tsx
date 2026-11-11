import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Network, HardDrive, ShieldCheck } from 'lucide-react';
import { useBrandTheme } from '../../styles/theme.js';

/**
 * Scene 2: Explain
 *
 * Single learning point: Configuration files in /etc are plain text with real, direct system impact.
 * Visual metaphor: Central /etc node branching into 3 configuration file cards.
 * Platform UI Safe Area: Essential content is kept within the upper 80% (top 1536px).
 * Bottom 20% (384px) is strictly reserved for platform UI overlays.
 */
export const InsideEtcExplainScene: React.FC = () => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Entrance spring for header
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Center /etc node spring
  const rootNodeSpring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Cards data with Lucide SVG icons (NO EMOJIS)
  const cards = [
    {
      id: 'hosts',
      icon: Network,
      path: '/etc/hosts',
      desc: 'Name → address',
      tag: 'HOSTS',
    },
    {
      id: 'fstab',
      icon: HardDrive,
      path: '/etc/fstab',
      desc: 'Filesystems at boot',
      tag: 'FSTAB',
    },
    {
      id: 'sshd',
      icon: ShieldCheck,
      path: '/etc/ssh/sshd_config',
      desc: 'SSH server rules',
      tag: 'SSHD_CONFIG',
    },
  ];

  // Subtext entrance
  const subtextSpring = spring({
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
              INSIDE /ETC
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
            Plain files.{' '}
            <span style={{ color: theme.colors.brandPrimary }}>Real effects.</span>
          </h1>
        </div>

        {/* Middle Section: Node Branch & File Cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            margin: 'auto 0',
            width: '100%',
          }}
        >
          {/* Central /etc Root Pill */}
          <div
            style={{
              transform: `scale(${rootNodeSpring})`,
              opacity: rootNodeSpring,
              padding: '14px 44px',
              borderRadius: '18px',
              backgroundColor: theme.colors.brandPrimary,
              boxShadow: `0 0 25px ${theme.colors.primaryGlow}`,
              fontSize: '36px',
              fontWeight: 900,
              fontFamily: theme.fonts.mono,
              color: '#110F17',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            /etc
          </div>

          {/* Vertical Connecting Stem Line */}
          <div
            style={{
              width: '3px',
              height: '24px',
              backgroundColor: theme.colors.brandPrimary,
              opacity: rootNodeSpring,
            }}
          />

          {/* 3 Staggered Configuration File Cards */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              width: '100%',
            }}
          >
            {cards.map((card, idx) => {
              const cardSpring = spring({
                frame: frame - (6 + idx * 5),
                fps,
                config: { damping: 14, stiffness: 130 },
              });

              const IconComponent = card.icon;

              return (
                <div
                  key={card.id}
                  style={{
                    transform: `translateY(${(1 - cardSpring) * 25}px)`,
                    opacity: cardSpring,
                    backgroundColor: theme.colors.cardSurface,
                    borderRadius: '24px',
                    padding: '22px 30px',
                    border: '1.5px solid rgba(255, 255, 255, 0.10)',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
                    {/* Lucide SVG Icon Badge */}
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.colors.brightAccent,
                      }}
                    >
                      <IconComponent size={28} color={theme.colors.brightAccent} strokeWidth={2.2} />
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '24px',
                          fontFamily: theme.fonts.mono,
                          fontWeight: 800,
                          color: theme.colors.brightAccent,
                          marginBottom: '4px',
                        }}
                      >
                        {card.path}
                      </div>
                      <div
                        style={{
                          fontSize: '30px',
                          fontWeight: 800,
                          color: theme.colors.primaryText,
                          fontFamily: theme.fonts.heading,
                        }}
                      >
                        {card.desc}
                      </div>
                    </div>
                  </div>

                  {/* Right Tag */}
                  <div
                    style={{
                      fontSize: '15px',
                      fontFamily: theme.fonts.mono,
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      color: theme.colors.mutedText,
                      textTransform: 'uppercase',
                    }}
                  >
                    {card.tag}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Educational Subtext */}
        <div
          style={{
            transform: `translateY(${(1 - subtextSpring) * 15}px)`,
            opacity: subtextSpring,
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '22px',
              fontFamily: theme.fonts.mono,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: theme.colors.mutedText,
            }}
          >
            CONFIGURATION IS OFTEN HUMAN-READABLE TEXT
          </span>
        </div>
      </div>
    </div>
  );
};
