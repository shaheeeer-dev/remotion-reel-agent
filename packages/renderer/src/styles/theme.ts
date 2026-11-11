import { createContext, createElement, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

/**
 * LearnOps Official Brand Palette Specification
 */
export const LearnOpsTheme = {
  // Core Brand
  brandPurple: '#783CEB', // Opening Hook BG, Primary CTA Button, Accent Marks
  accentLavender: '#B28BFF', // High-Luminance Highlight Text, Active UI Badges, Commands

  // Surfaces & Backdrops
  bgDarkAmethyst: '#110F17', // Main Video Background (Scenes 2 & 3)
  surfaceAmethyst: '#1C1824', // Terminal Window & UI Card Containers

  // Typography & Subtext
  textWhite: '#FFFFFF', // Main Titles & Body Text
  textMutedPurple: '#91899C', // Secondary Subtext, Path Slashes & Borders
};

export const defaultTheme = {
  colors: {
    bg: LearnOpsTheme.bgDarkAmethyst,
    bgHook: LearnOpsTheme.brandPurple,
    bgCard: LearnOpsTheme.surfaceAmethyst,
    bgCardBorder: LearnOpsTheme.brandPurple,
    bgHeader: 'rgba(17, 15, 23, 0.94)',

    primary: LearnOpsTheme.brandPurple,
    primaryHover: '#8E55F5',
    primaryDark: '#5E28C4',
    primaryGlow: 'rgba(120, 60, 235, 0.35)',
    primarySurface: 'rgba(120, 60, 235, 0.15)',
    cardGlow: '0 0 15px rgba(120, 60, 235, 0.20)',

    secondary: LearnOpsTheme.accentLavender,
    secondaryGlow: 'rgba(178, 139, 255, 0.35)',
    secondarySurface: 'rgba(178, 139, 255, 0.15)',

    accentLavender: LearnOpsTheme.accentLavender,
    accentPurple: LearnOpsTheme.brandPurple,

    textPrimary: LearnOpsTheme.textWhite,
    textSecondary: LearnOpsTheme.textMutedPurple,
    textMuted: LearnOpsTheme.textMutedPurple,
    textHighlight: LearnOpsTheme.accentLavender,

    success: '#34B1AA',
    successGlow: 'rgba(52, 177, 170, 0.35)',
    warning: '#E0B50F',
    error: '#EF4444',

    terminalBg: LearnOpsTheme.surfaceAmethyst,
    terminalBar: '#15131C',
    terminalPrompt: LearnOpsTheme.accentLavender,
    terminalText: LearnOpsTheme.textWhite,
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
    const bg = brand?.backgroundColor || defaultTheme.colors.bg;
    const bgCard = brand?.cardBackground || defaultTheme.colors.bgCard;
    const textPrimary = brand?.textColor || defaultTheme.colors.textPrimary;

    return {
      ...defaultTheme,
      colors: {
        ...defaultTheme.colors,
        primary,
        primaryHover: primary,
        primaryDark: primary,
        primaryGlow: rgbaFromHex(primary, 0.35, defaultTheme.colors.primaryGlow),
        primarySurface: rgbaFromHex(primary, 0.15, defaultTheme.colors.primarySurface),
        cardGlow: `0 0 15px ${rgbaFromHex(primary, 0.2, 'rgba(120, 60, 235, 0.20)')}`,
        secondary,
        secondaryGlow: rgbaFromHex(secondary, 0.35, defaultTheme.colors.secondaryGlow),
        secondarySurface: rgbaFromHex(secondary, 0.12, defaultTheme.colors.secondarySurface),
        bg,
        bgCard,
        bgCardBorder: primary,
        textPrimary,
        textHighlight: secondary,
        terminalBg: bgCard,
        terminalPrompt: secondary,
      },
    };
  }, [brand?.primaryColor, brand?.secondaryColor, brand?.backgroundColor, brand?.cardBackground, brand?.textColor]);

  return createElement(BrandThemeContext.Provider, { value: theme }, children);
};

export const useBrandTheme = () => useContext(BrandThemeContext);

/**
 * Helper to render kinetic text with keyword emphasis.
 * Words surrounded by asterisks like *word* or backticks `word` are rendered in accentLavender (#B28BFF).
 * Rule: Standard words are #FFFFFF. Never use #783CEB for text on dark backgrounds.
 */
export function renderHighlightedText(
  text: string,
  defaultColor = '#FFFFFF',
  highlightColor = LearnOpsTheme.accentLavender
): ReactNode[] {
  if (!text) return [];

  // Match words between *...* or `...`
  const parts = text.split(/(\*[^*]+\*|`[^`]+`)/g);

  return parts.map((part, idx) => {
    if (
      (part.startsWith('*') && part.endsWith('*') && part.length > 2) ||
      (part.startsWith('`') && part.endsWith('`') && part.length > 2)
    ) {
      const cleanWord = part.slice(1, -1);
      return createElement(
        'span',
        {
          key: idx,
          style: {
            color: highlightColor,
            fontWeight: 800,
          },
        },
        cleanWord
      );
    }

    return createElement(
      'span',
      {
        key: idx,
        style: {
          color: defaultColor,
        },
      },
      part
    );
  });
}
