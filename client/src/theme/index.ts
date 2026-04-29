export type TreeType = 'emerald' | 'cherry' | 'maple' | 'spruce' | 'violet' | 'pale' | 'onyx' | 'wood';

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
  },
  violet: {
    light: {
      primary: '#8b5cf6', // Violet
      background: '#f5f3ff',
      card: '#ffffff',
      text: '#4c1d95',
      textMuted: '#7c3aed',
      border: '#ddd6fe',
      success: '#8b5cf6',
      danger: '#ef4444',
      warning: '#f59e0b',
    },
    dark: {
      primary: '#a78bfa',
      background: '#2e1065', // Deep purple
      card: '#4c1d95',
      text: '#f5f3ff',
      textMuted: '#c4b5fd',
      border: '#6d28d9',
      success: '#a78bfa',
      danger: '#f87171',
      warning: '#fbbf24',
    }
  },
  pale: {
    light: {
      primary: '#64748b', // Slate/Pale
      background: '#f1f5f9',
      card: '#ffffff',
      text: '#334155',
      textMuted: '#475569',
      border: '#cbd5e1',
      success: '#64748b',
      danger: '#ef4444',
      warning: '#f59e0b',
    },
    dark: {
      primary: '#94a3b8',
      background: '#0f172a',
      card: '#1e293b',
      text: '#f8fafc',
      textMuted: '#64748b',
      border: '#334155',
      success: '#94a3b8',
      danger: '#f87171',
      warning: '#fbbf24',
    }
  },
  onyx: {
    light: {
      primary: '#000000', // Black and White
      background: '#ffffff',
      card: '#f8fafc',
      text: '#000000',
      textMuted: '#64748b',
      border: '#e2e8f0',
      success: '#000000',
      danger: '#ef4444',
      warning: '#f59e0b',
    },
    dark: {
      primary: '#ffffff',
      background: '#000000',
      card: '#121212',
      text: '#ffffff',
      textMuted: '#a1a1aa',
      border: '#27272a',
      success: '#ffffff',
      danger: '#f87171',
      warning: '#fbbf24',
    }
  },
  wood: {
    light: {
      primary: '#78350f', // Dark Wood
      background: '#fffbeb',
      card: '#ffffff',
      text: '#451a03',
      textMuted: '#92400e',
      border: '#fef3c7',
      success: '#78350f',
      danger: '#ef4444',
      warning: '#f59e0b',
    },
    dark: {
      primary: '#fbbf24',
      background: '#1c0a00',
      card: '#451a03',
      text: '#fffbeb',
      textMuted: '#d97706',
      border: '#78350f',
      success: '#fbbf24',
      danger: '#f87171',
      warning: '#fbbf24',
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
