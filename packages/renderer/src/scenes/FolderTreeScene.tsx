import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Folder, FolderTree, FileCode, HardDrive, ShieldCheck, Terminal, FileText } from 'lucide-react';
import { useBrandTheme, renderHighlightedText } from '../styles/theme.js';
import { AnimatedSubtitles } from '../components/AnimatedSubtitles.js';
import type { FolderTreeScene as FolderTreeSceneType } from '@learnops/schema';

/**
 * Scene 2: Core Explanation (Folder Tree / Linux Filesystem Hierarchy)
 *
 * Implements an authentic Linux Directory Hierarchy Visualizer:
 * - Tier 1 (Top): Kicker & 84px bold headline left-aligned directly on canvas.
 * - Tier 2 (Middle):
 *   - Linux Filesystem Explorer Pane with tree branch connectors.
 *   - Structured directory rows with Lucide icons, octal/unix permission tags,
 *     and explanatory purpose notes.
 *   - Telemetry footer: "EXT4 JOURNALED • VIRTUAL FILESYSTEM (VFS)"
 * - Tier 3 (Bottom): Animated Subtitles starting from 0:00.
 * - Safe Area: Contained within upper 80% (1536px), bottom 20% clear.
 * - Zero Emojis: Lucide SVG icons only.
 */
export const FolderTreeScene: React.FC<{ scene: FolderTreeSceneType }> = ({ scene }) => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animations
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const paneSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

  const footerSpring = spring({
    frame: frame - 22,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Extract up to 4 nodes from tree or provide authentic Linux defaults
  const fileNodes = scene.tree && scene.tree.length > 0
    ? scene.tree.slice(0, 4).map((item, idx) => ({
        name: item.name.startsWith('/') ? item.name : `${scene.rootPath || '/'}/${item.name}`.replace('//', '/'),
        desc: item.description || (item.isDirectory ? 'System directory' : 'System configuration'),
        type: item.isDirectory ? 'DIR' : 'CONF',
        perms: item.isDirectory ? 'drwxr-xr-x' : '-rw-r--r--',
        isDir: item.isDirectory !== false,
      }))
    : [
        { name: '/etc/hosts', desc: 'Local hostname IP resolution', type: 'CONF', perms: '-rw-r--r--', isDir: false },
        { name: '/etc/fstab', desc: 'Filesystem mount table at boot', type: 'CONF', perms: '-rw-r--r--', isDir: false },
        { name: '/etc/systemd', desc: 'Service unit configurations', type: 'DIR', perms: 'drwxr-xr-x', isDir: true },
        { name: '/etc/passwd', desc: 'User account & UID database', type: 'CONF', perms: '-rw-r--r--', isDir: false },
      ];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.deepBackground, // Deep matte canvas
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
              LINUX FILESYSTEM • 01
            </span>

            {/* Accent Line Indicator on Top Right */}
            <div
              style={{
                width: '48px',
                height: '6px',
                borderRadius: '999px',
                backgroundColor: theme.colors.brandPrimary,
              }}
            />
          </div>

          {/* Headline (Left-aligned, massive 84px, white text) */}
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
            {renderHighlightedText(scene.title, '#FFFFFF', theme.colors.brightAccent)}
          </h1>
        </div>

        {/* Tier 2 (Middle): Authentic Linux Filesystem Explorer Pane */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            margin: 'auto 0',
            width: '100%',
            opacity: paneSpring,
            transform: `translateY(${(1 - paneSpring) * 20}px)`,
          }}
        >
          {/* Tree Explorer Card Window */}
          <div
            style={{
              width: '100%',
              backgroundColor: theme.colors.cardSurface,
              borderRadius: '28px',
              border: '2px solid rgba(255, 255, 255, 0.4)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 25px rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            {/* Window Title Bar */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.06)',
                padding: '16px 24px',
                borderBottom: '1.5px solid rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* Window Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                <span
                  style={{
                    marginLeft: '12px',
                    fontSize: '15px',
                    fontFamily: theme.fonts.mono,
                    fontWeight: 700,
                    color: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  tree -p {scene.rootPath || '/etc'}
                </span>
              </div>

              {/* Root Directory Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '4px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  fontSize: '15px',
                  fontFamily: theme.fonts.mono,
                  fontWeight: 800,
                  color: '#FFFFFF',
                }}
              >
                <Folder size={16} color="#FFFFFF" />
                <span>ROOT: {scene.rootPath || '/'}</span>
              </div>
            </div>

            {/* Tree Rows Container */}
            <div
              style={{
                padding: '24px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              {fileNodes.map((node, idx) => {
                const isLast = idx === fileNodes.length - 1;
                const rowSpring = spring({
                  frame: frame - (8 + idx * 5),
                  fps,
                  config: { damping: 14, stiffness: 130 },
                });

                return (
                  <div
                    key={node.name}
                    style={{
                      transform: `translateX(${(1 - rowSpring) * 30}px)`,
                      opacity: rowSpring,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: idx === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '16px',
                      padding: '16px 20px',
                      border: idx === 0
                        ? '1.5px solid #FFFFFF'
                        : '1px solid rgba(255, 255, 255, 0.12)',
                    }}
                  >
                    {/* Left: Tree Branch Line + Icon + Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {/* Tree branch graphic */}
                      <span
                        style={{
                          fontFamily: theme.fonts.mono,
                          fontSize: '22px',
                          color: 'rgba(255, 255, 255, 0.45)',
                          fontWeight: 700,
                        }}
                      >
                        {isLast ? '└──' : '├──'}
                      </span>

                      {/* Icon */}
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          backgroundColor: node.isDir ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                          border: node.isDir ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {node.isDir ? (
                          <Folder size={22} color="#60A5FA" />
                        ) : (
                          <FileCode size={22} color="#FFFFFF" />
                        )}
                      </div>

                      {/* File Path & Purpose */}
                      <div>
                        <div
                          style={{
                            fontSize: '24px',
                            fontFamily: theme.fonts.mono,
                            fontWeight: 800,
                            color: idx === 0 ? theme.colors.brightAccent : '#FFFFFF',
                          }}
                        >
                          {node.name}
                        </div>
                        <div
                          style={{
                            fontSize: '17px',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginTop: '2px',
                            fontFamily: theme.fonts.body,
                          }}
                        >
                          {node.desc}
                        </div>
                      </div>
                    </div>

                    {/* Right: Permission String & Type Tag */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '15px',
                          fontFamily: theme.fonts.mono,
                          fontWeight: 700,
                          color: 'rgba(255, 255, 255, 0.55)',
                        }}
                      >
                        {node.perms}
                      </span>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: node.isDir ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                          border: node.isDir ? '1px solid #3B82F6' : '1px solid rgba(255, 255, 255, 0.2)',
                          fontSize: '13px',
                          fontFamily: theme.fonts.mono,
                          fontWeight: 800,
                          color: node.isDir ? '#93C5FD' : '#FFFFFF',
                          textTransform: 'uppercase',
                        }}
                      >
                        {node.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Telemetry Footer */}
          <div
            style={{
              transform: `translateY(${(1 - footerSpring) * 15}px)`,
              opacity: footerSpring,
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 28px',
              borderRadius: '14px',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              fontSize: '17px',
              fontFamily: theme.fonts.mono,
              fontWeight: 700,
              color: 'rgba(255, 255, 255, 0.75)',
            }}
          >
            <span style={{ color: '#10B981' }}>● VFS ACTIVE</span>
            <span>•</span>
            <span>EXT4 JOURNALED</span>
            <span>•</span>
            <span style={{ color: theme.colors.brightAccent }}>POSIX COMPLIANT</span>
          </div>
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
            voiceover={scene.voiceover || scene.explanation}
            durationSeconds={scene.durationSeconds}
            isHook={false}
            subtitles={scene.subtitles}
          />
        </div>
      </div>
    </div>
  );
};
