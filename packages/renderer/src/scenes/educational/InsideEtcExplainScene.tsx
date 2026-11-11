import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBrandTheme } from '../../styles/theme.js';

/**
 * Scene 2: Explain (00:03 - 00:06, 3 sec / 90 frames @ 30fps)
 *
 * Learning Point: Configuration files in /etc are plain text with real, direct system impact.
 * Visual Metaphor: Central /etc node branching into 3 configuration file cards.
 */
export const InsideEtcExplainScene: React.FC = () => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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

  // Cards data matching reference video exactly
  const cards = [
    {
      id: 'hosts',
      icon: '↔',
      path: '/etc/hosts',
      desc: 'Name → address',
      tag: 'HOSTS',
    },
    {
      id: 'fstab',
      icon: '𝌆',
      path: '/etc/fstab',
      desc: 'Filesystems at boot',
      tag: 'FSTAB',
    },
    {
      id: 'sshd',
      icon: '⌘',
      path: '/etc/ssh/sshd_config',
      desc: 'SSH server rules',
      tag: 'SSHD_CONFIG',
    },
  ];

  // Subtext entrance
  const subtextSpring = spring({
    frame: frame - 42,
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
            INSIDE /ETC
          </span>

          {/* Accent Line Indicator on Top Right */}
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
          Plain files.{' '}
          <span style={{ color: theme.colors.primary }}>Real effects.</span>
        </h1>
      </div>

      {/* Middle Section: Node Branch & File Cards */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
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
            backgroundColor: theme.colors.primary,
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
            height: '28px',
            backgroundColor: theme.colors.primary,
            opacity: rootNodeSpring,
          }}
        />

        {/* 3 Staggered Configuration File Cards */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            width: '100%',
          }}
        >
          {cards.map((card, idx) => {
            const cardSpring = spring({
              frame: frame - (6 + idx * 5),
              fps,
              config: { damping: 14, stiffness: 130 },
            });

            return (
              <div
                key={card.id}
                style={{
                  transform: `translateY(${(1 - cardSpring) * 30}px)`,
                  opacity: cardSpring,
                  backgroundColor: '#1C1824',
                  borderRadius: '24px',
                  padding: '24px 32px',
                  border: `1.5px solid rgba(255, 255, 255, 0.12)`,
                  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
                  {/* Icon badge */}
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '16px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '26px',
                      color: theme.colors.primary,
                    }}
                  >
                    {card.icon}
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: '24px',
                        fontFamily: theme.fonts.mono,
                        fontWeight: 800,
                        color: theme.colors.primary,
                        marginBottom: '4px',
                      }}
                    >
                      {card.path}
                    </div>
                    <div
                      style={{
                        fontSize: '30px',
                        fontWeight: 800,
                        color: '#FFFFFF',
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
                    color: 'rgba(255, 255, 255, 0.5)',
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
          transform: `translateY(${(1 - subtextSpring) * 20}px)`,
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
            color: 'rgba(255, 255, 255, 0.75)',
          }}
        >
          CONFIGURATION IS OFTEN HUMAN-READABLE TEXT
        </span>
      </div>
    </div>
  );
};
