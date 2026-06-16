import type { MichelinProduct } from '@michelin/contracts';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button';

import {
  isEbike,
  productCycleType,
  productName,
  productRange,
  productSize,
  productTags,
} from '../services/product-presenter';
import styles from './product-detail.module.css';

interface ProductDetailProps {
  product: MichelinProduct;
}

interface SpecRow {
  label: string;
  value: string | null;
}

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function pressureRange(
  min: string | null,
  max: string | null,
  unit: string,
): string | null {
  const lo = clean(min);
  const hi = clean(max);
  if (lo && hi) return `${lo} – ${hi} ${unit}`;
  if (lo) return `min. ${lo} ${unit}`;
  if (hi) return `max. ${hi} ${unit}`;
  return null;
}

function SpecGroup({ title, rows }: { title: string; rows: SpecRow[] }) {
  const visible = rows.filter((row) => row.value !== null);
  if (visible.length === 0) return null;

  return (
    <section className={styles.group}>
      <h2 className={styles.groupTitle}>{title}</h2>
      <dl className={styles.specs}>
        {visible.map((row) => (
          <div className={styles.specRow} key={row.label}>
            <dt className={styles.specLabel}>{row.label}</dt>
            <dd className={styles.specValue}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ProductDetail({ product }: ProductDetailProps) {
  const name = productName(product);
  const range = productRange(product);
  const cycleType = productCycleType(product);
  const size = productSize(product);
  const tags = productTags(product);

  const dimensions: SpecRow[] = [
    { label: 'Diamètre', value: clean(product.web_diameter) },
    { label: 'Largeur', value: clean(product.web_width) },
    { label: 'Diamètre ETRTO', value: clean(product.diameter_etrto) },
    { label: 'Largeur ETRTO', value: clean(product.width_etrto) },
    { label: 'Type de jante', value: clean(product.rim_type) },
  ];

  const mounting: SpecRow[] = [
    { label: 'Tringle', value: clean(product.bead) },
    { label: 'Étanchéité', value: clean(product.sealing) },
    { label: 'Montage', value: clean(product.fitting) },
    {
      label: 'Chambre à air recommandée',
      value: clean(product.recommended_inner_tube),
    },
    { label: 'Valve', value: clean(product.valve) },
    { label: 'Longueur de valve', value: clean(product.valve_length) },
  ];

  const pressure: SpecRow[] = [
    {
      label: 'Pression conseillée',
      value: pressureRange(
        product.minimum_pressure,
        product.maximum_pressure,
        'bar',
      ),
    },
    {
      label: 'Pression (psi)',
      value: pressureRange(
        product.conversion_psi_mini,
        product.conversion_psi_maxi,
        'psi',
      ),
    },
  ];

  const construction: SpecRow[] = [
    { label: 'Ligne', value: clean(product.segment) },
    { label: 'Type de produit', value: clean(product.product_type) },
    { label: 'Usage', value: clean(product.use) },
    { label: 'Terrains', value: clean(product.terrain_types) },
    { label: 'TPI (densité de la carcasse)', value: clean(product.tpi) },
    { label: 'Carcasse', value: clean(product.casing_technologies) },
    { label: 'Gomme', value: clean(product.rubber_technologies) },
    { label: 'Sculpture', value: clean(product.tread_pattern_technologies) },
    { label: 'Renfort', value: clean(product.reinforcement_technologies) },
    { label: 'Technologies e-bike', value: clean(product.e_bike_technologies) },
    { label: 'Flanc', value: clean(product.sidewall_type) },
    { label: 'Poids', value: clean(product.weight) },
  ];

  const references: SpecRow[] = [
    { label: 'Code EAN', value: clean(product.ean_code) },
    { label: 'Code MSPN', value: clean(product.mspn_code) },
    { label: 'Code UPC', value: clean(product.upc_code) },
    { label: 'Identifiant global', value: clean(product.global_id) },
    { label: 'Conditionnement', value: clean(product.conditioning) },
  ];

  return (
    <article className={styles.detail}>
      <Link href="/products" className={styles.back}>
        ← Retour au catalogue
      </Link>

      <div className={styles.top}>
        <div className={styles.media} aria-hidden="true">
          <span className={styles.mediaInitial}>
            {(range ?? name).charAt(0).toUpperCase()}
          </span>
        </div>

        <div className={styles.summary}>
          {cycleType && <p className={styles.eyebrow}>{cycleType}</p>}
          <h1 className={styles.name}>{name}</h1>
          {range && range !== name && <p className={styles.range}>{range}</p>}
          {size && <p className={styles.size}>{size}</p>}

          {tags.length > 0 && (
            <div className={styles.tags}>
              {tags.map((tag) => (
                <Badge key={tag} tone="brand">
                  {tag}
                </Badge>
              ))}
              {isEbike(product) && <Badge tone="success">E-bike</Badge>}
            </div>
          )}

          <div className={styles.cta}>
            <ButtonLink href="#" variant="primary">
              Voir où l’acheter
            </ButtonLink>
          </div>
        </div>
      </div>

      <div className={styles.groups}>
        <SpecGroup title="Dimensions" rows={dimensions} />
        <SpecGroup title="Montage et étanchéité" rows={mounting} />
        <SpecGroup title="Pression" rows={pressure} />
        <SpecGroup title="Construction et technologies" rows={construction} />
        <SpecGroup title="Références et conditionnement" rows={references} />
      </div>
    </article>
  );
}
