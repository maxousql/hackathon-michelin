import type { BuybackCondition } from '@michelin/contracts';

/**
 * Barème de reprise. `michelin_products` n'expose pas de prix : on estime la
 * valeur de rachat à partir de la ligne produit (segment) et de l'état déclaré.
 * Montants indicatifs, ajustables.
 */
const SEGMENT_BASE_EUR: Record<string, number> = {
  'PREMIUM RACING LINE': 45,
  'PREMIUM COMPETITION LINE': 34,
  'PREMIUM PERFORMANCE LINE': 22,
  'ACCESS LINE': 12,
};

const DEFAULT_BASE_EUR = 15;

const CONDITION_FACTOR: Record<BuybackCondition, number> = {
  new: 1,
  very_good: 0.8,
  good: 0.55,
  fair: 0.3,
};

/** Montant de reprise estimé, arrondi au centime. */
export function estimateBuyback(
  segment: string | null,
  condition: BuybackCondition,
  quantity: number,
): number {
  const base = (segment && SEGMENT_BASE_EUR[segment]) || DEFAULT_BASE_EUR;
  const amount = base * CONDITION_FACTOR[condition] * quantity;
  return Math.round(amount * 100) / 100;
}
