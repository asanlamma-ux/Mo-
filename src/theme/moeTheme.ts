export const moeTheme = {
  colors: {
    background: '#F9EFF2',
    backgroundAccent: '#F4E3E7',
    surface: '#FFF9FB',
    surfaceStrong: '#F7E7EB',
    border: '#EAD8DE',
    text: '#4B2B36',
    textMuted: '#8F6674',
    primary: '#D96C86',
    primaryStrong: '#B65072',
    success: '#3BAA6B',
    warning: '#D88D4A',
    danger: '#D74E5F',
    shadow: 'rgba(97, 53, 70, 0.12)',
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 12,
    md: 18,
    lg: 24,
    pill: 999,
  },
  motion: {
    fast: 180,
    normal: 260,
  },
  typography: {
    hero: 48,
    title: 34,
    section: 14,
    cardTitle: 24,
    body: 18,
    caption: 14,
  },
} as const

export const moeShadow = {
  shadowColor: moeTheme.colors.shadow,
  shadowOffset: {width: 0, height: 10},
  shadowOpacity: 1,
  shadowRadius: 18,
  elevation: 5,
}
