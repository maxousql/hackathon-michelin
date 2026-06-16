import type { ProductFacets } from '@michelin/contracts';

/**
 * Facettes proposées sous forme de chips dans le catalogue mobile. On retient
 * les catégories à faible cardinalité, lisibles sur petit écran. Le diamètre et
 * la largeur (nombreuses valeurs) restent filtrables côté web.
 */
export type ChipFilterKey = Extract<
  keyof ProductFacets,
  'cycleType' | 'segment' | 'productType' | 'sealing'
>;

export const CHIP_FILTERS: { key: ChipFilterKey; label: string }[] = [
  { key: 'cycleType', label: 'Type de vélo' },
  { key: 'segment', label: 'Ligne' },
  { key: 'sealing', label: 'Montage' },
  { key: 'productType', label: 'Type de produit' },
];
