'use client';

interface ElevationProfileProps {
  profile: Array<{ distKm: number; eleM: number }>;
  hoveredIdx?: number | null;
  onHover?: (idx: number | null) => void;
}

export function ElevationProfile({
  profile,
  hoveredIdx,
  onHover,
}: ElevationProfileProps) {
  if (profile.length < 2) return null;

  const W = 660;
  const H = 96;
  const PAD = { top: 12, right: 8, bottom: 22, left: 42 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const eles = profile.map((p) => p.eleM);
  const minEle = Math.min(...eles);
  const maxEle = Math.max(...eles);
  const maxDist = profile[profile.length - 1]!.distKm;
  const range = maxEle - minEle || 1;

  const sx = (d: number) => PAD.left + (d / maxDist) * innerW;
  const sy = (e: number) => PAD.top + (1 - (e - minEle) / range) * innerH;

  const pathD =
    `M ${sx(profile[0]!.distKm)} ${sy(profile[0]!.eleM)} ` +
    profile
      .slice(1)
      .map((p) => `L ${sx(p.distKm)} ${sy(p.eleM)}`)
      .join(' ');

  const areaD =
    pathD +
    ` L ${sx(maxDist)} ${PAD.top + innerH} L ${sx(profile[0]!.distKm)} ${PAD.top + innerH} Z`;

  const yTicks = [minEle, Math.round((minEle + maxEle) / 2), maxEle];

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const distKm = ((svgX - PAD.left) / innerW) * maxDist;

    let closest = 0;
    let minDiff = Infinity;
    profile.forEach((p, i) => {
      const diff = Math.abs(p.distKm - distKm);
      if (diff < minDiff) {
        minDiff = diff;
        closest = i;
      }
    });
    onHover?.(closest);
  }

  const hovered =
    hoveredIdx !== null && hoveredIdx !== undefined
      ? profile[hoveredIdx]
      : null;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="ri-elevation-svg"
      role="img"
      aria-label="Profil d'élévation"
      style={{ cursor: onHover ? 'crosshair' : undefined }}
      onMouseMove={onHover ? handleMouseMove : undefined}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
    >
      <defs>
        <linearGradient id="elevFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#003189" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#003189" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="elevLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#003189" />
          <stop offset="100%" stopColor="#1a4aad" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((tick) => (
        <line
          key={tick}
          x1={PAD.left}
          y1={sy(tick)}
          x2={PAD.left + innerW}
          y2={sy(tick)}
          stroke="rgb(21 23 19 / 8%)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
      ))}

      {/* Area fill */}
      <path d={areaD} fill="url(#elevFill)" />
      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke="url(#elevLine)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Y-axis labels */}
      {yTicks.map((tick) => (
        <text
          key={tick}
          x={PAD.left - 5}
          y={sy(tick) + 3}
          textAnchor="end"
          fontSize="9"
          fontFamily="inherit"
          fill="#50544c"
        >
          {tick}m
        </text>
      ))}

      {/* X-axis labels */}
      <text
        x={PAD.left}
        y={H - 5}
        textAnchor="start"
        fontSize="9"
        fontFamily="inherit"
        fill="#50544c"
      >
        0 km
      </text>
      <text
        x={PAD.left + innerW}
        y={H - 5}
        textAnchor="end"
        fontSize="9"
        fontFamily="inherit"
        fill="#50544c"
      >
        {maxDist} km
      </text>

      {/* Axis line */}
      <line
        x1={PAD.left}
        y1={PAD.top + innerH}
        x2={PAD.left + innerW}
        y2={PAD.top + innerH}
        stroke="rgb(21 23 19 / 15%)"
        strokeWidth="1"
      />

      {/* ── Hover cursor ── */}
      {hovered && (
        <>
          {/* Vertical cursor line */}
          <line
            x1={sx(hovered.distKm)}
            y1={PAD.top}
            x2={sx(hovered.distKm)}
            y2={PAD.top + innerH}
            stroke="#003189"
            strokeWidth="1.5"
            strokeDasharray="3 2"
            opacity="0.7"
          />
          {/* Dot on the line */}
          <circle
            cx={sx(hovered.distKm)}
            cy={sy(hovered.eleM)}
            r="4.5"
            fill="#FFD200"
            stroke="#003189"
            strokeWidth="2"
          />
          {/* Tooltip box */}
          {(() => {
            const tipX = sx(hovered.distKm);
            const tipY = sy(hovered.eleM);
            const text = `${hovered.distKm} km · ${hovered.eleM} m`;
            const tipW = text.length * 5.5 + 12;
            const tipH = 18;
            const tipLeft = tipX + tipW / 2 + 6 > W - PAD.right;
            const tx = tipLeft ? tipX - tipW - 6 : tipX + 6;
            const ty = Math.max(PAD.top, tipY - tipH / 2);
            return (
              <>
                <rect
                  x={tx}
                  y={ty}
                  width={tipW}
                  height={tipH}
                  rx="3"
                  fill="#003189"
                  opacity="0.92"
                />
                <text
                  x={tx + tipW / 2}
                  y={ty + 12}
                  textAnchor="middle"
                  fontSize="9"
                  fontFamily="inherit"
                  fill="#FFD200"
                  fontWeight="700"
                >
                  {text}
                </text>
              </>
            );
          })()}
        </>
      )}
    </svg>
  );
}
