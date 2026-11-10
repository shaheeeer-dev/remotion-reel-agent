import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { defaultTheme } from '../styles/theme.js';
import type { FolderTreeScene as FolderTreeSceneType, FolderNode } from '@learnops/schema';

export const FolderTreeScene: React.FC<{ scene: FolderTreeSceneType }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scene header spring
  const headerSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 110 },
  });

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
      {/* Scene Header */}
      <div
        style={{
          transform: `translateY(${(1 - headerSpring) * 30}px)`,
          opacity: headerSpring,
          marginBottom: '40px',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: defaultTheme.colors.primary,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: defaultTheme.fonts.heading,
          }}
        >
          Filesystem Anatomy
        </span>
        <h2
          style={{
            fontSize: '54px',
            fontWeight: 800,
            color: defaultTheme.colors.textPrimary,
            marginTop: '10px',
            letterSpacing: '-0.02em',
            fontFamily: defaultTheme.fonts.heading,
          }}
        >
          {scene.title}
        </h2>
      </div>

      {/* Main Tree Card */}
      <div
        style={{
          backgroundColor: 'rgba(21, 29, 42, 0.85)',
          border: `1.5px solid ${defaultTheme.colors.bgCardBorder}`,
          borderRadius: '28px',
          padding: '40px 48px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Tree Root */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '36px',
            fontFamily: defaultTheme.fonts.mono,
            fontWeight: 700,
            color: defaultTheme.colors.textSecondary,
          }}
        >
          <span style={{ fontSize: '40px' }}>📁</span>
          <span>{scene.rootPath} (root)</span>
        </div>

        {/* Child Items */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            paddingLeft: '36px',
            borderLeft: `3px dashed rgba(255, 255, 255, 0.15)`,
            marginLeft: '20px',
          }}
        >
          {scene.tree.map((node, index) => {
            const itemSpring = spring({
              frame: frame - (8 + index * 6),
              fps,
              config: { damping: 14, stiffness: 120 },
            });

            const isHighlighted = node.highlight || node.name.includes('/etc') || node.name === 'etc';

            return (
              <div
                key={node.name}
                style={{
                  transform: `translateX(${(1 - itemSpring) * 40}px)`,
                  opacity: itemSpring,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 24px',
                    borderRadius: '16px',
                    backgroundColor: isHighlighted
                      ? 'rgba(111, 65, 236, 0.18)'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isHighlighted
                      ? `2px solid ${defaultTheme.colors.primary}`
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isHighlighted ? `0 0 28px ${defaultTheme.colors.primaryGlow}` : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    }}
                  >
                    <span style={{ fontSize: '32px' }}>
                      {node.isDirectory ? '📁' : '📄'}
                    </span>
                    <span
                      style={{
                        fontFamily: defaultTheme.fonts.mono,
                        fontSize: '32px',
                        fontWeight: isHighlighted ? 800 : 600,
                        color: isHighlighted ? defaultTheme.colors.secondary : defaultTheme.colors.textPrimary,
                      }}
                    >
                      {node.name}
                    </span>
                  </div>

                  {node.description && (
                    <span
                      style={{
                        fontSize: '22px',
                        color: isHighlighted ? defaultTheme.colors.secondary : defaultTheme.colors.textMuted,
                        fontFamily: defaultTheme.fonts.body,
                        fontWeight: 600,
                        backgroundColor: 'rgba(0, 0, 0, 0.25)',
                        padding: '6px 16px',
                        borderRadius: '8px',
                      }}
                    >
                      {node.description}
                    </span>
                  )}
                </div>

                {/* Sub-children if expanded */}
                {node.children && node.children.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      paddingLeft: '32px',
                      borderLeft: `2px solid ${defaultTheme.colors.primaryGlow}`,
                      marginLeft: '24px',
                      marginTop: '6px',
                    }}
                  >
                    {node.children.map((child, cIndex) => {
                      const childSpring = spring({
                        frame: frame - (20 + cIndex * 6),
                        fps,
                        config: { damping: 14, stiffness: 120 },
                      });

                      return (
                        <div
                          key={child.name}
                          style={{
                            transform: `translateX(${(1 - childSpring) * 20}px)`,
                            opacity: childSpring,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(111, 65, 236, 0.1)',
                            border: `1px solid rgba(111, 65, 236, 0.35)`,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '24px' }}>{child.isDirectory ? '📁' : '📄'}</span>
                            <span
                              style={{
                                fontFamily: defaultTheme.fonts.mono,
                                fontSize: '26px',
                                color: '#FFFFFF',
                                fontWeight: 700,
                              }}
                            >
                              {child.name}
                            </span>
                          </div>
                          {child.description && (
                            <span
                              style={{
                                fontSize: '20px',
                                color: defaultTheme.colors.textSecondary,
                                fontFamily: defaultTheme.fonts.body,
                              }}
                            >
                              {child.description}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanation Callout Banner */}
      <div
        style={{
          marginTop: '36px',
          padding: '24px 32px',
          borderRadius: '20px',
          backgroundColor: 'rgba(111, 65, 236, 0.12)',
          borderLeft: `6px solid ${defaultTheme.colors.primary}`,
          borderTop: '1px solid rgba(111, 65, 236, 0.25)',
          borderRight: '1px solid rgba(111, 65, 236, 0.25)',
          borderBottom: '1px solid rgba(111, 65, 236, 0.25)',
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
          {scene.explanation}
        </span>
      </div>
    </div>
  );
};

