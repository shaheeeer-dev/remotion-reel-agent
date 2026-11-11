import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBrandTheme, LearnOpsTheme, renderHighlightedText } from '../styles/theme.js';
import type { FolderTreeScene as FolderTreeSceneType, FolderNode } from '@learnops/schema';

/**
 * Scene 2: Core Explanation (Folder Tree)
 *
 * Exact Color Mapping:
 * - Background: #110F17 (Dark Amethyst)
 * - Primary Text: #FFFFFF (White)
 * - Highlighted Words: #B28BFF (Lavender)
 * - UI Card Surface: #1C1824 with 1px solid #783CEB border & 0 0 15px rgba(120, 60, 235, 0.2) soft glow
 * - Subtext, Slashes & Borders: #91899C (Muted Purple)
 */
export const FolderTreeScene: React.FC<{ scene: FolderTreeSceneType }> = ({ scene }) => {
  const theme = useBrandTheme();
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
        backgroundColor: LearnOpsTheme.bgDarkAmethyst, // #110F17 matte
      }}
    >
      {/* Scene Header */}
      <div
        style={{
          transform: `translateY(${(1 - headerSpring) * 30}px)`,
          opacity: headerSpring,
          marginBottom: '32px',
          textAlign: 'center',
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
          Filesystem Anatomy
        </span>
        <h2
          style={{
            fontSize: '52px',
            fontWeight: 900,
            color: LearnOpsTheme.textWhite, // #FFFFFF
            marginTop: '8px',
            letterSpacing: '-0.02em',
            fontFamily: theme.fonts.heading,
          }}
        >
          {renderHighlightedText(scene.title, LearnOpsTheme.textWhite, LearnOpsTheme.accentLavender)}
        </h2>
      </div>

      {/* Main Tree Card: #1C1824 with 1px #783CEB border & glow */}
      <div
        style={{
          backgroundColor: LearnOpsTheme.surfaceAmethyst, // #1C1824
          border: `1px solid ${LearnOpsTheme.brandPurple}`, // 1px solid #783CEB
          boxShadow: '0 0 15px rgba(120, 60, 235, 0.20), 0 25px 60px rgba(0, 0, 0, 0.55)',
          borderRadius: '28px',
          padding: '36px 44px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Tree Root */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '34px',
            fontFamily: theme.fonts.mono,
            fontWeight: 700,
            color: LearnOpsTheme.textMutedPurple, // #91899C
          }}
        >
          <span style={{ fontSize: '36px' }}>📁</span>
          <span style={{ color: LearnOpsTheme.textWhite }}>
            <span style={{ color: LearnOpsTheme.accentLavender }}>{scene.rootPath}</span>{' '}
            <span style={{ color: LearnOpsTheme.textMutedPurple, fontSize: '24px' }}>(root)</span>
          </span>
        </div>

        {/* Child Items */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            paddingLeft: '32px',
            borderLeft: `2px solid rgba(120, 60, 235, 0.3)`,
          }}
        >
          {scene.tree.map((node: FolderNode, index: number) => {
            // Staggered node entrance animation
            const nodeSpring = spring({
              frame: frame - (10 + index * 6),
              fps,
              config: { damping: 14, stiffness: 120 },
            });

            const isHighlighted = node.highlight;

            return (
              <div
                key={node.name}
                style={{
                  transform: `translateX(${(1 - nodeSpring) * 35}px)`,
                  opacity: nodeSpring,
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
                    padding: '14px 20px',
                    borderRadius: '16px',
                    backgroundColor: isHighlighted
                      ? 'rgba(120, 60, 235, 0.18)'
                      : 'rgba(255, 255, 255, 0.02)',
                    border: isHighlighted
                      ? `1.5px solid ${LearnOpsTheme.accentLavender}`
                      : '1px solid transparent',
                    boxShadow: isHighlighted ? '0 0 15px rgba(120, 60, 235, 0.25)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontSize: '28px' }}>{node.isDirectory ? '📁' : '📄'}</span>
                    <span
                      style={{
                        fontSize: '30px',
                        fontFamily: theme.fonts.mono,
                        fontWeight: isHighlighted ? 800 : 600,
                        color: isHighlighted ? LearnOpsTheme.accentLavender : LearnOpsTheme.textWhite,
                      }}
                    >
                      {node.name}
                    </span>
                  </div>

                  {node.description && (
                    <span
                      style={{
                        fontSize: '20px',
                        fontFamily: theme.fonts.body,
                        color: isHighlighted ? LearnOpsTheme.textWhite : LearnOpsTheme.textMutedPurple,
                        fontWeight: isHighlighted ? 600 : 400,
                        maxWidth: '420px',
                        textAlign: 'right',
                      }}
                    >
                      {node.description}
                    </span>
                  )}
                </div>

                {/* Sub-children if present */}
                {node.children && node.children.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      paddingLeft: '40px',
                      borderLeft: `2px dashed rgba(178, 139, 255, 0.35)`,
                      marginTop: '6px',
                    }}
                  >
                    {node.children.map((child: FolderNode, childIdx: number) => {
                      const childSpring = spring({
                        frame: frame - (24 + childIdx * 5),
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
                            padding: '10px 16px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>{child.isDirectory ? '📁' : '📄'}</span>
                            <span
                              style={{
                                fontSize: '24px',
                                fontFamily: theme.fonts.mono,
                                fontWeight: 600,
                                color: LearnOpsTheme.textWhite,
                              }}
                            >
                              {child.name}
                            </span>
                          </div>
                          {child.description && (
                            <span
                              style={{
                                fontSize: '18px',
                                color: LearnOpsTheme.textMutedPurple,
                                fontFamily: theme.fonts.body,
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

      {/* Explanation Banner */}
      {scene.explanation && (
        <div
          style={{
            marginTop: '24px',
            padding: '20px 28px',
            borderRadius: '18px',
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
          {renderHighlightedText(scene.explanation, LearnOpsTheme.textWhite, LearnOpsTheme.accentLavender)}
        </div>
      )}
    </div>
  );
};
