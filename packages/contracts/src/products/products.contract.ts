import { z } from 'zod';

/** Taille de page du catalogue (partagée entre l'API et le web). */
export const PRODUCTS_PAGE_SIZE = 24;

/**
 * Table Supabase `public.michelin_products`.
 * Toutes les colonnes métier sont stockées en `text` côté base : on les modélise
 * donc en `string` nullable. Seul `id` est un entier (bigint).
 */
export const michelinProductSchema = z.object({
  id: z.coerce.number(),
  global_id: z.string().nullable(),
  brand: z.string().nullable(),
  product_type: z.string().nullable(),
  cycle_type: z.string().nullable(),
  segment: z.string().nullable(),
  range: z.string().nullable(),
  bead: z.string().nullable(),
  cai: z.string().nullable(),
  rear_fit_compatible: z.string().nullable(),
  customer_market: z.string().nullable(),
  width_etrto: z.string().nullable(),
  diameter_etrto: z.string().nullable(),
  designation: z.string().nullable(),
  type: z.string().nullable(),
  valve: z.string().nullable(),
  valve_length: z.string().nullable(),
  ean_code: z.string().nullable(),
  mspn_code: z.string().nullable(),
  upc_code: z.string().nullable(),
  livm: z.string().nullable(),
  discontinued_date: z.string().nullable(),
  weight: z.string().nullable(),
  conditioning: z.string().nullable(),
  unit_packaging_weight: z.string().nullable(),
  unit_packaging_width: z.string().nullable(),
  unit_packaging_depth: z.string().nullable(),
  unit_packaging_heigth: z.string().nullable(),
  individual_packaging_material: z.string().nullable(),
  transportation_packaging_weight: z.string().nullable(),
  transportation_packaging_width: z.string().nullable(),
  transportation_packaging_depth: z.string().nullable(),
  transportation_packaging_heigth: z.string().nullable(),
  transportation_packaging_material: z.string().nullable(),
  rpc_code: z.string().nullable(),
  market_perimeter: z.string().nullable(),
  web_range_name: z.string().nullable(),
  web_diameter: z.string().nullable(),
  web_diameter_1: z.string().nullable(),
  web_width: z.string().nullable(),
  web_width_1: z.string().nullable(),
  rim_type: z.string().nullable(),
  web_product_designation: z.string().nullable(),
  fitting: z.string().nullable(),
  tpi: z.string().nullable(),
  minimum_pressure: z.string().nullable(),
  maximum_pressure: z.string().nullable(),
  minimum_pressure_1: z.string().nullable(),
  maximum_pressure_1: z.string().nullable(),
  recommended_inner_tube: z.string().nullable(),
  sidewall_type: z.string().nullable(),
  sealing: z.string().nullable(),
  shore: z.string().nullable(),
  sidewall_color: z.string().nullable(),
  tread_pattern_color: z.string().nullable(),
  terrain_types: z.string().nullable(),
  use: z.string().nullable(),
  rubber_technologies: z.string().nullable(),
  casing_technologies: z.string().nullable(),
  tread_pattern_technologies: z.string().nullable(),
  reinforcement_technologies: z.string().nullable(),
  e_bike_technologies: z.string().nullable(),
  conversion_psi_mini: z.string().nullable(),
  conversion_psi_maxi: z.string().nullable(),
  eco_box_pack_type: z.string().nullable(),
  poids_total: z.string().nullable(),
  reflective_strip: z.string().nullable(),
  knurling_strip: z.string().nullable(),
  shoulder_color: z.string().nullable(),
  border_color: z.string().nullable(),
  label_type: z.string().nullable(),
  cycle_type_web: z.string().nullable(),
});

export type MichelinProduct = z.infer<typeof michelinProductSchema>;

/** Colonnes nécessaires à l'affichage d'une carte produit dans la liste. */
export const productListItemSchema = michelinProductSchema.pick({
  id: true,
  brand: true,
  product_type: true,
  cycle_type: true,
  segment: true,
  range: true,
  web_range_name: true,
  designation: true,
  web_product_designation: true,
  web_diameter: true,
  web_width: true,
  width_etrto: true,
  diameter_etrto: true,
  sealing: true,
  e_bike_technologies: true,
  weight: true,
});

export type ProductListItem = z.infer<typeof productListItemSchema>;

export const productListResponseSchema = z.object({
  items: z.array(productListItemSchema),
  total: z.number().int().nonnegative(),
});

export type ProductListResponse = z.infer<typeof productListResponseSchema>;

/** Critères de filtrage du catalogue (dérivés des paramètres d'URL). */
export const productFiltersSchema = z.object({
  q: z.string().trim().optional(),
  cycleType: z.string().optional(),
  segment: z.string().optional(),
  productType: z.string().optional(),
  sealing: z.string().optional(),
  diameter: z.string().optional(),
  width: z.string().optional(),
  ebike: z.boolean().optional(),
  sort: z.enum(['range', 'diameter']).default('range'),
  page: z.coerce.number().int().positive().default(1),
});

export type ProductFilters = z.infer<typeof productFiltersSchema>;

/** Liste des valeurs distinctes proposées pour chaque filtre à choix. */
export const productFacetsSchema = z.object({
  cycleType: z.array(z.string()),
  segment: z.array(z.string()),
  productType: z.array(z.string()),
  sealing: z.array(z.string()),
  diameter: z.array(z.string()),
  width: z.array(z.string()),
});

export type ProductFacets = z.infer<typeof productFacetsSchema>;
