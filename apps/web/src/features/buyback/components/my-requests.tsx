import type { BuybackRequest } from '@michelin/contracts';

import { CONDITION_LABELS, STATUS_LABELS, formatEuros } from '../labels';
import styles from './my-requests.module.css';

interface MyRequestsProps {
  requests: BuybackRequest[];
}

export function MyRequests({ requests }: MyRequestsProps) {
  if (requests.length === 0) {
    return (
      <p className={styles.empty}>
        Vous n’avez pas encore de demande de reprise.
      </p>
    );
  }

  return (
    <ul className={styles.list}>
      {requests.map((request) => (
        <li key={request.id} className={styles.item}>
          <div>
            <p className={styles.name}>{request.product_label}</p>
            <p className={styles.meta}>
              {CONDITION_LABELS[request.condition]} · ×{request.quantity} ·{' '}
              {new Date(request.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div className={styles.right}>
            <span className={styles.amount}>
              {formatEuros(request.estimated_amount_eur)}
            </span>
            <span className={styles.status} data-status={request.status}>
              {STATUS_LABELS[request.status]}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
