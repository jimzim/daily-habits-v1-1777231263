import type { TextStyle } from 'react-native';

export const typography = {
  body: { fontSize: 16, fontWeight: '400', lineHeight: 22 } as TextStyle,
  bodyBold: { fontSize: 16, fontWeight: '600', lineHeight: 22 } as TextStyle,
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 } as TextStyle,
  small: { fontSize: 12, fontWeight: '400', lineHeight: 16 } as TextStyle,
  h1: { fontSize: 28, fontWeight: '600', lineHeight: 34 } as TextStyle,
  h2: { fontSize: 22, fontWeight: '600', lineHeight: 28 } as TextStyle,
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 24 } as TextStyle,
  streakDisplay: { fontSize: 32, fontWeight: '700', lineHeight: 38 } as TextStyle,
} as const;

export type TypographyToken = keyof typeof typography;
