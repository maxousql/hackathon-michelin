import styles from './strava-segment-embed.module.css';

interface StravaSegmentEmbedProps {
  segmentId: string;
}

/**
 * Embed du segment Strava via l'iframe officielle `/segments/{id}/embed`.
 * On évite le script `embed.js` (peu fiable hors production, erreur « 4EC ») au
 * profit de l'iframe directe. Le lien « Voir le segment sur Strava » de la
 * fiche reste le repli si l'iframe ne charge pas.
 */
export function StravaSegmentEmbed({ segmentId }: StravaSegmentEmbedProps) {
  return (
    <iframe
      title="Aperçu du segment Strava"
      className={styles.frame}
      src={`https://www.strava.com/segments/${segmentId}/embed`}
      loading="lazy"
      allowFullScreen
    />
  );
}
