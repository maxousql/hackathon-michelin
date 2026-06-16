import type { BuybackCondition } from '@michelin/contracts';

/**
 * Barème de reprise — copie côté mobile pour l'aperçu instantané. La valeur
 * faisant foi est recalculée par l'API au moment de la demande.
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

export function estimateBuyback(
  segment: string | null,
  condition: BuybackCondition,
  quantity: number,
): number {
  const base = (segment && SEGMENT_BASE_EUR[segment]) || DEFAULT_BASE_EUR;
  return Math.round(base * CONDITION_FACTOR[condition] * quantity * 100) / 100;
}
