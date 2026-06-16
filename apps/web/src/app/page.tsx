import { Suspense } from 'react';

import { LogoutButton } from '@/features/auth/components/logout-button';
import { StatusPanel } from '@/features/status/components/status-panel';
import { StatusSkeleton } from '@/features/status/components/status-skeleton';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero">
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '32px',
          }}
        >
          <LogoutButton />
        </div>
        <p className="eyebrow">Hackathon Michelin</p>
        <h1>Un socle commun, du web au mobile.</h1>
        <p className="hero-copy">
          Next.js et React Native consomment la même API NestJS à travers des
          contrats TypeScript partagés.
        </p>
      </section>

      <Suspense fallback={<StatusSkeleton />}>
        <StatusPanel />
      </Suspense>

      <section className="stack-grid" aria-label="Technologies du projet">
        <article>
          <span>01</span>
          <h2>Next.js</h2>
          <p>App Router, Server Components et rendu conteneurisé.</p>
        </article>
        <article>
          <span>02</span>
          <h2>NestJS</h2>
          <p>
            API versionnée, documentée par Swagger et structurée par feature.
          </p>
        </article>
        <article>
          <span>03</span>
          <h2>React Native</h2>
          <p>Application Expo prête pour les builds iOS et Android.</p>
        </article>
      </section>
    </main>
  );
}
