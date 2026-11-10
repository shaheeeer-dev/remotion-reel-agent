import { createContext, createElement, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

export const defaultTheme = {
  colors: {
    bg: '#0B0F17',
    bgCard: '#151D2A',
    bgCardBorder: '#233044',
    bgHeader: 'rgba(15, 23, 42, 0.85)',
    primary: '#6F41EC',
    primaryHover: '#6F41EC',
    primaryDark: '#6F41EC',
    primaryGlow: 'rgba(111, 65, 236, 0.35)',
    primarySurface: 'rgba(111, 65, 236, 0.15)',
    secondary: '#C4B5FD',
    secondaryGlow: 'rgba(196, 181, 253, 0.35)',
    secondarySurface: 'rgba(196, 181, 253, 0.12)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    success: '#10B981',
    successGlow: 'rgba(16, 185, 129, 0.35)',
    warning: '#F59E0B',
    error: '#EF4444',
    terminalBg: '#090D14',
    terminalBar: '#151B26',
  },
  fonts: {
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Courier New", Courier, monospace',
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  },
};

export type Theme = {
  colors: { [K in keyof typeof defaultTheme.colors]: string };
  fonts: typeof defaultTheme.fonts;
};
export type BrandThemeOverrides = {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  cardBackground?: string;
  textColor?: string;
};

function rgbaFromHex(hex: string, alpha: number, fallback: string): string {
  let value = hex.replace(/^#/, '');
  if (/^[\da-f]{3}$/i.test(value)) {
    value = value.split('').map((part) => `${part}${part}`).join('');
  }
  if (!/^[\da-f]{6}$/i.test(value)) return fallback;
  const [red, green, blue] = value.match(/[\da-f]{2}/gi)!.map((part) => parseInt(part, 16));
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

const BrandThemeContext = createContext<Theme>(defaultTheme);

export const BrandThemeProvider = ({
  brand,
  children,
}: { brand?: BrandThemeOverrides; children: ReactNode }) => {
  const theme = useMemo<Theme>(() => {
    const primary = brand?.primaryColor || defaultTheme.colors.primary;
    const secondary = brand?.secondaryColor || defaultTheme.colors.secondary;
    return {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary,
        primaryHover: primary,
        primaryDark: primary,
        primaryGlow: rgbaFromHex(primary, 0.35, defaultTheme.colors.primaryGlow),
        primarySurface: rgbaFromHex(primary, 0.15, defaultTheme.colors.primarySurface),
        secondary,
        secondaryGlow: rgbaFromHex(secondary, 0.35, defaultTheme.colors.secondaryGlow),
        secondarySurface: rgbaFromHex(secondary, 0.12, defaultTheme.colors.secondarySurface),
        bg: brand?.backgroundColor || defaultTheme.colors.bg,
        bgCard: brand?.cardBackground || defaultTheme.colors.bgCard,
        textPrimary: brand?.textColor || defaultTheme.colors.textPrimary,
      },
    };
  }, [brand?.primaryColor, brand?.secondaryColor, brand?.backgroundColor, brand?.cardBackground, brand?.textColor]);

  return createElement(BrandThemeContext.Provider, { value: theme }, children);
};

export const useBrandTheme = () => useContext(BrandThemeContext);
