'use client';

import { useEffect, useRef, useState } from 'react';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    country_code?: string;
  };
}

interface CityAutocompleteProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function getCityLabel(result: NominatimResult): {
  primary: string;
  secondary: string;
} {
  const addr = result.address;
  const city =
    addr?.city ??
    addr?.town ??
    addr?.village ??
    result.display_name.split(', ')[0] ??
    '';
  const country = addr?.country ?? '';
  return { primary: city, secondary: country };
}

export function CityAutocomplete({
  id,
  value,
  onChange,
  placeholder,
}: CityAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const abortRef = useRef<AbortController | null>(null);
  const shouldSearchRef = useRef(false);
  const lastLocalChangeRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastLocalChangeRef.current === value) {
      lastLocalChangeRef.current = null;
      return;
    }

    shouldSearchRef.current = false;
    setQuery(value);
    setSuggestions([]);
    setIsOpen(false);
  }, [value]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    abortRef.current?.abort();

    if (!shouldSearchRef.current) return;

    if (query.length < 3) return;

    timerRef.current = setTimeout(async () => {
      abortRef.current = new AbortController();
      setIsLoading(true);

      try {
        const url = new URL('https://nominatim.openstreetmap.org/search');
        url.searchParams.set('q', query);
        url.searchParams.set('format', 'json');
        url.searchParams.set('limit', '6');
        url.searchParams.set('addressdetails', '1');
        url.searchParams.set('featuretype', 'city');

        const res = await fetch(url.toString(), {
          headers: {
            'Accept-Language': 'fr,en;q=0.9',
            'User-Agent': 'MichelinRaceIntelligence/1.0 (hackathon)',
          },
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error('Nominatim error');
        const data = (await res.json()) as NominatimResult[];
        setSuggestions(data);
        setIsOpen(data.length > 0);
        setActiveIndex(-1);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setSuggestions([]);
          setIsOpen(false);
        }
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  // Close on outside click
  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  function select(result: NominatimResult) {
    const { primary, secondary } = getCityLabel(result);
    const label = secondary ? `${primary}, ${secondary}` : primary;
    shouldSearchRef.current = false;
    lastLocalChangeRef.current = label;
    setQuery(label);
    onChange(label);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const s = suggestions[activeIndex];
      if (s) select(s);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="ri-autocomplete-wrap">
      <div className="ri-autocomplete-field">
        <svg
          className="ri-autocomplete-pin"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <input
          id={id}
          type="text"
          value={query}
          onChange={(e) => {
            const nextQuery = e.target.value;
            shouldSearchRef.current = true;
            lastLocalChangeRef.current = nextQuery;
            setQuery(nextQuery);
            onChange(nextQuery);
            if (nextQuery.length < 3) {
              setSuggestions([]);
              setIsOpen(false);
            }
          }}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? 'Rechercher une ville…'}
          className="ri-autocomplete-input"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls="ri-autocomplete-list"
        />
        {isLoading && (
          <div className="ri-autocomplete-spinner" aria-hidden="true" />
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          id="ri-autocomplete-list"
          className="ri-autocomplete-list"
          role="listbox"
          aria-label="Suggestions de villes"
        >
          {suggestions.map((s, i) => {
            const { primary, secondary } = getCityLabel(s);
            return (
              <li
                key={s.place_id}
                role="option"
                aria-selected={i === activeIndex}
                className={`ri-autocomplete-item${i === activeIndex ? ' ri-autocomplete-item--active' : ''}`}
                onPointerDown={(e) => {
                  e.preventDefault();
                  select(s);
                }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <svg
                  className="ri-autocomplete-item-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="ri-autocomplete-item-text">
                  <span className="ri-autocomplete-city">{primary}</span>
                  {secondary && (
                    <span className="ri-autocomplete-country">{secondary}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
