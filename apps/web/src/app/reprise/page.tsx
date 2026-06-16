import { MyRequests } from '@/features/buyback/components/my-requests';
import { RepriseForm } from '@/features/buyback/components/reprise-form';
import { fetchMyBuybackRequests } from '@/features/buyback/services/buyback.api';

import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function ReprisePage() {
  const requests = await fetchMyBuybackRequests();

  return (
    <div className={styles.page}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>Seconde vie</p>
        <h1 className={styles.title}>Reprise MICHELIN</h1>
        <p className={styles.lede}>
          Donnez une seconde vie à vos pneus. MICHELIN vous les reprend pour les
          remettre à neuf ou les recycler — et vous récompense.
        </p>
      </header>

      <RepriseForm />

      <section className={styles.requests}>
        <h2 className={styles.sectionTitle}>Mes demandes</h2>
        <MyRequests requests={requests} />
      </section>
    </div>
  );
}
