/**
 * Design tokens — fonte única de verdade para as cores do UpFit.
 * Use as constantes aqui quando precisar de valores fora do NativeWind
 * (ex: props de cor em Ionicons, Animated, valores dinâmicos).
 */
export const Colors = {
  // Base
  bg:       '#0a0a0a',
  card:     '#1a1a1a',
  input:    '#0f0f0f',
  darker:   '#111111',

  // Brand
  cyber:    '#00d4ff',
  brand:    '#6366f1',

  // Text
  white:    '#ffffff',
  muted:    '#94a3b8',  // slate-400
  subtle:   '#64748b',  // slate-500
  faint:    '#475569',  // slate-600
  skeleton: '#334155',  // slate-700

  // Semantic
  success:  '#22c55e',
  xp:       '#f59e0b',
  streak:   '#ef4444',
  error:    '#f87171',
  goal:     '#FFB547',

  // Achievement glows
  glow: {
    CONSISTENCY: '#3b82f6',
    VOLUME:      '#8b5cf6',
    SPEED:       '#00d4ff',
    STRENGTH:    '#f97316',
    SOCIAL:      '#22c55e',
  },
} as const;
