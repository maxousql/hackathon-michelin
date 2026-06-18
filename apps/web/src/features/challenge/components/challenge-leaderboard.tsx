import type { ChallengeEntry } from '@michelin/contracts';

import { Badge } from '@/components/ui/badge';

import { formatDuration, formatGap } from '../utils/format';
import styles from './challenge-leaderboard.module.css';

interface ChallengeLeaderboardProps {
  entries: ChallengeEntry[];
  prizeLabel: string;
}

export function ChallengeLeaderboard({
  entries,
  prizeLabel,
}: ChallengeLeaderboardProps) {
  if (entries.length === 0) {
    return (
      <p className={styles.empty}>
        Aucun temps enregistré pour l’instant. Soyez le premier à lancer le
        segment&nbsp;!
      </p>
    );
  }

  const leaderSeconds = entries[0]?.time_seconds ?? 0;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col" className={styles.rankCol}>
            #
          </th>
          <th scope="col">Athlète</th>
          <th scope="col" className={styles.timeCol}>
            Temps
          </th>
          <th scope="col" className={styles.gapCol}>
            Écart
          </th>
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => {
          const isWinner = entry.rank === 1;
          return (
            <tr key={entry.rank} data-winner={isWinner ? '' : undefined}>
              <td className={styles.rankCol}>
                <span className={styles.rank}>{entry.rank}</span>
              </td>
              <td>
                <span className={styles.athlete}>{entry.athlete_name}</span>
                {entry.club && (
                  <span className={styles.club}>{entry.club}</span>
                )}
                {isWinner && (
                  <span className={styles.winnerBadge}>
                    <Badge tone="brand">🏆 Gagnant · {prizeLabel}</Badge>
                  </span>
                )}
              </td>
              <td className={styles.timeCol}>
                {formatDuration(entry.time_seconds)}
              </td>
              <td className={styles.gapCol}>
                {formatGap(entry.time_seconds, leaderSeconds)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
