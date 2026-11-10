import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { defaultTheme } from '../styles/theme.js';

export const BackgroundGrid: React.FC = () => {
  const frame = useCurrentFrame();

  const glowOpacity = interpolate(
    Math.sin(frame / 20),
    [-1, 1],
    [0.15, 0.3]
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: defaultTheme.colors.bg,
        overflow: 'hidden',
        zIndex: 0,
      }}
    >
      {/* Background Radial Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1200px',
          height: '1200px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${defaultTheme.colors.primaryGlow} 0%, transparent 65%)`,
          opacity: glowOpacity,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-10%',
          width: '900px',
          height: '900px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(0, 229, 255, 0.12) 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Grid Pattern */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.6,
        }}
      />
    </div>
  );
};

