import type { MichelinProduct, Retailer } from '@michelin/contracts';
import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';

import {
  isEbike,
  productCycleType,
  productImageSrc,
  productName,
  productRange,
  productSize,
  productTags,
} from '../services/product-presenter';
import { ProductDetailMotion } from './product-detail-motion';
import styles from './product-detail.module.css';
import { WhereToBuy } from './where-to-buy';

interface ProductDetailProps {
  product: MichelinProduct;
  retailers: Retailer[];
}

interface SpecRow {
  label: string;
  value: string | null;
}

interface FeatureTile {
  label: string;
  text: string;
  title: string;
}

function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function display(value: string | null | undefined, fallback: string): string {
  return clean(value) ?? fallback;
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

function joinValues(values: Array<string | null | undefined>): string | null {
  const visible = values.map((value) => clean(value)).filter(Boolean);
  return visible.length > 0 ? visible.join(' · ') : null;
}

function SpecGroup({ title, rows }: { title: string; rows: SpecRow[] }) {
  const visible = rows.filter((row) => row.value !== null);
  if (visible.length === 0) return null;

  return (
    <section className={styles.group}>
      <h3 className={styles.groupTitle}>{title}</h3>
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

export function ProductDetail({ product, retailers }: ProductDetailProps) {
  const name = productName(product);
  const range = productRange(product);
  const cycleType = productCycleType(product);
  const size = productSize(product);
  const tags = productTags(product);
  const imageSrc = productImageSrc(product);
  const heroTitle = range ?? name;
  const heroSubtitle =
    heroTitle === name ? (clean(product.designation) ?? size) : name;

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

  const pressureLabel =
    pressureRange(product.minimum_pressure, product.maximum_pressure, 'bar') ??
    pressureRange(
      product.conversion_psi_mini,
      product.conversion_psi_maxi,
      'psi',
    );

  const heroFacts = [
    {
      label: 'Dimension',
      value: display(size, 'À confirmer'),
    },
    {
      label: 'Montage',
      value: display(
        joinValues([product.sealing, product.fitting]),
        'À vérifier',
      ),
    },
    {
      label: 'Pression',
      value: pressureLabel ?? 'Voir recommandations',
    },
  ];

  const featureTiles: FeatureTile[] = [
    {
      label: 'Terrain',
      text: display(
        joinValues([product.use, product.terrain_types]),
        'Usage à vérifier',
      ),
      title: 'Usage',
    },
    {
      label: 'Dimension',
      text: display(joinValues([size, product.rim_type]), 'À confirmer'),
      title: 'Format',
    },
    {
      label: 'Montage',
      text: display(
        joinValues([product.sealing, product.fitting, product.bead]),
        'À vérifier',
      ),
      title: 'Compatibilité',
    },
    {
      label: 'Technologies',
      text: display(
        joinValues([
          product.rubber_technologies,
          product.casing_technologies,
          product.reinforcement_technologies,
        ]),
        'Voir fiche technique',
      ),
      title: 'Construction',
    },
  ];
  const [usageTile, formatTile, mountingTile, technologyTile] =
    featureTiles as [FeatureTile, FeatureTile, FeatureTile, FeatureTile];

  const accordionItems = [
    {
      title: 'Terrain',
      value: display(product.terrain_types, 'Surface mixte'),
      text: 'Surface dominante',
    },
    {
      title: 'Carcasse',
      value: display(product.casing_technologies, 'Construction Michelin'),
      text: 'Construction',
    },
    {
      title: 'Pression',
      value: pressureLabel ?? 'Plage à confirmer',
      text: 'Plage recommandée',
    },
    {
      title: 'Référence',
      value: display(
        joinValues([product.mspn_code, product.ean_code]),
        'Identifiant catalogue',
      ),
      text: 'MSPN · EAN',
    },
  ];

  const marqueeItems = [
    range,
    cycleType,
    size,
    ...tags,
    isEbike(product) && !tags.includes('E-bike') ? 'E-bike ready' : null,
    'Michelin Race',
    'Comparateur Michelin',
    'Reprise Michelin',
  ].filter((item): item is string => Boolean(item));
  const marqueeLoop = [...marqueeItems, ...marqueeItems];

  return (
    <article className={styles.detail}>
      <ProductDetailMotion />

      <section className={styles.hero} aria-labelledby="product-title">
        <Image
          alt="Pneu de vélo Michelin en mouvement sur terrain rapide"
          className={styles.heroImage}
          height={720}
          priority
          sizes="100vw"
          src="/michelin-race-hero.jpg"
          width={1400}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.speedLines} aria-hidden="true" />

        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <Link href="/products" className={styles.back}>
              Retour au catalogue
            </Link>
            <p className={styles.eyebrow}>
              {cycleType ?? 'Catalogue Michelin'}
            </p>
            <h1 className={styles.name} id="product-title">
              {heroTitle}
            </h1>
            {heroSubtitle && heroSubtitle !== heroTitle && (
              <p className={styles.range}>{heroSubtitle}</p>
            )}
            <dl className={styles.heroFacts} aria-label="Données principales">
              {heroFacts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
            <div className={styles.heroActions}>
              <a className={styles.primaryAction} href="#ou-acheter">
                Voir où l’acheter
              </a>
              <Link className={styles.secondaryAction} href="/comparateur">
                Comparer ce pneu
              </Link>
            </div>
          </div>

          <div
            className={`${styles.heroProduct} ${styles.motionImage}`}
            aria-hidden="true"
          >
            <Image
              className={styles.productImage}
              src={imageSrc}
              alt=""
              fill
              sizes="(min-width: 960px) 42vw, 92vw"
              priority
            />
            <div className={styles.productReflection} />
          </div>
        </div>
      </section>

      <div className={styles.marquee} aria-label="Univers du produit">
        <div className={styles.marqueeTrack}>
          {marqueeLoop.map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <section
        className={styles.bentoSection}
        aria-labelledby="product-signals-title"
      >
        <div className={styles.sectionHeading}>
          <p className={styles.sectionKicker}>Lecture terrain</p>
          <h2 id="product-signals-title">
            Le pneu <span className={styles.inlineImage} aria-hidden="true" />{' '}
            se lit par usage.
          </h2>
        </div>

        <div className={styles.signalBento}>
          <article className={`${styles.bentoCard} ${styles.bentoHero}`}>
            <span className={styles.bentoGlow} aria-hidden="true" />
            <p>{usageTile.label}</p>
            <h3>{usageTile.title}</h3>
            <strong>{usageTile.text}</strong>
          </article>
          {[formatTile, mountingTile].map((tile) => (
            <article
              className={`${styles.bentoCard} ${styles.bentoMetric}`}
              key={tile.title}
            >
              <p>{tile.label}</p>
              <h3>{tile.title}</h3>
              <span>{tile.text}</span>
            </article>
          ))}
          <article className={`${styles.bentoCard} ${styles.bentoWide}`}>
            <p>{technologyTile.label}</p>
            <h3>{technologyTile.title}</h3>
            <span>{technologyTile.text}</span>
            {tags.length > 0 && (
              <div className={styles.tags}>
                {tags.map((tag) => (
                  <Badge key={tag} tone="brand">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </article>
        </div>
      </section>

      <section className={styles.accordionSection} aria-labelledby="fit-title">
        <div className={styles.accordionHeader}>
          <p className={styles.sectionKicker}>Choix guidé</p>
          <h2 id="fit-title">Les informations qui changent la décision.</h2>
        </div>
        <div className={styles.fitAccordion}>
          {accordionItems.map((item) => (
            <article className={styles.accordionItem} key={item.title}>
              <div>
                <p>{item.title}</p>
                <h3>{item.value}</h3>
              </div>
              <span>{item.text}</span>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.purchaseSection} id="ou-acheter">
        <div className={styles.purchaseCopy}>
          <p className={styles.sectionKicker}>Achat partenaire</p>
          <h2>Revendeurs partenaires</h2>
          <p>
            Choisissez un pays ou recherchez les points de vente proches de
            vous.
          </p>
        </div>
        <WhereToBuy retailers={retailers} />
      </section>

      <section className={styles.specSection} aria-labelledby="technical-title">
        <div className={styles.specHeader}>
          <p className={styles.sectionKicker}>Fiche technique</p>
          <h2 id="technical-title">Caractéristiques produit</h2>
        </div>
        <div className={styles.groups}>
          <SpecGroup title="Dimensions" rows={dimensions} />
          <SpecGroup title="Montage et étanchéité" rows={mounting} />
          <SpecGroup title="Pression" rows={pressure} />
          <SpecGroup title="Construction et technologies" rows={construction} />
          <SpecGroup title="Références et conditionnement" rows={references} />
        </div>
      </section>

      <section className={styles.actionSection}>
        <div>
          <p className={styles.sectionKicker}>Après la sortie</p>
          <h2>Comparer ou préparer la reprise</h2>
          <p>
            Utilisez ce modèle dans le comparateur ou démarrez une demande de
            reprise.
          </p>
        </div>
        <div className={styles.finalActions}>
          <Link className={styles.darkAction} href="/comparateur">
            Comparer sur un itinéraire
          </Link>
          <Link className={styles.lightAction} href="/reprise">
            Préparer la reprise
          </Link>
        </div>
      </section>
    </article>
  );
}
