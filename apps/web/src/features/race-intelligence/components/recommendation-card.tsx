import type { RaceAnalyzeResponse } from '@michelin/contracts';

interface RecommendationCardProps {
  result: RaceAnalyzeResponse;
}

export function RecommendationCard({ result }: RecommendationCardProps) {
  const {
    tire,
    pressure,
    weatherSummary,
    justification,
    confidenceScore,
    bikeCompatibility,
  } = result;

  return (
    <div className="ri-rec-card">
      {/* ── Header ── */}
      <div className="ri-rec-header">
        <img
          src="/bibendum.svg"
          className="ri-rec-bib-watermark"
          alt=""
          aria-hidden="true"
        />

        <div className="ri-rec-header-left">
          <p className="ri-rec-line-tag">{tire.line} Collection</p>
          <h2 className="ri-rec-tire-name">{tire.name}</h2>
          <p className="ri-rec-tire-desc">{tire.description}</p>
          {weatherSummary && (
            <div className="ri-rec-weather-badge">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
              {weatherSummary}
            </div>
          )}
        </div>

        <div className="ri-rec-score-badge">
          <span className="ri-rec-score-num">
            {confidenceScore}
            <span className="ri-rec-score-pct">%</span>
          </span>
          <span className="ri-rec-score-label">Match</span>
        </div>
      </div>

      {bikeCompatibility && (
        <div className="ri-rec-bike-compat">
          <div>
            <p>Compatibilité vélo</p>
            <h3>{bikeCompatibility.bikeName}</h3>
          </div>
          <div className="ri-rec-bike-tags">
            {bikeCompatibility.details.map((detail) => (
              <span key={detail}>{detail}</span>
            ))}
          </div>
          {bikeCompatibility.warning && (
            <p className="ri-rec-bike-warning">{bikeCompatibility.warning}</p>
          )}
        </div>
      )}

      {/* ── Pressure hero ── */}
      <div className="ri-rec-pressure-hero">
        <p className="ri-rec-pressure-hero-label">Pression recommandée</p>
        <div className="ri-rec-pressure-display">
          <div className="ri-rec-pressure-col">
            <span className="ri-rec-pressure-num">{pressure.frontBar}</span>
            <div className="ri-rec-pressure-meta">
              <span className="ri-rec-pressure-unit">bar</span>
              <span className="ri-rec-pressure-axle">Avant</span>
            </div>
          </div>
          <div className="ri-rec-pressure-vsep" />
          <div className="ri-rec-pressure-col">
            <span className="ri-rec-pressure-num">{pressure.rearBar}</span>
            <div className="ri-rec-pressure-meta">
              <span className="ri-rec-pressure-unit">bar</span>
              <span className="ri-rec-pressure-axle">Arrière</span>
            </div>
          </div>
        </div>
        <p className="ri-rec-pressure-note">{pressure.note}</p>
      </div>

      {/* ── Points forts ── */}
      <div className="ri-rec-highlights">
        <p className="ri-rec-highlights-label">Points forts</p>
        <div className="ri-rec-highlights-grid">
          {tire.highlights.map((h) => (
            <div key={h} className="ri-rec-highlight-item">
              <span className="ri-rec-highlight-dot" />
              {h}
            </div>
          ))}
        </div>
      </div>

      {/* ── Conseil du Bibendum ── */}
      <div className="ri-rec-conseil">
        <div className="ri-rec-conseil-icon">
          <img src="/bibendum.svg" alt="" aria-hidden="true" />
        </div>
        <div className="ri-rec-conseil-content">
          <p className="ri-rec-conseil-title">Le conseil du Bibendum</p>
          <p className="ri-rec-conseil-text">{justification}</p>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="ri-rec-cta-wrap">
        <a
          href={tire.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ri-rec-cta"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          Acheter le {tire.name}
          <span className="ri-rec-cta-price">{tire.priceEur.toFixed(2)} €</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </a>
      </div>
    </div>
  );
}
