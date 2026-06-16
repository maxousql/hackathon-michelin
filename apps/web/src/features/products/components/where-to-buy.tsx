'use client';

import type { Retailer } from '@michelin/contracts';
import { useMemo, useState } from 'react';

import styles from './where-to-buy.module.css';

const COUNTRY_NAMES: Record<string, string> = {
  FR: 'France',
  DE: 'Allemagne',
  UK: 'Royaume-Uni',
  ES: 'Espagne',
  NL: 'Pays-Bas',
  IT: 'Italie',
  PL: 'Pologne',
  BE: 'Belgique',
};

function countryName(code: string): string {
  return COUNTRY_NAMES[code] ?? code;
}

interface WhereToBuyProps {
  retailers: Retailer[];
}

export function WhereToBuy({ retailers }: WhereToBuyProps) {
  const countries = useMemo(
    () =>
      [...new Set(retailers.map((r) => r.country))].sort((a, b) =>
        countryName(a).localeCompare(countryName(b), 'fr'),
      ),
    [retailers],
  );

  const [country, setCountry] = useState(() =>
    countries.includes('FR') ? 'FR' : (countries[0] ?? ''),
  );

  if (retailers.length === 0) {
    return (
      <section className={styles.box}>
        <h2 className={styles.title}>Où l’acheter</h2>
        <p className={styles.empty}>
          Aucun revendeur partenaire disponible pour le moment.
        </p>
      </section>
    );
  }

  const list = retailers.filter((retailer) => retailer.country === country);

  return (
    <section className={styles.box}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>Où l’acheter</h2>
          <p className={styles.subtitle}>
            Disponible chez nos revendeurs partenaires.
          </p>
        </div>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Pays</span>
          <select
            className={styles.select}
            value={country}
            onChange={(event) => setCountry(event.target.value)}
          >
            {countries.map((code) => (
              <option key={code} value={code}>
                {countryName(code)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className={styles.list}>
        {list.map((retailer) => (
          <li key={retailer.id}>
            <a
              className={styles.retailer}
              href={retailer.website}
              target="_blank"
              rel="noreferrer noopener"
            >
              <span className={styles.name}>{retailer.name}</span>
              <span className={styles.go}>Visiter →</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
