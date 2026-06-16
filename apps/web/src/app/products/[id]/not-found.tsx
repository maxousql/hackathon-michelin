import { ButtonLink } from '@/components/ui/button';

export default function ProductNotFound() {
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 'var(--space-4)',
        padding: 'var(--space-12)',
        background: 'var(--surface-default)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-large)',
      }}
    >
      <h1 style={{ margin: 0, fontSize: 'var(--type-h2)', fontWeight: 800 }}>
        Ce pneu est introuvable
      </h1>
      <p
        style={{ margin: 0, color: 'var(--text-secondary)', maxWidth: '52ch' }}
      >
        La référence demandée n’existe pas ou n’est plus disponible au
        catalogue.
      </p>
      <ButtonLink href="/products" variant="outline">
        Retour au catalogue
      </ButtonLink>
    </div>
  );
}
