import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Box, Layers, Server, Cpu, Play, FileText, Shield, ShieldCheck } from 'lucide-react';
import { useBrandTheme, renderHighlightedText } from '../styles/theme.js';
import { AnimatedSubtitles } from '../components/AnimatedSubtitles.js';
import type { ContainerDiagramScene as ContainerDiagramSceneType } from '@learnops/schema';

/**
 * Scene 2: Container Architecture Diagram (Docker & Kubernetes Topics)
 *
 * Renders the iconic "ISOLATED WORKLOAD" container sandbox boundary:
 * - Dashed container sandbox representing Linux cgroups & namespaces
 * - Running process card with active execution badge
 * - Private Mount & PID namespace resource pills
 */
export const ContainerDiagramScene: React.FC<{ scene: ContainerDiagramSceneType }> = ({ scene }) => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animations
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const sandboxSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  const processSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const namespace1Spring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const namespace2Spring = spring({
    frame: frame - 24,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const subtextSpring = spring({
    frame: frame - 28,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const primaryContainer = scene.containers[0] || {
    name: 'learnops-web',
    app: 'Node.js API',
    binsLibs: 'Alpine Linux',
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.deepBackground,
        overflow: 'hidden',
      }}
    >
      {/* Platform Safe Area Container (Upper 80% = 1536px) */}
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
        {/* Tier 1 (Top): Kicker with Accent Mark & Left-Aligned Headline */}
        <div
          style={{
            transform: `translateY(${(1 - headerSpring) * 35}px)`,
            opacity: headerSpring,
          }}
        >
          {/* Top Kicker Row */}
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
              DOCKER ARCHITECTURE • 01
            </span>

            {/* Accent Line Indicator on Top Right */}
            <div
              style={{
                width: '48px',
                height: '6px',
                borderRadius: '999px',
                backgroundColor: '#00E5FF',
              }}
            />
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: '84px',
              fontWeight: 900,
              lineHeight: 1.08,
              color: '#FFFFFF',
              letterSpacing: '-0.04em',
              margin: 0,
              maxWidth: '920px',
              fontFamily: theme.fonts.heading,
            }}
          >
            {renderHighlightedText(scene.title, '#FFFFFF', '#00E5FF')}
          </h1>
        </div>

        {/* Tier 2 (Middle): The Iconic Dashed Container Sandbox */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: 'auto 0',
            width: '100%',
          }}
        >
          <div
            style={{
              width: '840px',
              borderRadius: '36px',
              border: '3.5px dashed rgba(255, 255, 255, 0.45)',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              padding: '36px 32px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              transform: `scale(${sandboxSpring})`,
              opacity: sandboxSpring,
              position: 'relative',
            }}
          >
            {/* Top Boundary Kicker Badge */}
            <div
              style={{
                fontSize: '18px',
                fontFamily: theme.fonts.mono,
                fontWeight: 900,
                letterSpacing: '0.14em',
                color: '#FFFFFF',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                paddingLeft: '6px',
              }}
            >
              <ShieldCheck size={22} color="#00E5FF" strokeWidth={2.4} />
              <span>ISOLATED WORKLOAD • CGROUPS & NAMESPACES</span>
            </div>

            {/* Child 1: Running Process (Black card with Red Play Button) */}
            <div
              style={{
                backgroundColor: '#110F17',
                borderRadius: '22px',
                padding: '22px 28px',
                border: '2px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: processSpring,
                transform: `translateY(${(1 - processSpring) * 20}px)`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '16px',
                    backgroundColor: '#E53935',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 20px rgba(229, 57, 53, 0.6)',
                  }}
                >
                  <Play size={26} color="#FFFFFF" fill="#FFFFFF" />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: theme.fonts.mono,
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#FF8A80',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: '2px',
                    }}
                  >
                    RUNNING PROCESS
                  </div>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 900,
                      fontFamily: theme.fonts.mono,
                      color: '#FFFFFF',
                    }}
                  >
                    {primaryContainer.name}
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '6px 16px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  fontFamily: theme.fonts.mono,
                  fontSize: '15px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                }}
              >
                PID 1
              </div>
            </div>

            {/* Child 2: Private File View (Mount Namespace) */}
            <div
              style={{
                backgroundColor: '#1C1824',
                borderRadius: '20px',
                padding: '20px 28px',
                border: '1.5px solid rgba(255, 255, 255, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: namespace1Spring,
                transform: `translateY(${(1 - namespace1Spring) * 20}px)`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <FileText size={26} color="#3B82F6" />
                <span
                  style={{
                    fontFamily: theme.fonts.mono,
                    fontSize: '19px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    letterSpacing: '0.04em',
                  }}
                >
                  PRIVATE FILE VIEW
                </span>
              </div>
              <span
                style={{
                  fontFamily: theme.fonts.mono,
                  fontSize: '14px',
                  color: '#93C5FD',
                  fontWeight: 700,
                }}
              >
                mount namespace
              </span>
            </div>

            {/* Child 3: Private Process Space (PID Namespace) */}
            <div
              style={{
                backgroundColor: '#1C1824',
                borderRadius: '20px',
                padding: '20px 28px',
                border: '1.5px solid rgba(255, 255, 255, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: namespace2Spring,
                transform: `translateY(${(1 - namespace2Spring) * 20}px)`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Cpu size={26} color="#10B981" />
                <span
                  style={{
                    fontFamily: theme.fonts.mono,
                    fontSize: '19px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    letterSpacing: '0.04em',
                  }}
                >
                  PRIVATE PROCESS SPACE
                </span>
              </div>
              <span
                style={{
                  fontFamily: theme.fonts.mono,
                  fontSize: '14px',
                  color: '#6EE7B7',
                  fontWeight: 700,
                }}
              >
                pid namespace
              </span>
            </div>
          </div>
        </div>

        {/* Tier 3 (Bottom): Explanatory Monospace Subtext & Subtitles */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            opacity: subtextSpring,
            transform: `translateY(${(1 - subtextSpring) * 25}px)`,
          }}
        >
          {scene.comparisonNote && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                padding: '16px 24px',
                fontSize: '20px',
                color: 'rgba(255, 255, 255, 0.85)',
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              {scene.comparisonNote}
            </div>
          )}

          <AnimatedSubtitles
            voiceover={scene.voiceover}
            durationSeconds={scene.durationSeconds}
            subtitles={scene.subtitles}
          />
        </div>
      </div>
    </div>
  );
};
