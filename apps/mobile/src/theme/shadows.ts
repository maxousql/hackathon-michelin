import { colors } from './colors';

export const shadows = Object.freeze({
  low: Object.freeze({
    shadowColor: colors.brand.midnight,
    shadowOffset: Object.freeze({ height: 2, width: 0 }),
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  }),
  medium: Object.freeze({
    shadowColor: colors.brand.midnight,
    shadowOffset: Object.freeze({ height: 8, width: 0 }),
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 5,
  }),
});
