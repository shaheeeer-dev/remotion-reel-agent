import { createContext, createElement, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

export const defaultTheme = {
  colors: {
    bg: '#1E1E2C',
    bgCard: '#272738',
    bgCardBorder: '#36364D',
    bgHeader: 'rgba(30, 30, 44, 0.92)',
    primary: '#F29F67',
    primaryHover: '#FAAD79',
    primaryDark: '#D98246',
    primaryGlow: 'rgba(242, 159, 103, 0.35)',
    primarySurface: 'rgba(242, 159, 103, 0.15)',
    secondary: '#34B1AA',
    secondaryGlow: 'rgba(52, 177, 170, 0.35)',
    secondarySurface: 'rgba(52, 177, 170, 0.15)',
    accentBlue: '#3B8FF3',
    accentYellow: '#E0B50F',
    textPrimary: '#FFFFFF',
    textSecondary: '#A2A2B8',
    textMuted: '#6F6F88',
    success: '#34B1AA',
    successGlow: 'rgba(52, 177, 170, 0.35)',
    warning: '#E0B50F',
    error: '#EF4444',
    terminalBg: '#151520',
    terminalBar: '#1E1E2C',
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
