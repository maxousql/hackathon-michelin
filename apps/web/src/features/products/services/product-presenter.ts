import type { ProductListItem } from '@michelin/contracts';

/**
 * Helpers de présentation : transforment une ligne brute du catalogue en
 * libellés prêts pour l'UI. Acceptent l'item de liste comme le produit complet
 * (ce dernier étant un sur-ensemble structurel).
 */

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/** Nom commercial affiché, avec repli progressif. */
export function productName(p: ProductListItem): string {
  return (
    clean(p.web_product_designation) ??
    clean(p.designation) ??
    clean(p.web_range_name) ??
    clean(p.range) ??
    `Produit ${p.id}`
  );
}

/** Gamme du produit (web prioritaire). */
export function productRange(p: ProductListItem): string | null {
  return clean(p.web_range_name) ?? clean(p.range);
}

/** Type de vélo associé (catégorie franche : ROAD, MTB, CITY…). */
export function productCycleType(p: ProductListItem): string | null {
  return clean(p.cycle_type);
}

/** Ligne produit raccourcie (« PREMIUM RACING LINE » → « Racing »). */
export function productLine(p: ProductListItem): string | null {
  const segment = clean(p.segment);
  if (!segment) return null;
  const core = segment
    .replace(/premium/gi, '')
    .replace(/line/gi, '')
    .trim();
  if (!core) return segment;
  return core.charAt(0).toUpperCase() + core.slice(1).toLowerCase();
}

/** Dimension lisible : diamètre × largeur, avec repli sur l'ETRTO. */
export function productSize(p: ProductListItem): string | null {
  const diameter = clean(p.web_diameter);
  const width = clean(p.web_width);
  if (diameter && width) return `${diameter} × ${width}`;
  if (diameter) return diameter;
  if (width) return width;

  const widthEtrto = clean(p.width_etrto);
  const diameterEtrto = clean(p.diameter_etrto);
  if (widthEtrto && diameterEtrto) {
    return `${widthEtrto}-${diameterEtrto} (ETRTO)`;
  }
  return null;
}

/** Le produit est-il compatible vélo électrique ? */
export function isEbike(p: ProductListItem): boolean {
  return clean(p.e_bike_technologies) !== null;
}

/** Badges courts décrivant le produit (ligne, montage, e-bike). */
export function productTags(p: ProductListItem): string[] {
  const tags: string[] = [];
  const line = productLine(p);
  const sealing = clean(p.sealing);

  if (line) tags.push(line);
  if (sealing) tags.push(sealing);
  if (isEbike(p)) tags.push('E-bike');

  return tags.slice(0, 3);
}
