export type TreeType = 'emerald' | 'cherry' | 'maple' | 'spruce';

export const palettes: Record<TreeType, { light: any, dark: any }> = {
  emerald: {
    light: {
      primary: '#10b981', // Emerald green
      background: '#f8fafc',
      card: '#ffffff',
      text: '#0f172a',
      textMuted: '#64748b',
      border: '#e2e8f0',
      success: '#10b981',
      danger: '#ef4444',
      warning: '#f59e0b',
    },
    dark: {
      primary: '#10b981',
      background: '#0f172a',
      card: '#1e293b',
      text: '#f8fafc',
      textMuted: '#94a3b8',
      border: '#334155',
      success: '#10b981',
      danger: '#f87171',
      warning: '#fbbf24',
    }
  },
  cherry: {
    light: {
      primary: '#f472b6', // Cherry pink
      background: '#fff1f2', // Soft pink tint
      card: '#ffffff',
      text: '#831843', // Deep rose text
      textMuted: '#be185d',
      border: '#fecdd3',
      success: '#f472b6',
      danger: '#e11d48',
      warning: '#fb923c',
    },
    dark: {
      primary: '#f472b6',
      background: '#4c0519', // Deep crimson dark
      card: '#831843',
      text: '#fff1f2',
      textMuted: '#fda4af',
      border: '#9f1239',
      success: '#f472b6',
      danger: '#fb7185',
      warning: '#fb923c',
    }
  },
  maple: {
    light: {
      primary: '#f97316', // Maple orange
      background: '#fff7ed',
      card: '#ffffff',
      text: '#7c2d12',
      textMuted: '#9a3412',
      border: '#ffedd5',
      success: '#f97316',
      danger: '#dc2626',
      warning: '#ea580c',
    },
    dark: {
      primary: '#f97316',
      background: '#431407', // Dark earthy brown/orange
      card: '#7c2d12',
      text: '#fff7ed',
      textMuted: '#fb923c',
      border: '#9a3412',
      success: '#f97316',
      danger: '#f87171',
      warning: '#fbbf24',
    }
  },
  spruce: {
    light: {
      primary: '#0284c7', // Spruce blue
      background: '#f0f9ff',
      card: '#ffffff',
      text: '#0c4a6e',
      textMuted: '#075985',
      border: '#e0f2fe',
      success: '#0284c7',
      danger: '#ef4444',
      warning: '#0ea5e9',
    },
    dark: {
      primary: '#38bdf8',
      background: '#082f49', // Deep navy
      card: '#0c4a6e',
      text: '#f0f9ff',
      textMuted: '#7dd3fc',
      border: '#075985',
      success: '#38bdf8',
      danger: '#f87171',
      warning: '#7dd3fc',
    }
  }
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
  colors: palettes.emerald.light,
};
