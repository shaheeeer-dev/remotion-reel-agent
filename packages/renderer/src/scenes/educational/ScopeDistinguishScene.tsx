import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Server, User } from 'lucide-react';
import { useBrandTheme } from '../../styles/theme.js';

/**
 * Scene 3: Distinguish
 *
 * Single learning point: Scope distinction: /etc affects the entire machine, ~/.config affects one user.
 * Visual metaphor: Side-by-side card comparison between "The machine" (Dark) and "One user" (Light).
 * Platform UI Safe Area: Essential content is kept within the upper 80% (top 1536px).
 * Bottom 20% (384px) is strictly reserved for platform UI overlays.
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
        backgroundColor: theme.colors.brandPrimary, // Vibrant brand primary background
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
              marginBottom: '28px',
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
            gap: '24px',
            margin: 'auto 0',
            width: '100%',
          }}
        >
          {/* Left Card: /ETC (The machine - Dark Card) */}
          <div
            style={{
              transform: `translateX(${(1 - leftCardSpring) * -50}px) scale(${leftCardSpring})`,
              opacity: leftCardSpring,
              backgroundColor: theme.colors.deepBackground,
              borderRadius: '32px',
              padding: '40px 32px',
              boxShadow: '0 30px 70px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '430px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '20px',
                  fontFamily: theme.fonts.mono,
                  fontWeight: 800,
                  color: theme.colors.brightAccent,
                  letterSpacing: '0.08em',
                  marginBottom: '24px',
                }}
              >
                /ETC
              </div>

              {/* Lucide Server Icon (NO EMOJIS) */}
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1.5px solid rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '28px',
                }}
              >
                <Server size={36} color={theme.colors.brightAccent} strokeWidth={2.2} />
              </div>

              <h2
                style={{
                  fontSize: '42px',
                  fontWeight: 900,
                  color: theme.colors.primaryText,
                  margin: '0 0 10px 0',
                  letterSpacing: '-0.02em',
                  fontFamily: theme.fonts.heading,
                }}
              >
                The machine
              </h2>

              <p
                style={{
                  fontSize: '21px',
                  lineHeight: 1.4,
                  color: theme.colors.mutedText,
                  margin: 0,
                  fontFamily: theme.fonts.body,
                }}
              >
                System and service configuration
              </p>
            </div>

            <div
              style={{
                paddingTop: '18px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '15px',
                fontFamily: theme.fonts.mono,
                fontWeight: 800,
                letterSpacing: '0.1em',
                color: theme.colors.brightAccent,
                textTransform: 'uppercase',
              }}
            >
              SHARED SCOPE
            </div>
          </div>

          {/* Right Card: ~/.CONFIG (One user - Light Card) */}
          <div
            style={{
              transform: `translateX(${(1 - rightCardSpring) * 50}px) scale(${rightCardSpring})`,
              opacity: rightCardSpring,
              backgroundColor: '#FFFDF9',
              borderRadius: '32px',
              padding: '40px 32px',
              boxShadow: '0 30px 70px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '430px',
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
                  marginBottom: '24px',
                }}
              >
                ~/.CONFIG
              </div>

              {/* Lucide User Icon (NO EMOJIS) */}
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(59, 143, 243, 0.12)',
                  border: '1.5px solid rgba(59, 143, 243, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '28px',
                }}
              >
                <User size={36} color="#3B8FF3" strokeWidth={2.2} />
              </div>

              <h2
                style={{
                  fontSize: '42px',
                  fontWeight: 900,
                  color: '#110F17',
                  margin: '0 0 10px 0',
                  letterSpacing: '-0.02em',
                  fontFamily: theme.fonts.heading,
                }}
              >
                One user
              </h2>

              <p
                style={{
                  fontSize: '21px',
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
                paddingTop: '18px',
                borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                fontSize: '15px',
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
            transform: `translateY(${(1 - subtextSpring) * 15}px)`,
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
    </div>
  );
};
