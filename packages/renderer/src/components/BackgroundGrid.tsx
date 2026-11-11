import React from 'react';
import { useBrandTheme } from '../styles/theme.js';

/**
 * Clean matte backdrop without any lines or grid overlays.
 * Adheres strictly to the user specification: "bg without any lines and stuff you can see".
 */
export const BackgroundGrid: React.FC = () => {
  const theme = useBrandTheme();

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: theme.colors.bg, // #110F17 (Dark Amethyst matte)
        overflow: 'hidden',
        zIndex: 0,
      }}
    />
  );
};
