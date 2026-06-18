/** Durée en secondes → « m:ss » (ex. 318 → « 5:18 »). */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** Écart au leader, en secondes → « +6 s » (chaîne vide pour le leader). */
export function formatGap(seconds: number, leaderSeconds: number): string {
  const gap = seconds - leaderSeconds;
  return gap > 0 ? `+${gap} s` : '';
}

/** Date ISO → « 17 juil. 2026 ». */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
