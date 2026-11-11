import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Folder, FileText, HardDrive, Network, ShieldCheck } from 'lucide-react';
import { useBrandTheme, renderHighlightedText } from '../styles/theme.js';
import type { FolderTreeScene as FolderTreeSceneType, FolderNode } from '@learnops/schema';

/**
 * Scene 2: Core Explanation (Folder Tree / Linux Filesystem)
 *
 * Adheres strictly to the Unified 3-Tier Visual Architecture:
 * - Tier 1 (Top): Kicker & 84px bold headline left-aligned directly on canvas.
 * - Tier 2 (Middle): Vertical 3-card stack branching from root path node.
 * - Tier 3 (Bottom): Explanatory subtext & monospace pill open directly on canvas.
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

  const rootNodeSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  const subtextSpring = spring({
    frame: frame - 28,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Extract up to 3 cards from tree or provide defaults
  const fileCards = scene.tree && scene.tree.length > 0
    ? scene.tree.slice(0, 3).map((item, idx) => ({
        id: item.name,
        path: item.name.startsWith('/') ? item.name : `${scene.rootPath || '/etc'}/${item.name}`,
        desc: item.description || (item.isDirectory ? 'System directory' : 'Configuration file'),
        tag: item.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10),
        icon: idx === 0 ? Network : idx === 1 ? HardDrive : ShieldCheck,
      }))
    : [
        { id: 'hosts', path: '/etc/hosts', desc: 'Name → address', tag: 'HOSTS', icon: Network },
        { id: 'fstab', path: '/etc/fstab', desc: 'Filesystems at boot', tag: 'FSTAB', icon: HardDrive },
        { id: 'sshd', path: '/etc/ssh/sshd_config', desc: 'SSH server rules', tag: 'SSHD_CONFIG', icon: ShieldCheck },
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
              INSIDE THE SYSTEM • 01
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

        {/* Tier 2 (Middle): Vertical 3-Card Stack with Root Path Node */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
            margin: 'auto 0',
            width: '100%',
          }}
        >
          {/* Central Root Path Node */}
          <div
            style={{
              transform: `scale(${rootNodeSpring})`,
              opacity: rootNodeSpring,
              padding: '14px 44px',
              borderRadius: '18px',
              backgroundColor: theme.colors.brandPrimary,
              boxShadow: `0 0 25px ${theme.colors.primaryGlow}`,
              fontSize: '36px',
              fontWeight: 900,
              fontFamily: theme.fonts.mono,
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Folder size={32} color="#FFFFFF" strokeWidth={2.5} />
            <span>{scene.rootPath || '/etc'}</span>
          </div>

          {/* Vertical Connecting Stem Line */}
          <div
            style={{
              width: '3px',
              height: '24px',
              backgroundColor: theme.colors.brandPrimary,
              opacity: rootNodeSpring,
            }}
          />

          {/* 3 Staggered File Cards */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              width: '100%',
            }}
          >
            {fileCards.map((card, idx) => {
              const cardSpring = spring({
                frame: frame - (6 + idx * 5),
                fps,
                config: { damping: 14, stiffness: 130 },
              });

              const IconComponent = card.icon;

              return (
                <div
                  key={card.id}
                  style={{
                    transform: `translateY(${(1 - cardSpring) * 25}px)`,
                    opacity: cardSpring,
                    backgroundColor: theme.colors.cardSurface,
                    borderRadius: '24px',
                    padding: '22px 30px',
                    border: '1.5px solid rgba(255, 255, 255, 0.10)',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
                    {/* Lucide SVG Icon Badge */}
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent size={28} color={theme.colors.brightAccent} strokeWidth={2.2} />
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '24px',
                          fontFamily: theme.fonts.mono,
                          fontWeight: 800,
                          color: theme.colors.brightAccent,
                          marginBottom: '4px',
                        }}
                      >
                        {card.path}
                      </div>
                      <div
                        style={{
                          fontSize: '30px',
                          fontWeight: 800,
                          color: '#FFFFFF',
                          fontFamily: theme.fonts.heading,
                        }}
                      >
                        {card.desc}
                      </div>
                    </div>
                  </div>

                  {/* Right Tag */}
                  <div
                    style={{
                      fontSize: '15px',
                      fontFamily: theme.fonts.mono,
                      fontWeight: 800,
                      letterSpacing: '0.1em',
                      color: theme.colors.mutedText,
                      textTransform: 'uppercase',
                    }}
                  >
                    {card.tag}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tier 3 (Bottom): Explanatory Subtext & Monospace Pill directly on canvas */}
        <div
          style={{
            transform: `translateY(${(1 - subtextSpring) * 20}px)`,
            opacity: subtextSpring,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'center',
          }}
        >
          {scene.explanation && (
            <p
              style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#FFFFFF',
                margin: 0,
                fontFamily: theme.fonts.heading,
                maxWidth: '920px',
                lineHeight: 1.25,
              }}
            >
              {renderHighlightedText(scene.explanation, '#FFFFFF', theme.colors.brightAccent)}
            </p>
          )}

          <span
            style={{
              fontSize: '20px',
              fontFamily: theme.fonts.mono,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.75)',
            }}
          >
            CONFIGURATION IS OFTEN HUMAN-READABLE TEXT
          </span>
        </div>
      </div>
    </div>
  );
};
