/**
 * Couleurs MICHELIN Ride ID (§11.5). Mêmes noms sémantiques que le web ;
 * objets TS immuables, aucun CSS (§11.16).
 */
export const colors = {
  brandBlue: '#27509B',
  brandYellow: '#FCE500',
  brandDarkBlue: '#00205B',
  brandMidnight: '#000C34',

  surfaceCanvas: '#F7F8FA',
  surfaceDefault: '#FFFFFF',
  surfaceBrand: '#00205B',
  surfaceHighlight: '#FFF9CC',

  textPrimary: '#202124',
  textSecondary: '#53565A',
  textOnBrand: '#FFFFFF',
  textOnYellow: '#000C34',

  borderDefault: '#D6D8DB',
  borderStrong: '#8A8D91',

  stateSuccess: '#2E7D32',
  stateError: '#B3261E',
} as const;
