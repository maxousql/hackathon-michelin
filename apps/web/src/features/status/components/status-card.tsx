import type { StatusResponse } from '@michelin/contracts';

interface StatusCardProps {
  status: StatusResponse;
}

export function StatusCard({ status }: StatusCardProps) {
  const checkedAt = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(status.timestamp));

  return (
    <section className="status-card" aria-live="polite">
      <span className="status-dot" data-status={status.status} />
      <div>
        <p className="status-label">API opérationnelle</p>
        <p className="status-detail">
          {status.service}, vérifiée à {checkedAt}
        </p>
      </div>
      <span className="status-version">v{status.version}</span>
    </section>
  );
}
