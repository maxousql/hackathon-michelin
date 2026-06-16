/**
 * Configuration UI des filtres du catalogue. Les libellés et l'ordre sont des
 * choix d'interface ; le mapping vers les colonnes Supabase vit côté API.
 * Les clés correspondent à celles de `ProductFacets` (@michelin/contracts).
 */
export type FilterKey =
  | 'cycleType'
  | 'segment'
  | 'productType'
  | 'sealing'
  | 'diameter'
  | 'width';

/** Libellés lisibles des filtres (langage d'interface §11.13). */
export const FILTER_LABELS: Record<FilterKey, string> = {
  cycleType: 'Type de vélo',
  segment: 'Ligne',
  productType: 'Type de produit',
  sealing: 'Montage',
  diameter: 'Diamètre',
  width: 'Largeur',
};

/** Ordre d'affichage des filtres dans le panneau latéral. */
export const FILTER_ORDER: FilterKey[] = [
  'cycleType',
  'segment',
  'productType',
  'sealing',
  'diameter',
  'width',
];
