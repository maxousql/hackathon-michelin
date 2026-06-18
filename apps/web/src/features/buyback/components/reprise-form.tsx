'use client';

import type { BuybackCondition, ProductListItem } from '@michelin/contracts';
import { useActionState, useEffect, useState, useTransition } from 'react';

import { Button, ButtonLink } from '@/components/ui/button';
import {
  productName,
  productSize,
} from '@/features/products/services/product-presenter';

import {
  createBuybackAction,
  searchTiresAction,
  type CreateBuybackState,
} from '../actions/buyback.actions';
import { estimateBuyback } from '../estimate';
import {
  CONDITION_HINTS,
  CONDITION_LABELS,
  CONDITION_ORDER,
  formatEuros,
} from '../labels';
import styles from './reprise-form.module.css';

export function RepriseForm({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductListItem[]>([]);
  const [selected, setSelected] = useState<ProductListItem | null>(null);
  const [condition, setCondition] = useState<BuybackCondition>('good');
  const [quantity, setQuantity] = useState(1);
  const [isSearching, startSearch] = useTransition();
  const [state, formAction, pending] = useActionState<
    CreateBuybackState,
    FormData
  >(createBuybackAction, undefined);

  useEffect(() => {
    if (selected) return;
    const q = query.trim();
    const handle = setTimeout(() => {
      startSearch(async () => {
        setResults(q.length < 2 ? [] : await searchTiresAction(q));
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [query, selected]);

  const estimate = selected
    ? estimateBuyback(selected.segment, condition, quantity)
    : null;

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Estimez la reprise de votre pneu</h2>
      <p className={styles.lede}>
        Sélectionnez votre modèle, indiquez son état : MICHELIN vous propose un
        montant de reprise et le récupère pour le remettre à neuf ou le
        recycler.
      </p>

      {selected ? (
        <div className={styles.selected}>
          <div>
            <p className={styles.selectedName}>{productName(selected)}</p>
            {productSize(selected) ? (
              <p className={styles.selectedMeta}>{productSize(selected)}</p>
            ) : null}
          </div>
          <button
            type="button"
            className={styles.change}
            onClick={() => {
              setSelected(null);
              setQuery('');
            }}
          >
            Changer
          </button>
        </div>
      ) : (
        <div className={styles.group}>
          <label className={styles.label} htmlFor="tire-search">
            Votre modèle de pneu
          </label>
          <input
            id="tire-search"
            type="search"
            className={styles.input}
            placeholder="Rechercher dans le catalogue…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {isSearching ? <p className={styles.hint}>Recherche…</p> : null}
          {results.length > 0 ? (
            <ul className={styles.results}>
              {results.map((tire) => (
                <li key={tire.id}>
                  <button
                    type="button"
                    className={styles.result}
                    onClick={() => {
                      setSelected(tire);
                      setResults([]);
                    }}
                  >
                    <span>{productName(tire)}</span>
                    {productSize(tire) ? (
                      <span className={styles.resultMeta}>
                        {productSize(tire)}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}

      {selected ? (
        <form action={formAction} className={styles.form}>
          <input type="hidden" name="productId" value={selected.id} />

          <fieldset className={styles.fieldset}>
            <legend className={styles.label}>État du pneu</legend>
            <div className={styles.conditions}>
              {CONDITION_ORDER.map((value) => (
                <label
                  key={value}
                  className={styles.condition}
                  data-active={condition === value ? '' : undefined}
                >
                  <input
                    type="radio"
                    name="condition"
                    value={value}
                    checked={condition === value}
                    onChange={() => setCondition(value)}
                  />
                  <span className={styles.conditionLabel}>
                    {CONDITION_LABELS[value]}
                  </span>
                  <span className={styles.conditionHint}>
                    {CONDITION_HINTS[value]}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className={styles.qtyRow}>
            <label className={styles.label} htmlFor="qty">
              Quantité
            </label>
            <input
              id="qty"
              name="quantity"
              type="number"
              min={1}
              max={20}
              className={styles.qtyInput}
              value={quantity}
              onChange={(event) =>
                setQuantity(Math.max(1, Number(event.target.value) || 1))
              }
            />
          </div>

          {estimate !== null ? (
            <div className={styles.estimate}>
              <span className={styles.estimateLabel}>Reprise estimée</span>
              <span className={styles.estimateAmount}>
                {formatEuros(estimate)}
              </span>
            </div>
          ) : null}

          {state && 'error' in state ? (
            <p className={styles.error}>{state.error}</p>
          ) : null}
          {state && 'amountEur' in state ? (
            <p className={styles.success}>
              Demande envoyée ! MICHELIN vous reprend ce pneu pour{' '}
              {formatEuros(state.amountEur)}.
            </p>
          ) : null}

          {isLoggedIn ? (
            <Button type="submit" variant="primary" disabled={pending}>
              {pending ? 'Envoi…' : 'Demander la reprise'}
            </Button>
          ) : (
            <ButtonLink href="/login" variant="primary">
              Se connecter pour enregistrer
            </ButtonLink>
          )}
        </form>
      ) : null}
    </section>
  );
}
