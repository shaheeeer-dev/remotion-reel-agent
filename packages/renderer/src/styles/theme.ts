import { createContext, createElement, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';

/**
 * Semantic Theme Roles:
 * - brandPrimary: Brand primary color (for hook full BG, CTA buttons, active accents, card borders)
 * - brightAccent: High-luminance highlight color (for keyword highlights, active pills, terminal prompt)
 * - deepBackground: Deep dark canvas background (for explanation, comparison, recap scenes)
 * - cardSurface: Elevated container background for cards, terminal, code blocks
 * - primaryText: High contrast text (default #FFFFFF)
 * - mutedText: Secondary subtext, borders, path slashes
 */
export interface SemanticThemeTokens {
  // Primary Semantic Roles
  brandPrimary: string;
  brightAccent: string;
  deepBackground: string;
  cardSurface: string;
  primaryText: string;
  mutedText: string;

  // Remotion Scene Aliases & Derived Utilities
  primary: string;
  primaryHover: string;
  primaryDark: string;
  primaryGlow: string;
  primarySurface: string;
  cardGlow: string;

  secondary: string;
  secondaryGlow: string;
  secondarySurface: string;

  bg: string;
  bgHook: string;
  bgCard: string;
  bgCardBorder: string;
  bgHeader: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textHighlight: string;

  terminalBg: string;
  terminalBar: string;
  terminalPrompt: string;
  terminalText: string;

  success: string;
  successGlow: string;
  warning: string;
  error: string;
}

export type Theme = {
  colors: SemanticThemeTokens;
  fonts: {
    heading: string;
    mono: string;
    body: string;
  };
};

export type BrandThemeOverrides = {
  name?: string;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  cardBackground?: string;
  textColor?: string;
  mutedTextColor?: string;
  fontFamily?: string;
};

export function rgbaFromHex(hex: string, alpha: number, fallback = 'rgba(255, 255, 255, 0.2)'): string {
  if (!hex) return fallback;
  let value = hex.replace(/^#/, '');
  if (/^[\da-f]{3}$/i.test(value)) {
    value = value.split('').map((part) => `${part}${part}`).join('');
  }
  if (!/^[\da-f]{6}$/i.test(value)) return fallback;
  const match = value.match(/[\da-f]{2}/gi);
  if (!match || match.length < 3) return fallback;
  const [red, green, blue] = match.map((part) => parseInt(part, 16));
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

/**
 * Calculates a slightly elevated surface hex tone from a deep background color.
 */
export function elevateHex(hex: string, amount = 14): string {
  if (!hex) return '#1C1824';
  let value = hex.replace(/^#/, '');
  if (/^[\da-f]{3}$/i.test(value)) {
    value = value.split('').map((part) => `${part}${part}`).join('');
  }
  if (!/^[\da-f]{6}$/i.test(value)) return '#1C1824';
  const match = value.match(/[\da-f]{2}/gi);
  if (!match || match.length < 3) return '#1C1824';
  const r = Math.min(255, Math.max(0, parseInt(match[0], 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(match[1], 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(match[2], 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function buildSemanticTheme(brand?: BrandThemeOverrides): Theme {
  // If brand is provided, ensure required settings exist
  if (brand) {
    const missing: string[] = [];
    if (!brand.primaryColor) missing.push('primaryColor');
    if (!brand.secondaryColor) missing.push('secondaryColor');
    if (!brand.backgroundColor) missing.push('backgroundColor');

    if (missing.length > 0) {
      console.warn(
        `[Theme Warning] Brand "${brand.name || 'Current'}" is missing settings for: ${missing.join(', ')}. ` +
        `Please ensure Brand Profile colors are properly configured.`
      );
    }
  }

  const brandPrimary = brand?.primaryColor || '#783CEB';
  const brightAccent = brand?.secondaryColor || '#B28BFF';
  const deepBackground = brand?.backgroundColor || '#110F17';
  const cardSurface = brand?.cardBackground || elevateHex(deepBackground, 12);
  const primaryText = brand?.textColor || '#FFFFFF';
  const mutedText = brand?.mutedTextColor || rgbaFromHex(primaryText, 0.65, '#94A3B8');

  const headingFont = brand?.fontFamily
    ? `"${brand.fontFamily}", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
    : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';

  return {
    colors: {
      brandPrimary,
      brightAccent,
      deepBackground,
      cardSurface,
      primaryText,
      mutedText,

      primary: brandPrimary,
      primaryHover: brandPrimary,
      primaryDark: brandPrimary,
      primaryGlow: rgbaFromHex(brandPrimary, 0.35, 'rgba(120, 60, 235, 0.35)'),
      primarySurface: rgbaFromHex(brandPrimary, 0.15, 'rgba(120, 60, 235, 0.15)'),
      cardGlow: `0 0 20px ${rgbaFromHex(brandPrimary, 0.25, 'rgba(120, 60, 235, 0.25)')}`,

      secondary: brightAccent,
      secondaryGlow: rgbaFromHex(brightAccent, 0.35, 'rgba(178, 139, 255, 0.35)'),
      secondarySurface: rgbaFromHex(brightAccent, 0.15, 'rgba(178, 139, 255, 0.15)'),

      bg: deepBackground,
      bgHook: brandPrimary,
      bgCard: cardSurface,
      bgCardBorder: brandPrimary,
      bgHeader: rgbaFromHex(deepBackground, 0.94, 'rgba(17, 15, 23, 0.94)'),

      textPrimary: primaryText,
      textSecondary: mutedText,
      textMuted: mutedText,
      textHighlight: brightAccent,

      terminalBg: cardSurface,
      terminalBar: elevateHex(deepBackground, 4),
      terminalPrompt: brightAccent,
      terminalText: primaryText,

      success: '#34B1AA',
      successGlow: 'rgba(52, 177, 170, 0.35)',
      warning: '#E0B50F',
      error: '#EF4444',
    },
    fonts: {
      heading: headingFont,
      mono: '"JetBrains Mono", "Fira Code", "Courier New", Courier, monospace',
      body: headingFont,
    },
  };
}

export const defaultTheme: Theme = buildSemanticTheme();

const BrandThemeContext = createContext<Theme>(defaultTheme);

export const BrandThemeProvider = ({
  brand,
  children,
}: { brand?: BrandThemeOverrides; children: ReactNode }) => {
  const theme = useMemo<Theme>(() => buildSemanticTheme(brand), [
    brand?.name,
    brand?.primaryColor,
    brand?.secondaryColor,
    brand?.backgroundColor,
    brand?.cardBackground,
    brand?.textColor,
    brand?.mutedTextColor,
    brand?.fontFamily,
  ]);

  return createElement(BrandThemeContext.Provider, { value: theme }, children);
};

export const useBrandTheme = () => useContext(BrandThemeContext);

/**
 * Kinetic text keyword emphasis renderer.
 * Asterisks *word* or backticks `word` are rendered using the bright accent color.
 */
export function renderHighlightedText(
  text: string,
  defaultColor = '#FFFFFF',
  highlightColor?: string
): ReactNode[] {
  if (!text) return [];

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
            color: highlightColor || defaultColor,
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
