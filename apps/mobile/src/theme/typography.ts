/**
 * Échelle typographique (§11.6). Tailles en points ; les graisses suivent les
 * valeurs `fontWeight` acceptées par React Native.
 */
export const fontSize = {
  caption: 12,
  bodySmall: 14,
  body: 16,
  bodyLarge: 18,
  h4: 20,
  h3: 24,
  h2: 30,
  h1: 36,
  display: 40,
} as const;

export const fontWeight = {
  regular: '400',
  semibold: '600',
  bold: '700',
  black: '800',
} as const;
