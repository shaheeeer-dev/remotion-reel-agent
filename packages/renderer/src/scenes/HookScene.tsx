import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  ArrowRight,
  Box,
  FileText,
  Folder,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Key,
  Laptop,
  Layers,
  Network,
  Rocket,
  Server,
  ShieldCheck,
  User,
  Users,
  Wifi,
} from 'lucide-react';
import { useBrandTheme } from '../styles/theme.js';
import { AnimatedSubtitles } from '../components/AnimatedSubtitles.js';
import type { HookScene as HookSceneType } from '@learnops/schema';

/**
 * Renders text on the purple canvas with a black box behind any highlighted (*word* or `word`) term.
 * Solves color conflict so purple text/accents never blend into the purple canvas.
 */
function renderHookTextWithBlackBox(
  text: string,
  defaultColor = '#FFFFFF',
  highlightTextColor = '#B28BFF'
) {
  if (!text) return [];

  const parts = text.split(/(\*[^*]+\*|`[^`]+`)/g);

  return parts.map((part, idx) => {
    if (
      (part.startsWith('*') && part.endsWith('*') && part.length > 2) ||
      (part.startsWith('`') && part.endsWith('`') && part.length > 2)
    ) {
      const cleanWord = part.slice(1, -1);
      return (
        <span
          key={idx}
          style={{
            backgroundColor: '#110F17', // Black box behind highlighted word
            color: highlightTextColor, // High-contrast lavender/purple text inside black box
            padding: '2px 18px',
            borderRadius: '16px',
            display: 'inline-block',
            margin: '0 6px',
            border: '1.5px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            fontWeight: 900,
            verticalAlign: 'baseline',
          }}
        >
          {cleanWord}
        </span>
      );
    }

    return (
      <span key={idx} style={{ color: defaultColor }}>
        {part}
      </span>
    );
  });
}

/**
 * Intelligently resolves the visual metaphor based on topic keywords and schema:
 * - permissions_matrix: chmod, chown, user, permissions, security
 * - container_stack: docker, container, image, volume
 * - git_graph: git, github, commit, branch, merge, pull request
 * - network_flow: network, dns, ip, port, http, curl, socket
 * - pipeline_flow: ci/cd, pipeline, build, deploy, test
 * - folder_drawer: linux filesystem, /etc, directory, config files
 */
function resolveVisualMetaphor(scene: HookSceneType): string {
  const text = `${scene.headline || ''} ${scene.badge || ''} ${scene.subtext || ''}`.toLowerCase();

  if (
    text.includes('chmod') ||
    text.includes('chown') ||
    text.includes('permission') ||
    text.includes('ownership') ||
    text.includes('user') ||
    text.includes('group')
  ) {
    return 'permissions_matrix';
  }
  if (
    text.includes('docker') ||
    text.includes('container') ||
    text.includes('image') ||
    text.includes('volume') ||
    text.includes('dockerfile')
  ) {
    return 'container_stack';
  }
  if (
    text.includes('git') ||
    text.includes('github') ||
    text.includes('commit') ||
    text.includes('branch') ||
    text.includes('merge') ||
    text.includes('pull request') ||
    text.includes('pr ')
  ) {
    return 'git_graph';
  }
  if (
    text.includes('network') ||
    text.includes('dns') ||
    text.includes(' ip') ||
    text.includes('port') ||
    text.includes('http') ||
    text.includes('curl') ||
    text.includes('tcp') ||
    text.includes('socket')
  ) {
    return 'network_flow';
  }
  if (text.includes('ci/cd') || text.includes('pipeline') || text.includes('deploy')) {
    return 'pipeline_flow';
  }

  return scene.visualMetaphor || 'folder_drawer';
}

interface HookVisualProps {
  scene: HookSceneType;
  frame: number;
  fps: number;
}

const HookVisual: React.FC<HookVisualProps> = ({ scene, frame, fps }) => {
  const theme = useBrandTheme();
  const kind = resolveVisualMetaphor(scene);

  // Sliding active drawer animation
  const drawerSlide = spring({
    frame: frame - 18,
    fps,
    config: { damping: 12, stiffness: 90 },
  });
  const drawerOffset = interpolate(drawerSlide, [0, 1], [0, 56]);

  // 1. Linux Permissions & Ownership (chmod vs chown)
  if (kind === 'permissions_matrix') {
    return (
      <div
        style={{
          width: '640px',
          backgroundColor: '#110F17', // Black background
          borderRadius: '36px',
          padding: '36px',
          boxShadow: '0 35px 80px rgba(0, 0, 0, 0.55)',
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
            color: '#FFFFFF', // White text
            textTransform: 'uppercase',
            paddingLeft: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <ShieldCheck size={22} color="#FFFFFF" strokeWidth={2.4} /> {/* White accent icon */}
          <span>LINUX MACHINE • ACCESS CONTROL</span>
        </div>

        {/* Slot 1: User / Owner */}
        <div
          style={{
            backgroundColor: '#1C1824',
            borderRadius: '20px',
            padding: '24px 32px',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'rgba(255, 255, 255, 0.6)',
            fontFamily: theme.fonts.mono,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <User size={28} color="#FFFFFF" /> {/* White accent */}
            <span>chown developer:staff</span>
          </div>
          <span style={{ fontSize: '15px', color: '#FFFFFF', opacity: 0.8 }}>USER:GROUP</span>
        </div>

        {/* Slot 2: Active Sliding chmod Drawer (White accent + Purple text) */}
        <div
          style={{
            transform: `translateX(${drawerOffset}px)`,
            backgroundColor: '#1C1824',
            borderRadius: '20px',
            padding: '24px 32px',
            border: '2px solid #FFFFFF', // White border
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7), 0 0 25px rgba(120, 60, 235, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '26px',
            fontWeight: 900,
            color: theme.colors.brightAccent, // Purple text!
            fontFamily: theme.fonts.mono,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Key size={32} color="#FFFFFF" strokeWidth={2.5} /> {/* White accent! */}
            <span>chmod 755 app.sh</span>
          </div>
          <span
            style={{
              fontSize: '16px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(120, 60, 235, 0.35)',
              border: '1px solid #FFFFFF',
              color: '#FFFFFF', // White accent badge
              letterSpacing: '0.08em',
            }}
          >
            rwxr-xr-x
          </span>
        </div>

        {/* Slot 3: Security Policy */}
        <div
          style={{
            backgroundColor: '#1C1824',
            borderRadius: '20px',
            padding: '24px 32px',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'rgba(255, 255, 255, 0.6)',
            fontFamily: theme.fonts.mono,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Users size={28} color="#FFFFFF" /> {/* White accent */}
            <span>chmod u+x,g-w,o=r</span>
          </div>
          <span style={{ fontSize: '15px', color: '#FFFFFF', opacity: 0.8 }}>PERMISSIONS</span>
        </div>
      </div>
    );
  }

  // 2. Git & GitHub Repository Flow
  if (kind === 'git_graph') {
    return (
      <div
        style={{
          width: '640px',
          backgroundColor: '#110F17', // Black background
          borderRadius: '36px',
          padding: '36px',
          boxShadow: '0 35px 80px rgba(0, 0, 0, 0.55)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
        }}
      >
        <div
          style={{
            fontSize: '18px',
            fontFamily: theme.fonts.mono,
            fontWeight: 800,
            letterSpacing: '0.14em',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            paddingLeft: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <GitBranch size={22} color="#FFFFFF" strokeWidth={2.4} /> {/* White accent */}
          <span>GIT REPOSITORY • VERSION CONTROL</span>
        </div>

        <div
          style={{
            backgroundColor: '#1C1824',
            borderRadius: '20px',
            padding: '24px 32px',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            fontSize: '22px',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.6)',
            fontFamily: theme.fonts.mono,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <GitCommit size={28} color="#FFFFFF" />
            <span>commit a8f21e9 : HEAD~1</span>
          </div>
          <span style={{ fontSize: '15px', color: '#FFFFFF', opacity: 0.8 }}>COMMITTED</span>
        </div>

        {/* Slot 2: Active Sliding Push Drawer */}
        <div
          style={{
            transform: `translateX(${drawerOffset}px)`,
            backgroundColor: '#1C1824',
            borderRadius: '20px',
            padding: '24px 32px',
            border: '2px solid #FFFFFF',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7), 0 0 25px rgba(120, 60, 235, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '26px',
            fontWeight: 900,
            color: theme.colors.brightAccent, // Purple text!
            fontFamily: theme.fonts.mono,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <GitBranch size={32} color="#FFFFFF" strokeWidth={2.5} /> {/* White accent! */}
            <span>git push origin main</span>
          </div>
          <span
            style={{
              fontSize: '16px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(120, 60, 235, 0.35)',
              border: '1px solid #FFFFFF',
              color: '#FFFFFF',
            }}
          >
            SYNCED
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#1C1824',
            borderRadius: '20px',
            padding: '24px 32px',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            fontSize: '22px',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.6)',
            fontFamily: theme.fonts.mono,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <GitPullRequest size={28} color="#FFFFFF" />
            <span>origin/main : remote branch</span>
          </div>
          <span style={{ fontSize: '15px', color: '#FFFFFF', opacity: 0.8 }}>REMOTE</span>
        </div>
      </div>
    );
  }

  // 3. Networking & Ports
  if (kind === 'network_flow') {
    return (
      <div
        style={{
          width: '640px',
          backgroundColor: '#110F17', // Black background
          borderRadius: '36px',
          padding: '36px',
          boxShadow: '0 35px 80px rgba(0, 0, 0, 0.55)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
        }}
      >
        <div
          style={{
            fontSize: '18px',
            fontFamily: theme.fonts.mono,
            fontWeight: 800,
            letterSpacing: '0.14em',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            paddingLeft: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Network size={22} color="#FFFFFF" strokeWidth={2.4} /> {/* White accent */}
          <span>NETWORK TOPOLOGY • PORT MAP</span>
        </div>

        <div
          style={{
            backgroundColor: '#1C1824',
            borderRadius: '20px',
            padding: '24px 32px',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            fontSize: '22px',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.6)',
            fontFamily: theme.fonts.mono,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Laptop size={28} color="#FFFFFF" />
            <span>CLIENT IP: 192.168.1.105</span>
          </div>
          <span style={{ fontSize: '15px', color: '#FFFFFF', opacity: 0.8 }}>LOCAL</span>
        </div>

        {/* Slot 2: Active Sliding Route Drawer */}
        <div
          style={{
            transform: `translateX(${drawerOffset}px)`,
            backgroundColor: '#1C1824',
            borderRadius: '20px',
            padding: '24px 32px',
            border: '2px solid #FFFFFF',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7), 0 0 25px rgba(120, 60, 235, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '26px',
            fontWeight: 900,
            color: theme.colors.brightAccent, // Purple text!
            fontFamily: theme.fonts.mono,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Network size={32} color="#FFFFFF" strokeWidth={2.5} /> {/* White accent! */}
            <span>TCP ROUTE :443 HTTPS</span>
          </div>
          <span
            style={{
              fontSize: '16px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(120, 60, 235, 0.35)',
              border: '1px solid #FFFFFF',
              color: '#FFFFFF',
            }}
          >
            CONNECTED
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#1C1824',
            borderRadius: '20px',
            padding: '24px 32px',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            fontSize: '22px',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.6)',
            fontFamily: theme.fonts.mono,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Server size={28} color="#FFFFFF" />
            <span>UPSTREAM: 10.0.0.1:8080</span>
          </div>
          <span style={{ fontSize: '15px', color: '#FFFFFF', opacity: 0.8 }}>BACKEND</span>
        </div>
      </div>
    );
  }

  // 4. Docker & Containers
  if (kind === 'container_stack') {
    return (
      <div
        style={{
          width: '640px',
          backgroundColor: '#110F17', // Black background
          borderRadius: '36px',
          padding: '36px',
          boxShadow: '0 35px 80px rgba(0, 0, 0, 0.55)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
        }}
      >
        <div
          style={{
            fontSize: '18px',
            fontFamily: theme.fonts.mono,
            fontWeight: 800,
            letterSpacing: '0.14em',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            paddingLeft: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Server size={22} color="#FFFFFF" strokeWidth={2.4} /> {/* White accent */}
          <span>DOCKER ENGINE • HOST MACHINE</span>
        </div>

        <div
          style={{
            backgroundColor: '#1C1824',
            borderRadius: '20px',
            padding: '24px 32px',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            fontSize: '22px',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.6)',
            fontFamily: theme.fonts.mono,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Layers size={28} color="#FFFFFF" />
            <span>api-gateway</span>
          </div>
          <span style={{ fontSize: '16px', color: '#FFFFFF', opacity: 0.8 }}>:3000</span>
        </div>

        {/* Slot 2: Active Sliding Container (White accent + Purple text) */}
        <div
          style={{
            transform: `translateX(${drawerOffset}px)`,
            backgroundColor: '#1C1824',
            borderRadius: '20px',
            padding: '24px 32px',
            border: '2px solid #FFFFFF',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7), 0 0 25px rgba(120, 60, 235, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '26px',
            fontWeight: 900,
            color: theme.colors.brightAccent, // Purple text!
            fontFamily: theme.fonts.mono,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Box size={32} color="#FFFFFF" strokeWidth={2.5} /> {/* White accent! */}
            <span>web-app:latest</span>
          </div>
          <span
            style={{
              fontSize: '16px',
              padding: '6px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(120, 60, 235, 0.35)',
              border: '1px solid #FFFFFF',
              color: '#FFFFFF',
            }}
          >
            RUNNING :8080
          </span>
        </div>

        <div
          style={{
            backgroundColor: '#1C1824',
            borderRadius: '20px',
            padding: '24px 32px',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            fontSize: '22px',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.6)',
            fontFamily: theme.fonts.mono,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Server size={28} color="#FFFFFF" />
            <span>db-postgres</span>
          </div>
          <span style={{ fontSize: '16px', color: '#FFFFFF', opacity: 0.8 }}>:5432</span>
        </div>
      </div>
    );
  }

  // 5. CI/CD Workflow
  if (kind === 'pipeline_flow') {
    const stages = [
      { label: 'BUILD', icon: FileText, active: false },
      { label: 'TEST', icon: Layers, active: true },
      { label: 'DEPLOY', icon: Rocket, active: false },
    ];

    return (
      <div
        style={{
          width: '640px',
          backgroundColor: '#110F17', // Black background
          borderRadius: '36px',
          padding: '36px',
          boxShadow: '0 35px 80px rgba(0, 0, 0, 0.55)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          position: 'relative',
        }}
      >
        <div
          style={{
            fontSize: '18px',
            fontFamily: theme.fonts.mono,
            fontWeight: 800,
            letterSpacing: '0.14em',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            paddingLeft: '12px',
          }}
        >
          CI/CD PIPELINE • AUTOMATED STAGES
        </div>

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
                    backgroundColor: '#1C1824',
                    border: isActive ? '2px solid #FFFFFF' : '1.5px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: isActive ? '0 0 25px rgba(120, 60, 235, 0.5)' : 'none',
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
                    color="#FFFFFF" // White accent icon!
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span
                    style={{
                      fontFamily: theme.fonts.mono,
                      fontSize: '18px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      color: isActive ? theme.colors.brightAccent : 'rgba(255, 255, 255, 0.6)', // Purple text on active!
                    }}
                  >
                    {stage.label}
                  </span>
                </div>

                {idx < stages.length - 1 && (
                  <ArrowRight size={22} color="#FFFFFF" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }

  // 6. Default: Linux Filesystem /etc Drawer
  return (
    <div
      style={{
        width: '640px',
        backgroundColor: '#110F17', // Black background
        borderRadius: '36px',
        padding: '36px',
        boxShadow: '0 35px 80px rgba(0, 0, 0, 0.55)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative',
      }}
    >
      <div
        style={{
          fontSize: '18px',
          fontFamily: theme.fonts.mono,
          fontWeight: 800,
          letterSpacing: '0.14em',
          color: '#FFFFFF',
          textTransform: 'uppercase',
          paddingLeft: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <Folder size={22} color="#FFFFFF" strokeWidth={2.4} /> {/* White accent */}
        <span>LINUX MACHINE • FILESYSTEM</span>
      </div>

      <div
        style={{
          backgroundColor: '#1C1824',
          borderRadius: '20px',
          padding: '24px 32px',
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          fontSize: '22px',
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.6)',
          fontFamily: theme.fonts.mono,
        }}
      >
        SYSTEM DRAWER 01
      </div>

      {/* Drawer 2 (SLIDING ACTIVE DRAWER): White accent + Purple text */}
      <div
        style={{
          transform: `translateX(${drawerOffset}px)`,
          backgroundColor: '#1C1824',
          borderRadius: '20px',
          padding: '24px 32px',
          border: '2px solid #FFFFFF', // White border
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7), 0 0 25px rgba(120, 60, 235, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          fontSize: '32px',
          fontWeight: 900,
          color: theme.colors.brightAccent, // Purple text!
          fontFamily: theme.fonts.mono,
          zIndex: 10,
        }}
      >
        <Folder size={36} color="#FFFFFF" strokeWidth={2.5} /> {/* White accent icon! */}
        <span>/etc</span>
      </div>

      <div
        style={{
          backgroundColor: '#1C1824',
          borderRadius: '20px',
          padding: '24px 32px',
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          fontSize: '22px',
          fontWeight: 700,
          color: 'rgba(255, 255, 255, 0.6)',
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
 * Rules:
 * - 3 Colors Only: Purple (#783CEB), Black (#110F17), White (#FFFFFF)
 * - Canvas Background: Solid Purple
 * - Canvas Text: White (#FFFFFF)
 * - Highlighted Word: Black box behind that specific word with high contrast
 * - Middle Diagram: Black background, white accents/icons, purple text
 * - Platform Safe Area (80/20 Rule): All essential elements inside upper 80% (1536px), bottom 20% clear.
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
        backgroundColor: theme.colors.brandPrimary, // Solid Purple Canvas
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
              color: '#FFFFFF', // White text
              textTransform: 'uppercase',
              marginBottom: '28px',
              opacity: 0.85,
            }}
          >
            {scene.badge || 'DEVOPS ESSENTIALS • 01'}
          </div>

          {/* Headline (White text + Black box behind highlighted words) */}
          <h1
            style={{
              fontSize: '84px',
              fontWeight: 900,
              lineHeight: 1.15,
              color: '#FFFFFF',
              letterSpacing: '-0.04em',
              margin: 0,
              maxWidth: '920px',
              fontFamily: theme.fonts.heading,
            }}
          >
            {renderHookTextWithBlackBox(scene.headline, '#FFFFFF', theme.colors.brightAccent)}
          </h1>
        </div>

        {/* Tier 2 (Middle): Visual Metaphor Card with Black Background, White Accents, Purple Text */}
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
          <HookVisual scene={scene} frame={frame} fps={fps} />
        </div>

        {/* Tier 3 (Bottom): Animated Subtitles Pill starting immediately from 0:00 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '120px',
            width: '100%',
          }}
        >
          <AnimatedSubtitles
            voiceover={scene.voiceover || scene.subtext}
            durationSeconds={scene.durationSeconds}
            isHook={true}
            subtitles={scene.subtitles}
          />
        </div>
      </div>
    </div>
  );
};
