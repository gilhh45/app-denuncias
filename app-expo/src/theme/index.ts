export { darkColors, lightColors } from './colors';
export type { Cores } from './colors';

export const fontes = {
  regular: 'HankenGrotesk_400Regular',
  medio: 'HankenGrotesk_500Medium',
  semi: 'HankenGrotesk_600SemiBold',
  negrito: 'HankenGrotesk_700Bold',
  extra: 'HankenGrotesk_800ExtraBold',
  mono: 'JetBrainsMono_500Medium',
  monoNegrito: 'JetBrainsMono_700Bold',
} as const;

export const espaco = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const raio = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;
