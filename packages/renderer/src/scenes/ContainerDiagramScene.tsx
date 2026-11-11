import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBrandTheme, LearnOpsTheme, renderHighlightedText } from '../styles/theme.js';
import type { ContainerDiagramScene as ContainerDiagramSceneType } from '@learnops/schema';

/**
 * Scene 2 Variant: Docker Container Architecture Diagram
 *
 * Exact Color Mapping:
 * - Background: #110F17 (Dark Amethyst)
 * - Container Surfaces: #1C1824 with 1px solid #783CEB border & glow
 * - Primary Text: #FFFFFF (White)
 * - Highlighted Keywords: #B28BFF (Lavender)
 * - Subtext & Borders: #91899C (Muted Purple)
 */
export const ContainerDiagramScene: React.FC<{ scene: ContainerDiagramSceneType }> = ({ scene }) => {
  const theme = useBrandTheme();
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
  const pulse = interpolate(Math.sin(frame / 12), [-1, 1], [0.98, 1.02]);

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
      {/* Title */}
      <div
        style={{
          transform: `translateY(${(1 - headerSpring) * 30}px)`,
          opacity: headerSpring,
          textAlign: 'center',
          marginBottom: '32px',
        }}
      >
        <span
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: LearnOpsTheme.accentLavender, // #B28BFF
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontFamily: theme.fonts.heading,
          }}
        >
          Docker Core Architecture
        </span>
        <h2
          style={{
            fontSize: '52px',
            fontWeight: 900,
            color: LearnOpsTheme.textWhite, // #FFFFFF
            marginTop: '8px',
            fontFamily: theme.fonts.heading,
            letterSpacing: '-0.02em',
          }}
        >
          {renderHighlightedText(scene.title, LearnOpsTheme.textWhite, LearnOpsTheme.accentLavender)}
        </h2>
      </div>

      {/* Main Diagram Canvas */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
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
              config: { damping: 14, stiffness: 110 },
            });

            return (
              <div
                key={container.name}
                style={{
                  transform: `scale(${containerSpring * pulse}) translateY(${(1 - containerSpring) * 40}px)`,
                  opacity: containerSpring,
                  backgroundColor: LearnOpsTheme.surfaceAmethyst, // #1C1824
                  border: `1px solid ${LearnOpsTheme.brandPurple}`, // 1px #783CEB
                  boxShadow: '0 0 15px rgba(120, 60, 235, 0.20), 0 20px 45px rgba(0, 0, 0, 0.5)',
                  borderRadius: '24px',
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {/* Container Badge */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(120, 60, 235, 0.3)',
                    paddingBottom: '12px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: theme.fonts.mono,
                      fontSize: '22px',
                      fontWeight: 700,
                      color: LearnOpsTheme.accentLavender, // #B28BFF
                    }}
                  >
                    📦 {container.name}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      backgroundColor: 'rgba(52, 177, 170, 0.15)',
                      color: '#34B1AA',
                      border: '1px solid #34B1AA',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Isolated
                  </span>
                </div>

                {/* Container Payload */}
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '13px', color: LearnOpsTheme.textMutedPurple, fontWeight: 700, textTransform: 'uppercase' }}>
                    User Application
                  </span>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: LearnOpsTheme.textWhite }}>
                    {container.app}
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '14px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontSize: '12px', color: LearnOpsTheme.textMutedPurple, fontWeight: 700, textTransform: 'uppercase' }}>
                    Bundled Bins & Libs
                  </span>
                  <span style={{ fontSize: '20px', fontFamily: theme.fonts.mono, color: LearnOpsTheme.textMutedPurple }}>
                    {container.binsLibs}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Middle Tier: Docker Engine */}
        <div
          style={{
            transform: `translateY(${(1 - engineSpring) * 30}px)`,
            opacity: engineSpring,
            backgroundColor: LearnOpsTheme.surfaceAmethyst, // #1C1824
            border: `1px solid ${LearnOpsTheme.brandPurple}`, // 1px #783CEB
            boxShadow: '0 0 15px rgba(120, 60, 235, 0.20)',
            borderRadius: '20px',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px' }}>🐳</span>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: LearnOpsTheme.textWhite }}>
                {scene.containerEngine}
              </div>
              <div style={{ fontSize: '16px', color: LearnOpsTheme.textMutedPurple }}>
                cgroups resource isolation • namespaces virtualization
              </div>
            </div>
          </div>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(120, 60, 235, 0.2)',
              border: `1px solid ${LearnOpsTheme.brandPurple}`,
              color: LearnOpsTheme.accentLavender,
              fontFamily: theme.fonts.mono,
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            daemon
          </span>
        </div>

        {/* Bottom Tier: Host OS & Shared Kernel */}
        <div
          style={{
            transform: `translateY(${(1 - hostSpring) * 30}px)`,
            opacity: hostSpring,
            backgroundColor: LearnOpsTheme.surfaceAmethyst, // #1C1824
            border: `1px solid ${LearnOpsTheme.brandPurple}`, // 1px #783CEB
            boxShadow: '0 0 15px rgba(120, 60, 235, 0.20)',
            borderRadius: '20px',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '32px' }}>🐧</span>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: LearnOpsTheme.textWhite }}>
                {scene.hostOs}
              </div>
              <div style={{ fontSize: '16px', color: LearnOpsTheme.textMutedPurple }}>
                Shared host hardware & Linux Kernel syscalls (Zero Hypervisor Overhead)
              </div>
            </div>
          </div>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(178, 139, 255, 0.15)',
              border: `1px solid ${LearnOpsTheme.accentLavender}`,
              color: LearnOpsTheme.accentLavender,
              fontFamily: theme.fonts.mono,
              fontSize: '18px',
              fontWeight: 700,
            }}
          >
            Kernel 6.x
          </span>
        </div>
      </div>

      {/* Comparison Note / Takeaway */}
      {scene.comparisonNote && (
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
          💡 {renderHighlightedText(scene.comparisonNote, LearnOpsTheme.textWhite, LearnOpsTheme.accentLavender)}
        </div>
      )}
    </div>
  );
};
