import { ButtonLink } from '@/components/ui/button';

export default function ProductNotFound() {
  return (
    <div
      role="status"
      style={{
        display: 'flex',
        width:
          'min(var(--container-max), calc(100% - (var(--container-inline) * 2)))',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 'var(--space-4)',
        marginInline: 'auto',
        marginBlock: 'var(--space-12) var(--space-20)',
        padding: 'var(--space-12)',
        background: 'var(--surface-default)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-large)',
      }}
    >
      <h1
        style={{
          margin: 0,
          color: 'var(--brand-midnight)',
          fontSize: 'var(--type-h2)',
          fontWeight: 800,
        }}
      >
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
