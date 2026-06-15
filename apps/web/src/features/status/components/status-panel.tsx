import { StatusCard } from './status-card';
import { getStatus } from '../services/get-status';

export async function StatusPanel() {
  const status = await getStatus().catch(() => null);

  if (status) {
    return <StatusCard status={status} />;
  }

  return (
    <section className="status-card" aria-live="polite">
      <span className="status-dot" data-status="offline" />
      <div>
        <p className="status-label">API indisponible</p>
        <p className="status-detail">
          Lancez le backend NestJS ou vérifiez API_INTERNAL_URL.
        </p>
      </div>
      <span className="status-version">hors ligne</span>
    </section>
  );
}
