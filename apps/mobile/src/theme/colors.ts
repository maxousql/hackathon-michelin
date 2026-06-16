const brand = Object.freeze({
  blue: '#27509B',
  yellow: '#FCE500',
  darkBlue: '#00205B',
  midnight: '#000C34',
  responsibleGray: '#53565A',
  committedPurple: '#582C83',
  generousGreen: '#84BD00',
});

const base = Object.freeze({
  white: '#FFFFFF',
  black: '#000000',
});

const surface = Object.freeze({
  canvas: '#F7F8FA',
  default: '#FFFFFF',
  brand: '#00205B',
  highlight: '#FFF9CC',
});

const text = Object.freeze({
  primary: '#202124',
  secondary: '#53565A',
  onBrand: '#FFFFFF',
  onYellow: '#000C34',
});

const border = Object.freeze({
  default: '#D6D8DB',
  strong: '#8A8D91',
});

const state = Object.freeze({
  success: '#2E7D32',
  warning: '#8A6500',
  error: '#B3261E',
  info: '#27509B',
});

export const colors = Object.freeze({
  brand,
  base,
  surface,
  text,
  border,
  state,

  brandBlue: brand.blue,
  brandYellow: brand.yellow,
  brandDarkBlue: brand.darkBlue,
  brandMidnight: brand.midnight,

  surfaceCanvas: surface.canvas,
  surfaceDefault: surface.default,
  surfaceBrand: surface.brand,
  surfaceHighlight: surface.highlight,

  textPrimary: text.primary,
  textSecondary: text.secondary,
  textOnBrand: text.onBrand,
  textOnYellow: text.onYellow,

  borderDefault: border.default,
  borderStrong: border.strong,

  stateSuccess: state.success,
  stateWarning: state.warning,
  stateError: state.error,
  stateInfo: state.info,
});
