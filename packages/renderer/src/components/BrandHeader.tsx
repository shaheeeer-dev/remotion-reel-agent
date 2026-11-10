import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { defaultTheme } from '../styles/theme.js';

interface BrandHeaderProps {
  brandName?: string;
  topicTag?: string;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  brandName = 'LearnOps',
  topicTag = 'DevOps & Linux',
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '70px 60px 24px 60px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* Top Reel Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          borderRadius: '999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${defaultTheme.colors.primary}, ${defaultTheme.colors.secondary})`,
            borderRadius: '999px',
            boxShadow: `0 0 16px ${defaultTheme.colors.primaryGlow}`,
          }}
        />
      </div>

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* Logo Mark */}
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${defaultTheme.colors.primary}, #5528D4)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '22px',
              color: '#FFFFFF',
              boxShadow: `0 0 20px ${defaultTheme.colors.primaryGlow}`,
              fontFamily: defaultTheme.fonts.heading,
            }}
          >
            L
          </div>
          <span
            style={{
              color: defaultTheme.colors.textPrimary,
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              fontFamily: defaultTheme.fonts.heading,
            }}
          >
            {brandName}
          </span>
        </div>

        {/* Topic Tag Badge */}
        <div
          style={{
            padding: '10px 22px',
            borderRadius: '999px',
            backgroundColor: 'rgba(111, 65, 236, 0.15)',
            border: `1.5px solid ${defaultTheme.colors.primary}`,
            color: defaultTheme.colors.secondary,
            fontSize: '22px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: defaultTheme.fonts.heading,
          }}
        >
          {topicTag}
        </div>
      </div>
    </div>
  );
};

