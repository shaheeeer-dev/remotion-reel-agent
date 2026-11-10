import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { defaultTheme } from '../styles/theme.js';
import type { ContainerDiagramScene as ContainerDiagramSceneType } from '@learnops/schema';

export const ContainerDiagramScene: React.FC<{ scene: ContainerDiagramSceneType }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header animation
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Base OS layer animation
  const hostSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  // Docker Engine layer animation
  const engineSpring = spring({
    frame: frame - 14,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  // Ambient pulse on container isolation
  const pulse = interpolate(Math.sin(frame / 12), [-1, 1], [0.95, 1.05]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 60px',
      }}
    >
      {/* Title */}
      <div
        style={{
          transform: `translateY(${(1 - headerSpring) * 30}px)`,
          opacity: headerSpring,
          textAlign: 'center',
          marginBottom: '36px',
        }}
      >
        <span
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#00E5FF',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: defaultTheme.fonts.heading,
          }}
        >
          Docker Core Architecture
        </span>
        <h2
          style={{
            fontSize: '52px',
            fontWeight: 800,
            color: defaultTheme.colors.textPrimary,
            marginTop: '8px',
            fontFamily: defaultTheme.fonts.heading,
            letterSpacing: '-0.02em',
          }}
        >
          {scene.title}
        </h2>
      </div>

      {/* Main Diagram Canvas */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Top Tier: Containers Running in Isolated User Spaces */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${scene.containers.length}, 1fr)`,
            gap: '16px',
          }}
        >
          {scene.containers.map((container, index) => {
            const containerSpring = spring({
              frame: frame - (20 + index * 8),
              fps,
              config: { damping: 14, stiffness: 120 },
            });

            return (
              <div
                key={container.name}
                style={{
                  transform: `translateY(${(1 - containerSpring) * 40}px) scale(${containerSpring})`,
                  opacity: containerSpring,
                  backgroundColor: 'rgba(21, 29, 42, 0.95)',
                  border: `2px solid ${defaultTheme.colors.primary}`,
                  borderRadius: '20px',
                  padding: '24px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: `0 10px 30px ${defaultTheme.colors.primaryGlow}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Isolation Pill */}
                <div
                  style={{
                    alignSelf: 'flex-start',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 107, 0, 0.15)',
                    color: defaultTheme.colors.primary,
                    fontSize: '18px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontFamily: defaultTheme.fonts.mono,
                  }}
                >
                  Isolated
                </div>

                {/* App Box */}
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '16px 12px',
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div style={{ fontSize: '20px', color: defaultTheme.colors.textMuted }}>Application</div>
                  <div
                    style={{
                      fontSize: '26px',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      fontFamily: defaultTheme.fonts.heading,
                      marginTop: '4px',
                    }}
                  >
                    {container.app}
                  </div>
                </div>

                {/* Bins / Libs Box */}
                <div
                  style={{
                    backgroundColor: 'rgba(0, 229, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '12px',
                    textAlign: 'center',
                    border: '1px solid rgba(0, 229, 255, 0.2)',
                  }}
                >
                  <div style={{ fontSize: '18px', color: '#00E5FF' }}>Bins & Libs</div>
                  <div
                    style={{
                      fontSize: '22px',
                      fontWeight: 600,
                      color: '#E2E8F0',
                      fontFamily: defaultTheme.fonts.mono,
                      marginTop: '2px',
                    }}
                  >
                    {container.binsLibs}
                  </div>
                </div>

                {/* Container Name */}
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: '20px',
                    color: defaultTheme.colors.textSecondary,
                    fontFamily: defaultTheme.fonts.mono,
                    fontWeight: 600,
                  }}
                >
                  {container.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Middle Tier: Docker Engine (Daemon) */}
        <div
          style={{
            transform: `translateY(${(1 - engineSpring) * 20}px)`,
            opacity: engineSpring,
            backgroundColor: 'rgba(0, 229, 255, 0.12)',
            border: '2px solid #00E5FF',
            borderRadius: '18px',
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 0 25px rgba(0, 229, 255, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '36px' }}>🐳</span>
            <div>
              <div
                style={{
                  fontSize: '30px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  fontFamily: defaultTheme.fonts.heading,
                }}
              >
                {scene.containerEngine}
              </div>
              <div style={{ fontSize: '20px', color: '#00E5FF', fontFamily: defaultTheme.fonts.body }}>
                Container Runtime & Image Layer Management
              </div>
            </div>
          </div>
          <span
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 229, 255, 0.2)',
              color: '#FFFFFF',
              fontSize: '20px',
              fontWeight: 700,
              fontFamily: defaultTheme.fonts.mono,
            }}
          >
            ACTIVE
          </span>
        </div>

        {/* Bottom Tier: Host OS & Linux Kernel */}
        <div
          style={{
            transform: `translateY(${(1 - hostSpring) * 20}px)`,
            opacity: hostSpring,
            backgroundColor: 'rgba(30, 41, 59, 0.85)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '18px',
            padding: '24px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '36px' }}>🐧</span>
            <div>
              <div
                style={{
                  fontSize: '30px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  fontFamily: defaultTheme.fonts.heading,
                }}
              >
                {scene.hostOs}
              </div>
              <div style={{ fontSize: '20px', color: defaultTheme.colors.textMuted, fontFamily: defaultTheme.fonts.mono }}>
                Shared Linux Kernel • Namespaces (Isolation) • cgroups (Resource Limits)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Note / Footer */}
      {scene.comparisonNote && (
        <div
          style={{
            marginTop: '36px',
            padding: '24px 32px',
            borderRadius: '20px',
            backgroundColor: 'rgba(255, 107, 0, 0.1)',
            borderLeft: `6px solid ${defaultTheme.colors.primary}`,
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <span style={{ fontSize: '36px' }}>💡</span>
          <span
            style={{
              fontSize: '28px',
              lineHeight: 1.4,
              color: defaultTheme.colors.textPrimary,
              fontFamily: defaultTheme.fonts.body,
              fontWeight: 500,
            }}
          >
            {scene.comparisonNote}
          </span>
        </div>
      )}
    </div>
  );
};

