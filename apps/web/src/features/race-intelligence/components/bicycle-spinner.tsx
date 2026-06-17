export function BicycleSpinner() {
  return (
    <div className="ri-bike-wrap" aria-label="Analyse en cours" role="status">
      <svg
        viewBox="0 0 200 100"
        xmlns="http://www.w3.org/2000/svg"
        className="ri-bike-svg"
        aria-hidden="true"
      >
        {/* ── Rear wheel ────────────────────────────── */}
        <circle
          cx="40"
          cy="68"
          r="24"
          fill="none"
          stroke="#003189"
          strokeWidth="3.5"
        />
        <circle
          cx="40"
          cy="68"
          r="14"
          fill="none"
          stroke="#003189"
          strokeWidth="1"
          opacity="0.25"
        />
        {/* Rear spokes — rotate around (40, 68) */}
        <g className="ri-spokes" style={{ transformOrigin: '40px 68px' }}>
          <line
            x1="40"
            y1="44"
            x2="40"
            y2="92"
            stroke="#FFD200"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="16"
            y1="68"
            x2="64"
            y2="68"
            stroke="#FFD200"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="23"
            y1="51"
            x2="57"
            y2="85"
            stroke="#FFD200"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="57"
            y1="51"
            x2="23"
            y2="85"
            stroke="#FFD200"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        <circle cx="40" cy="68" r="4.5" fill="#003189" />

        {/* ── Front wheel ───────────────────────────── */}
        <circle
          cx="160"
          cy="68"
          r="24"
          fill="none"
          stroke="#003189"
          strokeWidth="3.5"
        />
        <circle
          cx="160"
          cy="68"
          r="14"
          fill="none"
          stroke="#003189"
          strokeWidth="1"
          opacity="0.25"
        />
        {/* Front spokes — rotate around (160, 68) */}
        <g className="ri-spokes" style={{ transformOrigin: '160px 68px' }}>
          <line
            x1="160"
            y1="44"
            x2="160"
            y2="92"
            stroke="#FFD200"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="136"
            y1="68"
            x2="184"
            y2="68"
            stroke="#FFD200"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="143"
            y1="51"
            x2="177"
            y2="85"
            stroke="#FFD200"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="177"
            y1="51"
            x2="143"
            y2="85"
            stroke="#FFD200"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        <circle cx="160" cy="68" r="4.5" fill="#003189" />

        {/* ── Frame ─────────────────────────────────── */}
        <g
          stroke="#003189"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Chain stay */}
          <line x1="40" y1="68" x2="98" y2="68" strokeWidth="3.5" />
          {/* Seat stays */}
          <line x1="40" y1="68" x2="80" y2="28" strokeWidth="2.5" />
          {/* Seat tube */}
          <line x1="98" y1="68" x2="80" y2="28" strokeWidth="3.5" />
          {/* Top tube */}
          <line x1="80" y1="28" x2="138" y2="33" strokeWidth="3" />
          {/* Down tube */}
          <line x1="98" y1="68" x2="138" y2="33" strokeWidth="3.5" />
          {/* Fork */}
          <line x1="138" y1="33" x2="160" y2="68" strokeWidth="3" />
          {/* Head tube */}
          <line x1="138" y1="33" x2="143" y2="18" strokeWidth="4" />
        </g>

        {/* Bottom bracket */}
        <circle cx="98" cy="68" r="5" fill="#003189" />

        {/* ── Saddle ────────────────────────────────── */}
        <path
          d="M66 26 Q80 21 94 26"
          stroke="#003189"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line
          x1="80"
          y1="28"
          x2="80"
          y2="25"
          stroke="#003189"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* ── Handlebar ─────────────────────────────── */}
        <line
          x1="143"
          y1="18"
          x2="147"
          y2="11"
          stroke="#003189"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M144 11 Q148 9 150 14"
          stroke="#003189"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* ── Rider (minimal silhouette) ─────────────── */}
        {/* Torso */}
        <line
          x1="100"
          y1="52"
          x2="122"
          y2="24"
          stroke="#003189"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Upper arm → handlebar */}
        <line
          x1="122"
          y1="24"
          x2="148"
          y2="28"
          stroke="#003189"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Head */}
        <circle cx="118" cy="18" r="8" fill="#003189" />
        {/* Helmet highlight */}
        <path d="M112 14 Q118 8 124 14" fill="#FFD200" stroke="none" />
        {/* Lower body */}
        <line
          x1="98"
          y1="68"
          x2="100"
          y2="52"
          stroke="#003189"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* ── Motion lines ──────────────────────────── */}
        <g
          className="ri-motion-lines"
          stroke="#003189"
          strokeLinecap="round"
          opacity="0.25"
        >
          <line x1="4" y1="55" x2="18" y2="55" strokeWidth="2" />
          <line x1="2" y1="63" x2="20" y2="63" strokeWidth="2.5" />
          <line x1="5" y1="71" x2="16" y2="71" strokeWidth="1.5" />
        </g>
      </svg>

      <p className="ri-bike-label">Analyse en cours</p>
      <span className="ri-bike-sub">Météo · Terrain · Sélection pneu</span>
    </div>
  );
}
