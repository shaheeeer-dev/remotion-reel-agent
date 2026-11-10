export const defaultTheme = {
  colors: {
    bg: '#0B0F17',
    bgCard: '#151D2A',
    bgCardBorder: '#233044',
    bgHeader: 'rgba(15, 23, 42, 0.85)',

    // Official LearnOps branding
    primary: '#6F41EC',
    primaryHover: '#825CF0',
    primaryDark: '#5528D4',
    primaryGlow: 'rgba(111, 65, 236, 0.35)',
    secondary: '#C4B5FD',
    secondaryGlow: 'rgba(196, 181, 253, 0.35)',

    // Text
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',

    // Status colors
    success: '#10B981',
    successGlow: 'rgba(16, 185, 129, 0.35)',
    warning: '#F59E0B',
    error: '#EF4444',

    // Terminal
    terminalBg: '#090D14',
    terminalBar: '#151B26',
  },

  fonts: {
    heading:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    mono:
      '"JetBrains Mono", "Fira Code", "Courier New", Courier, monospace',
    body:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  },
};

export type Theme = typeof defaultTheme;
