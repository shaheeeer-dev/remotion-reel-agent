import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { useBrandTheme, LearnOpsTheme } from '../styles/theme.js';

interface BrandHeaderProps {
  brandName?: string;
  topicTag?: string;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({
  brandName = 'LearnOps',
  topicTag = 'DevOps & Linux',
}) => {
  const theme = useBrandTheme();
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Progress bar fills linearly from 0% to 100% across whole reel
  const progress = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: 'clamp',
  });

  // Header bar (brand & topic badge) is shown during core explanation scenes (after hook, before outro)
  const hookEndFrame = 3 * fps;
  const outroStartFrame = durationInFrames - 2.5 * fps;

  const headerOpacity = interpolate(
    frame,
    [hookEndFrame - 10, hookEndFrame, outroStartFrame - 10, outroStartFrame],
    [0, 1, 1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

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
        pointerEvents: 'none',
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
            background: `linear-gradient(90deg, ${LearnOpsTheme.brandPurple}, ${LearnOpsTheme.accentLavender})`,
            borderRadius: '999px',
            boxShadow: '0 0 16px rgba(120, 60, 235, 0.45)',
          }}
        />
      </div>

      {/* Header Bar during core content scenes */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: headerOpacity,
          transition: 'opacity 0.2s ease',
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
              background: `linear-gradient(135deg, ${LearnOpsTheme.brandPurple}, #5E28C4)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '22px',
              color: '#FFFFFF',
              boxShadow: '0 0 20px rgba(120, 60, 235, 0.35)',
              fontFamily: theme.fonts.heading,
            }}
          >
            {brandName.slice(0, 1).toUpperCase()}
          </div>
          <span
            style={{
              color: LearnOpsTheme.textWhite,
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              fontFamily: theme.fonts.heading,
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
            backgroundColor: LearnOpsTheme.surfaceAmethyst, // #1C1824
            border: `1px solid ${LearnOpsTheme.brandPurple}`, // 1px solid #783CEB
            boxShadow: '0 0 15px rgba(120, 60, 235, 0.20)',
            color: LearnOpsTheme.accentLavender, // #B28BFF
            fontSize: '20px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontFamily: theme.fonts.heading,
          }}
        >
          {topicTag}
        </div>
      </div>
    </div>
  );
};
