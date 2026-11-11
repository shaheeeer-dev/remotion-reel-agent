import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBrandTheme } from '../../styles/theme.js';

/**
 * Scene 3: Distinguish (00:06 - 00:09, 3 sec / 90 frames @ 30fps)
 *
 * Learning Point: Scope distinction: /etc affects the entire machine, ~/.config affects one user.
 * Visual Metaphor: Side-by-side card comparison between "The machine" (Dark) and "One user" (Light).
 */
export const ScopeDistinguishScene: React.FC = () => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for header
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Left card spring
  const leftCardSpring = spring({
    frame: frame - 4,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Right card spring
  const rightCardSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

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
        backgroundColor: theme.colors.primary, // Vibrant brand primary background
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '120px 80px',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Top Section: Kicker & Headline */}
      <div
        style={{
          transform: `translateY(${(1 - headerSpring) * 35}px)`,
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
          SYSTEM OR PERSONAL?
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
          Who does a setting affect?
        </h1>
      </div>

      {/* Middle Section: Side-by-Side Comparison Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '28px',
          margin: 'auto 0',
          width: '100%',
        }}
      >
        {/* Left Card: /ETC (The machine - Dark Card) */}
        <div
          style={{
            transform: `translateX(${(1 - leftCardSpring) * -60}px) scale(${leftCardSpring})`,
            opacity: leftCardSpring,
            backgroundColor: '#110F17',
            borderRadius: '32px',
            padding: '44px 36px',
            boxShadow: '0 30px 70px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '440px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '20px',
                fontFamily: theme.fonts.mono,
                fontWeight: 800,
                color: theme.colors.primary,
                letterSpacing: '0.08em',
                marginBottom: '28px',
              }}
            >
              /ETC
            </div>

            {/* Server Icon */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1.5px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                marginBottom: '32px',
              }}
            >
              🖧
            </div>

            <h2
              style={{
                fontSize: '44px',
                fontWeight: 900,
                color: '#FFFFFF',
                margin: '0 0 12px 0',
                letterSpacing: '-0.02em',
                fontFamily: theme.fonts.heading,
              }}
            >
              The machine
            </h2>

            <p
              style={{
                fontSize: '22px',
                lineHeight: 1.4,
                color: 'rgba(255, 255, 255, 0.65)',
                margin: 0,
                fontFamily: theme.fonts.body,
              }}
            >
              System and service configuration
            </p>
          </div>

          <div
            style={{
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '16px',
              fontFamily: theme.fonts.mono,
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: theme.colors.primary,
              textTransform: 'uppercase',
            }}
          >
            SHARED SCOPE
          </div>
        </div>

        {/* Right Card: ~/.CONFIG (One user - Light Card) */}
        <div
          style={{
            transform: `translateX(${(1 - rightCardSpring) * 60}px) scale(${rightCardSpring})`,
            opacity: rightCardSpring,
            backgroundColor: '#FFFDF9',
            borderRadius: '32px',
            padding: '44px 36px',
            boxShadow: '0 30px 70px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '440px',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '20px',
                fontFamily: theme.fonts.mono,
                fontWeight: 800,
                color: '#64748B',
                letterSpacing: '0.08em',
                marginBottom: '28px',
              }}
            >
              ~/.CONFIG
            </div>

            {/* User Icon */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                backgroundColor: 'rgba(59, 143, 243, 0.12)',
                border: '1.5px solid rgba(59, 143, 243, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                marginBottom: '32px',
              }}
            >
              👤
            </div>

            <h2
              style={{
                fontSize: '44px',
                fontWeight: 900,
                color: '#110F17',
                margin: '0 0 12px 0',
                letterSpacing: '-0.02em',
                fontFamily: theme.fonts.heading,
              }}
            >
              One user
            </h2>

            <p
              style={{
                fontSize: '22px',
                lineHeight: 1.4,
                color: '#64748B',
                margin: 0,
                fontFamily: theme.fonts.body,
              }}
            >
              Personal app preferences
            </p>
          </div>

          <div
            style={{
              paddingTop: '20px',
              borderTop: '1px solid rgba(0, 0, 0, 0.08)',
              fontSize: '16px',
              fontFamily: theme.fonts.mono,
              fontWeight: 800,
              letterSpacing: '0.1em',
              color: '#3B8FF3',
              textTransform: 'uppercase',
            }}
          >
            USER SCOPE
          </div>
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
        <p
          style={{
            fontSize: '30px',
            fontWeight: 800,
            color: 'rgba(0, 0, 0, 0.65)',
            margin: 0,
            fontFamily: theme.fonts.heading,
          }}
        >
          Different folders. Different scope.
        </p>
      </div>
    </div>
  );
};
