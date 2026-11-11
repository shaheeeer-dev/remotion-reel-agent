import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  Box,
  FileText,
  GitBranch,
  Layers,
  Rocket,
  Server,
  Settings,
  UserRound,
} from 'lucide-react';
import type { ComparisonScene as ComparisonSceneType } from '@learnops/schema';
import { renderHighlightedText, useBrandTheme } from '../styles/theme.js';

const iconByName = {
  server: Server,
  user: UserRound,
  layers: Layers,
  box: Box,
  'git-branch': GitBranch,
  rocket: Rocket,
  'file-text': FileText,
  settings: Settings,
} as const;

export const ComparisonScene: React.FC<{ scene: ComparisonSceneType }> = ({ scene }) => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cards = [
    {
      label: scene.leftLabel,
      title: scene.leftTitle,
      description: scene.leftDescription,
      icon: scene.leftIcon || 'layers',
      color: theme.colors.brandPrimary,
      delay: 7,
    },
    {
      label: scene.rightLabel,
      title: scene.rightTitle,
      description: scene.rightDescription,
      icon: scene.rightIcon || 'box',
      color: theme.colors.brightAccent,
      delay: 17,
    },
  ] as const;

  const titleSpring = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const connectorWidth = interpolate(frame, [15, 34], [0, 120], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '110px 62px 80px',
        boxSizing: 'border-box',
        backgroundColor: theme.colors.deepBackground,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          opacity: titleSpring,
          transform: `translateY(${(1 - titleSpring) * 28}px)`,
          textAlign: 'center',
          color: theme.colors.primaryText,
          fontFamily: theme.fonts.heading,
          fontSize: '58px',
          lineHeight: 1.08,
          fontWeight: 900,
          letterSpacing: '-0.04em',
          maxWidth: '920px',
          marginBottom: '64px',
        }}
      >
        {renderHighlightedText(scene.title, theme.colors.primaryText, theme.colors.brightAccent)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', width: '100%' }}>
        {cards.map((card, index) => {
          const Icon = iconByName[card.icon];
          const entrance = spring({
            frame: frame - card.delay,
            fps,
            config: { damping: 15, stiffness: 115 },
          });
          return (
            <React.Fragment key={card.label}>
              {index === 1 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '51%',
                    left: 'calc(50% - 60px)',
                    width: `${connectorWidth}px`,
                    height: '4px',
                    borderRadius: '999px',
                    backgroundColor: theme.colors.brandPrimary,
                    boxShadow: `0 0 18px ${theme.colors.primaryGlow}`,
                  }}
                />
              )}
              <div
                style={{
                  width: '438px',
                  minHeight: '520px',
                  padding: '34px 30px',
                  boxSizing: 'border-box',
                  borderRadius: '30px',
                  backgroundColor: theme.colors.cardSurface,
                  border: `1.5px solid ${card.color}`,
                  boxShadow: `${theme.colors.cardGlow}, 0 24px 60px rgba(0, 0, 0, 0.35)`,
                  opacity: entrance,
                  transform: `translateY(${(1 - entrance) * 42}px) scale(${0.96 + entrance * 0.04})`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    padding: '10px 16px',
                    borderRadius: '999px',
                    backgroundColor: theme.colors.primarySurface,
                    color: card.color,
                    border: `1px solid ${card.color}`,
                    fontFamily: theme.fonts.mono,
                    fontSize: '19px',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    width: '110px',
                    height: '110px',
                    marginTop: '42px',
                    borderRadius: '28px',
                    backgroundColor: theme.colors.secondarySurface,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: card.color,
                  }}
                >
                  <Icon size={58} strokeWidth={1.8} />
                </div>
                <div
                  style={{
                    marginTop: '36px',
                    color: theme.colors.primaryText,
                    fontFamily: theme.fonts.heading,
                    fontSize: '42px',
                    lineHeight: 1.08,
                    fontWeight: 900,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {card.title}
                </div>
                <div
                  style={{
                    marginTop: '18px',
                    color: theme.colors.mutedText,
                    fontFamily: theme.fonts.body,
                    fontSize: '27px',
                    lineHeight: 1.35,
                    fontWeight: 650,
                  }}
                >
                  {card.description}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div
        style={{
          opacity: interpolate(frame, [32, 48], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
          position: 'absolute',
          top: '87%',
          left: '10%',
          width: '80%',
          textAlign: 'center',
          color: theme.colors.primaryText,
          fontFamily: theme.fonts.body,
          fontSize: '27px',
          lineHeight: 1.3,
          fontWeight: 750,
        }}
      >
        {renderHighlightedText(scene.takeaway, theme.colors.primaryText, theme.colors.brightAccent)}
      </div>
    </div>
  );
};
