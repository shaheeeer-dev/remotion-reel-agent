import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Box, Layers, Cpu, Sparkles } from 'lucide-react';
import { useBrandTheme, renderHighlightedText } from '../styles/theme.js';
import type { ContainerDiagramScene as ContainerDiagramSceneType } from '@learnops/schema';

/**
 * Scene 2 Variant: Docker Container Architecture Diagram
 *
 * Rule-based Generalized Dynamic Theming:
 * - Background: Brand Background
 * - Container Surfaces: Brand Card Surface with Brand Primary border & glow
 * - Primary Text: Brand Text Primary
 * - Highlighted Keywords: Brand Secondary / Accent
 * - Subtext & Borders: Brand Text Secondary
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
        backgroundColor: theme.colors.bg, // Dynamic Brand Background
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
            color: theme.colors.secondary, // Dynamic Brand Secondary
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
            color: theme.colors.textPrimary, // Dynamic Brand Text Primary
            marginTop: '8px',
            fontFamily: theme.fonts.heading,
            letterSpacing: '-0.02em',
          }}
        >
          {renderHighlightedText(scene.title, theme.colors.textPrimary, theme.colors.secondary)}
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
        {/* Top Tier: Containers */}
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
                  backgroundColor: theme.colors.bgCard, // Dynamic Brand Card Surface
                  border: `1px solid ${theme.colors.primary}`, // Dynamic Brand Primary Border
                  boxShadow: `${theme.colors.cardGlow}, 0 20px 45px rgba(0, 0, 0, 0.5)`,
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
                    borderBottom: `1px solid ${theme.colors.primarySurface}`,
                    paddingBottom: '12px',
                  }}
                >
                  <span
                    style={{
                      fontFamily: theme.fonts.mono,
                      fontSize: '22px',
                      fontWeight: 700,
                      color: theme.colors.secondary, // Dynamic Brand Secondary
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Box size={20} color={theme.colors.secondary} strokeWidth={2.2} />
                    <span>{container.name}</span>
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      backgroundColor: theme.colors.secondarySurface,
                      color: theme.colors.secondary,
                      border: `1px solid ${theme.colors.secondary}`,
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
                  <span style={{ fontSize: '13px', color: theme.colors.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>
                    User Application
                  </span>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: theme.colors.textPrimary }}>
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
                  <span style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: 700, textTransform: 'uppercase' }}>
                    Bundled Bins & Libs
                  </span>
                  <span style={{ fontSize: '20px', fontFamily: theme.fonts.mono, color: theme.colors.textSecondary }}>
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
            backgroundColor: theme.colors.bgCard, // Dynamic Brand Card Surface
            border: `1px solid ${theme.colors.primary}`, // Dynamic Brand Primary Border
            boxShadow: theme.colors.cardGlow,
            borderRadius: '20px',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: theme.colors.primarySurface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers size={28} color={theme.colors.secondary} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: theme.colors.textPrimary }}>
                {scene.containerEngine}
              </div>
              <div style={{ fontSize: '16px', color: theme.colors.textSecondary }}>
                cgroups resource isolation • namespaces virtualization
              </div>
            </div>
          </div>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: theme.colors.primarySurface,
              border: `1px solid ${theme.colors.primary}`,
              color: theme.colors.secondary,
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
            backgroundColor: theme.colors.bgCard, // Dynamic Brand Card Surface
            border: `1px solid ${theme.colors.primary}`, // Dynamic Brand Primary Border
            boxShadow: theme.colors.cardGlow,
            borderRadius: '20px',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: theme.colors.secondarySurface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cpu size={28} color={theme.colors.secondary} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: theme.colors.textPrimary }}>
                {scene.hostOs}
              </div>
              <div style={{ fontSize: '16px', color: theme.colors.textSecondary }}>
                Shared host hardware & Linux Kernel syscalls (Zero Hypervisor Overhead)
              </div>
            </div>
          </div>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: theme.colors.secondarySurface,
              border: `1px solid ${theme.colors.secondary}`,
              color: theme.colors.secondary,
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
            backgroundColor: theme.colors.bgCard,
            border: `1px solid ${theme.colors.primary}`,
            boxShadow: theme.colors.cardGlow,
            fontSize: '22px',
            lineHeight: 1.45,
            color: theme.colors.textPrimary,
            fontFamily: theme.fonts.body,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          <Sparkles size={22} color={theme.colors.secondary} />
          <span>{renderHighlightedText(scene.comparisonNote, theme.colors.textPrimary, theme.colors.secondary)}</span>
        </div>
      )}
    </div>
  );
};
