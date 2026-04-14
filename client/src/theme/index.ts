export const lightPalette = {
  primary: '#10b981', // Emerald green
  background: '#f8fafc', // Off-white / slate-50
  card: '#ffffff', // Clean white
  text: '#0f172a', // Slate-900
  textMuted: '#64748b', // Slate-500
  border: '#e2e8f0', // Slate-200
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
};

export const darkPalette = {
  primary: '#10b981', // Keep emerald green for branding
  background: '#0f172a', // Slate 900
  card: '#1e293b', // Slate 800
  text: '#f8fafc', // Slate 50
  textMuted: '#94a3b8', // Slate 400
  border: '#334155', // Slate 700
  success: '#10b981',
  danger: '#f87171',
  warning: '#fbbf24',
};

export const theme = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  fonts: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
  // Default colors (will be overridden by context)
  colors: lightPalette,
};
