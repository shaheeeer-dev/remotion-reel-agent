import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  ArrowRight,
  Box,
  Check,
  CheckCircle2,
  FileText,
  Folder,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Globe,
  Key,
  Laptop,
  Layers,
  Network,
  Play,
  Rocket,
  Server,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { useBrandTheme } from '../styles/theme.js';
import { AnimatedSubtitles } from '../components/AnimatedSubtitles.js';
import type { HookScene as HookSceneType } from '@learnops/schema';

/**
 * Renders text on the canvas with a high-contrast container behind highlighted terms (*word* or `word`).
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
            backgroundColor: '#110F17',
            color: highlightTextColor,
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
 * Resolves the visual metaphor dynamically based on topic keywords and schema:
 * - container_stack: Docker, containers, images, volumes, kubernetes pods
 * - pipeline_flow / git_graph: CI/CD, Git, GitHub, automation, workflows
 * - network_flow: Networking, DNS, IP addresses, ports, HTTP, sockets
 * - permissions_matrix: chmod, chown, user, permissions, security
 * - folder_drawer: Linux filesystem, /etc, directories, config files
 */
function resolveVisualMetaphor(scene: HookSceneType): string {
  if (scene.visualMetaphor) {
    return scene.visualMetaphor;
  }

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
    text.includes('pod') ||
    text.includes('kubernetes') ||
    text.includes('k8s') ||
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
    text.includes('127.0.0.1') ||
    text.includes('0.0.0.0') ||
    text.includes('localhost') ||
    text.includes(' ip') ||
    text.includes('port') ||
    text.includes('http') ||
    text.includes('curl') ||
    text.includes('tcp') ||
    text.includes('socket') ||
    text.includes('nginx') ||
    text.includes('proxy') ||
    text.includes('load balanc') ||
    text.includes('upstream')
  ) {
    return 'network_flow';
  }
  if (text.includes('ci/cd') || text.includes('pipeline') || text.includes('deploy') || text.includes('build')) {
    return 'pipeline_flow';
  }

  return 'folder_drawer';
}

interface HookVisualProps {
  scene: HookSceneType;
  frame: number;
  fps: number;
}

const HookVisual: React.FC<HookVisualProps> = ({ scene, frame, fps }) => {
  const theme = useBrandTheme();
  const kind = resolveVisualMetaphor(scene);

  // 1. Docker & Container Image Recipe Stack (matching reference video ref_docker_1s.png)
  if (kind === 'container_stack') {
    const layer1 = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 120 } });
    const layer2 = spring({ frame: frame - 12, fps, config: { damping: 14, stiffness: 120 } });
    const layer3 = spring({ frame: frame - 20, fps, config: { damping: 14, stiffness: 120 } });

    return (
      <div
        style={{
          width: '740px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Top Header Monospace Pill */}
        <div
          style={{
            backgroundColor: '#110F17',
            padding: '12px 32px',
            borderRadius: '16px',
            border: '1.5px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Box size={22} color="#00E5FF" />
          <span
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: '20px',
              fontWeight: 800,
              color: '#00E5FF',
              letterSpacing: '0.08em',
            }}
          >
            IMAGE: learnops-app:v1
          </span>
        </div>

        {/* Layer 1: Base Filesystem */}
        <div
          style={{
            width: '100%',
            backgroundColor: '#110F17',
            borderRadius: '22px',
            padding: '20px 28px',
            border: '2px solid #3B82F6',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            opacity: layer1,
            transform: `translateY(${(1 - layer1) * 20}px)`,
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: '#1E3A8A',
              color: '#93C5FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: theme.fonts.mono,
              fontSize: '22px',
              fontWeight: 900,
            }}
          >
            1
          </div>
          <div>
            <div
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: '20px',
                fontWeight: 800,
                color: '#93C5FD',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              BASE FILESYSTEM
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '18px', fontWeight: 600 }}>
              alpine linux rootfs • distribution files
            </div>
          </div>
        </div>

        {/* Layer 2: Libraries & Runtime */}
        <div
          style={{
            width: '100%',
            backgroundColor: '#110F17',
            borderRadius: '22px',
            padding: '20px 28px',
            border: '2px solid #10B981',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            opacity: layer2,
            transform: `translateY(${(1 - layer2) * 20}px)`,
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: '#064E3B',
              color: '#6EE7B7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: theme.fonts.mono,
              fontSize: '22px',
              fontWeight: 900,
            }}
          >
            2
          </div>
          <div>
            <div
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: '20px',
                fontWeight: 800,
                color: '#6EE7B7',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              LIBRARIES & RUNTIME
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '18px', fontWeight: 600 }}>
              node.js v22 • shared system dependencies
            </div>
          </div>
        </div>

        {/* Layer 3: Application Code & Entrypoint */}
        <div
          style={{
            width: '100%',
            backgroundColor: '#110F17',
            borderRadius: '22px',
            padding: '20px 28px',
            border: '2px solid #A855F7',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            opacity: layer3,
            transform: `translateY(${(1 - layer3) * 20}px)`,
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: '#581C87',
              color: '#E9D5FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: theme.fonts.mono,
              fontSize: '22px',
              fontWeight: 900,
            }}
          >
            3
          </div>
          <div>
            <div
              style={{
                fontFamily: theme.fonts.mono,
                fontSize: '20px',
                fontWeight: 800,
                color: '#E9D5FF',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              APP CODE & ENTRYPOINT
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '18px', fontWeight: 600 }}>
              server.js • listening on port 0.0.0.0:8080
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. CI/CD & Git Developer-to-Automation Node Flow (matching ref_cicd_1s.png)
  if (kind === 'pipeline_flow' || kind === 'git_graph') {
    const leftSpring = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 120 } });
    const rightSpring = spring({ frame: frame - 16, fps, config: { damping: 14, stiffness: 120 } });

    return (
      <div
        style={{
          width: '780px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        {/* Left Card: DEVELOPER */}
        <div
          style={{
            width: '280px',
            backgroundColor: '#110F17',
            borderRadius: '28px',
            padding: '28px 24px',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            opacity: leftSpring,
            transform: `translateX(${(1 - leftSpring) * -30}px)`,
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: '18px',
              fontWeight: 800,
              color: 'rgba(255, 255, 255, 0.65)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            DEVELOPER
          </div>
          <div
            style={{
              backgroundColor: '#1C1824',
              borderRadius: '12px',
              padding: '10px 16px',
              color: '#FFFFFF',
              fontFamily: theme.fonts.mono,
              fontSize: '17px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ color: '#10B981', fontWeight: 900 }}>+</span>
            <span>feature branch</span>
          </div>
          <div
            style={{
              backgroundColor: '#1C1824',
              borderRadius: '12px',
              padding: '10px 16px',
              color: '#FFFFFF',
              fontFamily: theme.fonts.mono,
              fontSize: '17px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span style={{ color: '#00E5FF' }}>✓</span>
            <span>commit code</span>
          </div>
        </div>

        {/* Center Connecting Wire with Glowing Git Badge */}
        <div
          style={{
            flex: 1,
            height: '4px',
            backgroundColor: '#110F17',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 8px',
          }}
        >
          {/* Glowing Git Node */}
          <div
            style={{
              padding: '8px 18px',
              borderRadius: '14px',
              backgroundColor: '#10B981',
              color: '#064E3B',
              fontFamily: theme.fonts.mono,
              fontWeight: 900,
              fontSize: '18px',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              zIndex: 3,
            }}
          >
            <GitBranch size={20} color="#064E3B" strokeWidth={2.8} />
            <span>git</span>
          </div>
        </div>

        {/* Right Card: AUTOMATION (CI/CD) */}
        <div
          style={{
            width: '280px',
            backgroundColor: '#F3F0E6',
            color: '#110F17',
            borderRadius: '28px',
            padding: '28px 24px',
            border: '2px solid rgba(0, 0, 0, 0.15)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            opacity: rightSpring,
            transform: `translateX(${(1 - rightSpring) * 30}px)`,
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontFamily: theme.fonts.mono,
              fontSize: '14px',
              fontWeight: 800,
              color: '#555555',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            AUTOMATION
          </div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 900,
              fontFamily: theme.fonts.heading,
              color: '#110F17',
            }}
          >
            CI/CD
          </div>
          <div
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#333333',
              lineHeight: 1.35,
            }}
          >
            Runs tests & deployment automatically after each push.
          </div>
        </div>
      </div>
    );
  }

  // 3. Networking & Sockets (Client to Server Topology Hop)
  if (kind === 'network_flow') {
    const clientSpring = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 120 } });
    const serverSpring = spring({ frame: frame - 16, fps, config: { damping: 14, stiffness: 120 } });

    return (
      <div
        style={{
          width: '780px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        {/* Client Node */}
        <div
          style={{
            width: '260px',
            backgroundColor: '#110F17',
            borderRadius: '28px',
            padding: '24px 20px',
            border: '2px solid #3B82F6',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            opacity: clientSpring,
            transform: `translateX(${(1 - clientSpring) * -25}px)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Laptop size={24} color="#3B82F6" />
            <span style={{ fontFamily: theme.fonts.mono, fontSize: '15px', color: '#93C5FD', fontWeight: 800 }}>
              CLIENT HOST
            </span>
          </div>
          <div style={{ fontFamily: theme.fonts.mono, fontSize: '20px', fontWeight: 900, color: '#FFFFFF' }}>
            192.168.1.100
          </div>
          <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Source socket</span>
        </div>

        {/* Center Connecting Wire with Port / Protocol Badge */}
        <div
          style={{
            flex: 1,
            height: '4px',
            backgroundColor: '#110F17',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 8px',
          }}
        >
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '12px',
              backgroundColor: '#00E5FF',
              color: '#00363A',
              fontFamily: theme.fonts.mono,
              fontWeight: 900,
              fontSize: '15px',
              boxShadow: '0 0 20px rgba(0, 229, 255, 0.7)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Network size={16} color="#00363A" strokeWidth={2.8} />
            <span>TCP :443</span>
          </div>
        </div>

        {/* Server Destination Node */}
        <div
          style={{
            width: '260px',
            backgroundColor: '#110F17',
            borderRadius: '28px',
            padding: '24px 20px',
            border: '2px solid #10B981',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            opacity: serverSpring,
            transform: `translateX(${(1 - serverSpring) * 25}px)`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Server size={24} color="#10B981" />
            <span style={{ fontFamily: theme.fonts.mono, fontSize: '15px', color: '#6EE7B7', fontWeight: 800 }}>
              LISTENER
            </span>
          </div>
          <div style={{ fontFamily: theme.fonts.mono, fontSize: '20px', fontWeight: 900, color: '#FFFFFF' }}>
            0.0.0.0 :8080
          </div>
          <span style={{ fontSize: '13px', color: '#6EE7B7', fontWeight: 700 }}>● ALL INTERFACES</span>
        </div>
      </div>
    );
  }

  // 4. Linux Permissions & Ownership (Octal 755 Grid)
  if (kind === 'permissions_matrix') {
    const cardEntrance = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 120 } });
    return (
      <div
        style={{
          width: '740px',
          backgroundColor: '#110F17',
          borderRadius: '32px',
          padding: '32px',
          border: '2px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          opacity: cardEntrance,
          transform: `translateY(${(1 - cardEntrance) * 20}px)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
            paddingBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={26} color="#00E5FF" />
            <span style={{ fontFamily: theme.fonts.mono, fontSize: '20px', fontWeight: 900, color: '#FFFFFF' }}>
              ACCESS CONTROL • chmod 755
            </span>
          </div>
          <span
            style={{
              padding: '4px 14px',
              borderRadius: '8px',
              backgroundColor: 'rgba(0, 229, 255, 0.2)',
              border: '1px solid #00E5FF',
              color: '#00E5FF',
              fontFamily: theme.fonts.mono,
              fontWeight: 800,
              fontSize: '15px',
            }}
          >
            rwxr-xr-x
          </span>
        </div>

        {/* 3 Octal Columns */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-between' }}>
          {/* User / Owner */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#1C1824',
              borderRadius: '20px',
              padding: '20px 16px',
              border: '2px solid #10B981',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <User size={26} color="#10B981" />
            <span style={{ fontFamily: theme.fonts.mono, fontSize: '15px', color: '#6EE7B7', fontWeight: 800 }}>USER</span>
            <span style={{ fontFamily: theme.fonts.mono, fontSize: '32px', color: '#FFFFFF', fontWeight: 900 }}>7</span>
            <span style={{ fontFamily: theme.fonts.mono, fontSize: '15px', color: '#10B981', fontWeight: 800 }}>r w x</span>
          </div>

          {/* Group */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#1C1824',
              borderRadius: '20px',
              padding: '20px 16px',
              border: '1.5px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Users size={26} color="#00E5FF" />
            <span style={{ fontFamily: theme.fonts.mono, fontSize: '15px', color: '#93C5FD', fontWeight: 800 }}>GROUP</span>
            <span style={{ fontFamily: theme.fonts.mono, fontSize: '32px', color: '#FFFFFF', fontWeight: 900 }}>5</span>
            <span style={{ fontFamily: theme.fonts.mono, fontSize: '15px', color: '#00E5FF', fontWeight: 800 }}>r - x</span>
          </div>

          {/* Other / Public */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#1C1824',
              borderRadius: '20px',
              padding: '20px 16px',
              border: '1.5px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Globe size={26} color="rgba(255, 255, 255, 0.6)" />
            <span style={{ fontFamily: theme.fonts.mono, fontSize: '15px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 800 }}>OTHER</span>
            <span style={{ fontFamily: theme.fonts.mono, fontSize: '32px', color: '#FFFFFF', fontWeight: 900 }}>5</span>
            <span style={{ fontFamily: theme.fonts.mono, fontSize: '15px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 800 }}>r - x</span>
          </div>
        </div>
      </div>
    );
  }

  // 5. Default: Linux Filesystem Filing Cabinet
  const drawerSlide = spring({
    frame: frame - 18,
    fps,
    config: { damping: 12, stiffness: 90 },
  });
  const drawerOffset = interpolate(drawerSlide, [0, 1], [0, 56]);

  return (
    <div
      style={{
        width: '640px',
        backgroundColor: '#110F17',
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
        <Folder size={22} color="#FFFFFF" strokeWidth={2.4} />
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
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <Folder size={28} color="#FFFFFF" />
        <span>/bin</span>
      </div>

      {/* Active Sliding /etc Drawer */}
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
          color: theme.colors.brightAccent,
          fontFamily: theme.fonts.mono,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Folder size={32} color="#FFFFFF" strokeWidth={2.5} />
          <span>/etc</span>
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
          CONFIG FILES
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
          gap: '16px',
        }}
      >
        <Folder size={28} color="#FFFFFF" />
        <span>/var</span>
      </div>
    </div>
  );
};

/**
 * Scene 1: The Hook (00:00 - 00:03, 3 sec)
 */
export const HookScene: React.FC<{ scene: HookSceneType }> = ({ scene }) => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const visualSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 15, stiffness: 110 },
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.brandPrimary,
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
        {/* Tier 1 (Top): Monospace Kicker & Bold Headline */}
        <div
          style={{
            transform: `translateY(${(1 - headerSpring) * 40}px)`,
            opacity: headerSpring,
          }}
        >
          <div
            style={{
              fontSize: '22px',
              fontFamily: theme.fonts.mono,
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              marginBottom: '28px',
              opacity: 0.85,
            }}
          >
            {scene.badge || 'DEVOPS ESSENTIALS • 01'}
          </div>

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

        {/* Tier 2 (Middle): Dynamic Visual Metaphor Card */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            transform: `scale(${visualSpring}) translateY(${(1 - visualSpring) * 40}px)`,
            opacity: visualSpring,
            margin: 'auto 0',
          }}
        >
          <HookVisual scene={scene} frame={frame} fps={fps} />
        </div>

        {/* Tier 3 (Bottom): Animated Subtitles */}
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
