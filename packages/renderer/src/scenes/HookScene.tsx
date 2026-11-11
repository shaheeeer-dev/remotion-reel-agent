import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { ArrowRight, Box, FileText, Folder, Layers, Server } from 'lucide-react';
import { useBrandTheme, renderHighlightedText } from '../styles/theme.js';
import type { HookScene as HookSceneType } from '@learnops/schema';

interface HookVisualProps {
  kind: HookSceneType['visualMetaphor'];
  frame: number;
  fps: number;
}

const HookVisual: React.FC<HookVisualProps> = ({ kind = 'folder_drawer', frame, fps }) => {
  const theme = useBrandTheme();

  // Sliding active drawer animation
  const drawerSlide = spring({
    frame: frame - 18,
    fps,
    config: { damping: 12, stiffness: 90 },
  });
  const drawerOffset = interpolate(drawerSlide, [0, 1], [0, 56]);

  if (kind === 'container_stack') {
    return (
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
        {/* Machine Header */}
        <div
          style={{
            fontSize: '18px',
            fontFamily: theme.fonts.mono,
            fontWeight: 800,
            letterSpacing: '0.14em',
            color: 'rgba(255, 255, 255, 0.55)',
            textTransform: 'uppercase',
            paddingLeft: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Server size={20} color={theme.colors.brightAccent} />
          <span>DOCKER ENGINE • HOST MACHINE</span>
        </div>

        {/* Slot 1: Inactive Container */}
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Layers size={28} color="rgba(255, 255, 255, 0.35)" />
            <span>api-gateway</span>
          </div>
          <span style={{ fontSize: '16px', opacity: 0.6 }}>:3000</span>
        </div>

        {/* Slot 2: Active Sliding Container with glowing accent */}
        <div
          style={{
            transform: `translateX(${drawerOffset}px)`,
            backgroundColor: theme.colors.cardSurface,
            borderRadius: '20px',
            padding: '24px 32px',
            border: `2px solid ${theme.colors.brightAccent}`,
            boxShadow: `0 10px 30px rgba(0, 0, 0, 0.6), 0 0 25px ${theme.colors.primaryGlow}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '26px',
            fontWeight: 900,
            color: theme.colors.brightAccent,
            fontFamily: theme.fonts.mono,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Box size={32} color={theme.colors.brightAccent} strokeWidth={2.5} />
            <span>web-app:latest</span>
          </div>
          <span
            style={{
              fontSize: '16px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(178, 139, 255, 0.16)',
              border: `1px solid ${theme.colors.brightAccent}`,
              letterSpacing: '0.06em',
            }}
          >
            RUNNING :8080
          </span>
        </div>

        {/* Slot 3: Inactive Container */}
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Server size={28} color="rgba(255, 255, 255, 0.35)" />
            <span>db-postgres</span>
          </div>
          <span style={{ fontSize: '16px', opacity: 0.6 }}>:5432</span>
        </div>
      </div>
    );
  }

  if (kind === 'pipeline_flow') {
    const stages = [
      { label: 'BUILD', icon: FileText, active: false },
      { label: 'TEST', icon: Layers, active: true },
      { label: 'SHIP', icon: Box, active: false },
    ];

    return (
      <div
        style={{
          width: '620px',
          backgroundColor: theme.colors.deepBackground,
          borderRadius: '36px',
          padding: '36px',
          boxShadow: '0 35px 80px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          position: 'relative',
        }}
      >
        {/* Header Label */}
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
          CI/CD PIPELINE • AUTOMATED STAGES
        </div>

        {/* 3 Pipeline Stages */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          {stages.map((stage, idx) => {
            const entrance = spring({
              frame: frame - (10 + idx * 7),
              fps,
              config: { damping: 14, stiffness: 120 },
            });
            const Icon = stage.icon;
            const isActive = stage.active;

            return (
              <React.Fragment key={stage.label}>
                <div
                  style={{
                    flex: 1,
                    height: '148px',
                    borderRadius: '22px',
                    backgroundColor: theme.colors.cardSurface,
                    border: isActive
                      ? `2px solid ${theme.colors.brightAccent}`
                      : '1.5px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isActive ? `0 0 24px ${theme.colors.primaryGlow}` : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    opacity: entrance,
                    transform: `translateY(${(1 - entrance) * 20}px)`,
                  }}
                >
                  <Icon
                    size={32}
                    color={isActive ? theme.colors.brightAccent : 'rgba(255, 255, 255, 0.45)'}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span
                    style={{
                      fontFamily: theme.fonts.mono,
                      fontSize: '18px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      color: isActive ? theme.colors.brightAccent : 'rgba(255, 255, 255, 0.45)',
                    }}
                  >
                    {stage.label}
                  </span>
                </div>

                {idx < stages.length - 1 && (
                  <ArrowRight size={22} color="rgba(255, 255, 255, 0.3)" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // Default: 'folder_drawer' (Filing Cabinet /etc drawer sliding out)
  return (
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

      {/* Drawer 2 (SLIDING ACTIVE DRAWER): /etc with Lucide Folder Icon */}
      <div
        style={{
          transform: `translateX(${drawerOffset}px)`,
          backgroundColor: theme.colors.cardSurface,
          borderRadius: '20px',
          padding: '24px 32px',
          border: `2px solid ${theme.colors.brightAccent}`,
          boxShadow: `0 10px 30px rgba(0, 0, 0, 0.6), 0 0 25px ${theme.colors.primaryGlow}`,
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          fontSize: '32px',
          fontWeight: 900,
          color: theme.colors.brightAccent,
          fontFamily: theme.fonts.mono,
          zIndex: 10,
        }}
      >
        <Folder size={36} color={theme.colors.brightAccent} strokeWidth={2.5} />
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
  );
};

/**
 * Scene 1: The Hook (00:00 - 00:03, 3 sec)
 *
 * 3-Tier Open Canvas Visual Architecture:
 * - Tier 1 (Top): Monospace kicker & massive bold headline open directly on purple canvas.
 * - Tier 2 (Middle): Dedicated visual metaphor card (folder_drawer, container_stack, pipeline_flow).
 * - Tier 3 (Bottom): Explanatory subtext & monospace badge open directly on purple canvas.
 *
 * Rules:
 * - Background: Solid Brand Primary Purple (no enclosing outer card, no 2-tone split).
 * - Text: All text on the purple canvas is WHITE (#FFFFFF / rgba(255, 255, 255, 0.75)), strictly avoiding dark/black text.
 * - Platform Safe Area (80/20 Rule): All essential elements are contained inside the top 80% (0 - 1536px),
 *   leaving the bottom 20% (384px) strictly clear for platform interface overlays.
 * - Zero Emojis: Strictly Lucide SVG icons.
 */
export const HookScene: React.FC<{ scene: HookSceneType }> = ({ scene }) => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animations
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

  const subtextSpring = spring({
    frame: frame - 28,
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
        backgroundColor: theme.colors.brandPrimary, // Solid Brand Primary Purple background
        overflow: 'hidden',
      }}
    >
      {/* 
        Platform Safe Area Container:
        Height: 1536px (Upper 80% of 1920px)
        Leaves the bottom 384px completely clear for platform UI overlays.
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
        {/* Tier 1 (Top): Monospace Kicker & Bold Headline directly on canvas */}
        <div
          style={{
            transform: `translateY(${(1 - headerSpring) * 40}px)`,
            opacity: headerSpring,
          }}
        >
          {/* Monospace Kicker */}
          <div
            style={{
              fontSize: '22px',
              fontFamily: theme.fonts.mono,
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: 'rgba(255, 255, 255, 0.75)', // White text
              textTransform: 'uppercase',
              marginBottom: '28px',
            }}
          >
            {scene.badge || 'DEVOPS ESSENTIALS • 01'}
          </div>

          {/* Headline (Open directly on canvas, massive 84px, white text) */}
          <h1
            style={{
              fontSize: '84px',
              fontWeight: 900,
              lineHeight: 1.08,
              color: '#FFFFFF', // White text on purple screen
              letterSpacing: '-0.04em',
              margin: 0,
              maxWidth: '920px',
              fontFamily: theme.fonts.heading,
            }}
          >
            {renderHighlightedText(scene.headline, '#FFFFFF', theme.colors.brightAccent)}
          </h1>
        </div>

        {/* Tier 2 (Middle): Visual Metaphor Card */}
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
          <HookVisual kind={scene.visualMetaphor} frame={frame} fps={fps} />
        </div>

        {/* Tier 3 (Bottom): Explanatory Subtext & Monospace Pill directly on canvas */}
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
          {scene.subtext && (
            <p
              style={{
                fontSize: '36px',
                fontWeight: 800,
                color: '#FFFFFF', // White text on purple screen
                margin: 0,
                fontFamily: theme.fonts.heading,
                maxWidth: '900px',
                lineHeight: 1.25,
              }}
            >
              {renderHighlightedText(scene.subtext, '#FFFFFF', theme.colors.brightAccent)}
            </p>
          )}

          <span
            style={{
              fontSize: '20px',
              fontFamily: theme.fonts.mono,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.75)', // White text
            }}
          >
            {scene.badge ? scene.badge.replace(/•.*$/, '').trim() : 'CORE ARCHITECTURE'}
          </span>
        </div>
      </div>
    </div>
  );
};
