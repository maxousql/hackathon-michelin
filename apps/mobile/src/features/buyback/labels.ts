import type { BuybackCondition, BuybackStatus } from '@michelin/contracts';

export const CONDITION_LABELS: Record<BuybackCondition, string> = {
  new: 'Comme neuf',
  very_good: 'Très bon état',
  good: 'Bon état',
  fair: 'État correct',
};

export const CONDITION_HINTS: Record<BuybackCondition, string> = {
  new: 'Très peu roulé, aucune usure visible.',
  very_good: 'Usure légère, gomme en bon état.',
  good: 'Usure modérée, encore plusieurs centaines de km.',
  fair: 'Bien usé, en fin de vie.',
};

export const CONDITION_ORDER: BuybackCondition[] = [
  'new',
  'very_good',
  'good',
  'fair',
];

export const STATUS_LABELS: Record<BuybackStatus, string> = {
  pending: 'En attente',
  accepted: 'Acceptée',
  received: 'Reçue',
  paid: 'Payée',
  rejected: 'Refusée',
};

export function formatEuros(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}
