export type TreeType = 'emerald' | 'cherry' | 'maple' | 'spruce' | 'violet' | 'pale' | 'onyx' | 'wood';

export const themeGradients: Record<TreeType, { gradient: [string, string, string]; shadow: string }> = {
  emerald: {
    gradient: ['#059669', '#10b981', '#047857'],
    shadow: '#059669',
  },
  cherry: {
    gradient: ['#db2777', '#f472b6', '#be185d'],
    shadow: '#db2777',
  },
  maple: {
    gradient: ['#ea580c', '#f97316', '#c2410c'],
    shadow: '#ea580c',
  },
  spruce: {
    gradient: ['#0284c7', '#38bdf8', '#0369a1'],
    shadow: '#0284c7',
  },
  violet: {
    gradient: ['#7c3aed', '#a78bfa', '#6d28d9'],
    shadow: '#7c3aed',
  },
  pale: {
    gradient: ['#475569', '#64748b', '#334155'],
    shadow: '#475569',
  },
  onyx: {
    gradient: ['#18181b', '#27272a', '#09090b'],
    shadow: '#18181b',
  },
  wood: {
    gradient: ['#78350f', '#92400e', '#451a03'],
    shadow: '#78350f',
  },
};

const standardLight = {
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  textMuted: '#64748b',
  border: '#e2e8f0',
  danger: '#ef4444',
  warning: '#f59e0b',
};

const standardDark = {
  background: '#0f172a',
  card: '#1e293b',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  border: '#334155',
  danger: '#f87171',
  warning: '#fbbf24',
};

export const palettes: Record<TreeType, { light: any; dark: any }> = {
  emerald: {
    light: {
      ...standardLight,
      primary: '#10b981',
      success: '#10b981',
    },
    dark: {
      ...standardDark,
      primary: '#10b981',
      success: '#10b981',
    },
  },
  cherry: {
    light: {
      ...standardLight,
      primary: '#f472b6',
      success: '#f472b6',
    },
    dark: {
      ...standardDark,
      primary: '#f472b6',
      success: '#f472b6',
    },
  },
  maple: {
    light: {
      ...standardLight,
      primary: '#f97316',
      success: '#f97316',
    },
    dark: {
      ...standardDark,
      primary: '#f97316',
      success: '#f97316',
    },
  },
  spruce: {
    light: {
      ...standardLight,
      primary: '#0284c7',
      success: '#0284c7',
    },
    dark: {
      ...standardDark,
      primary: '#38bdf8',
      success: '#38bdf8',
    },
  },
  violet: {
    light: {
      ...standardLight,
      primary: '#8b5cf6',
      success: '#8b5cf6',
    },
    dark: {
      ...standardDark,
      primary: '#a78bfa',
      success: '#a78bfa',
    },
  },
  pale: {
    light: {
      ...standardLight,
      primary: '#64748b',
      success: '#64748b',
    },
    dark: {
      ...standardDark,
      primary: '#94a3b8',
      success: '#94a3b8',
    },
  },
  onyx: {
    light: {
      ...standardLight,
      primary: '#0f172a',
      success: '#0f172a',
    },
    dark: {
      ...standardDark,
      primary: '#ffffff',
      success: '#ffffff',
    },
  },
  wood: {
    light: {
      ...standardLight,
      primary: '#78350f',
      success: '#78350f',
    },
    dark: {
      ...standardDark,
      primary: '#fbbf24',
      success: '#fbbf24',
    },
  },
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
