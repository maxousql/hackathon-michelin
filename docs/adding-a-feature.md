# Ajouter une feature

Avant de commencer, identifier les exigences fonctionnelles et techniques
concernées dans [`docs/specifications/README.md`](specifications/README.md).
Pour une interface, appliquer
[`docs/specifications/11-design-system-michelin.md`](specifications/11-design-system-michelin.md).
Le prompt de lancement peut partir de
[`docs/specifications/12-modele-prompt-ticket.md`](specifications/12-modele-prompt-ticket.md).
Pour un ticket déjà planifié, copier son prompt depuis
[`docs/specifications/prompts/README.md`](specifications/prompts/README.md).

1. Définir les entrées et sorties partagées dans
   `packages/contracts/src/<feature>`.
2. Exporter les nouvelles opérations depuis `packages/api-client`.
3. Créer le module NestJS sous `apps/api/src/features/<feature>`.
4. Ajouter la feature web sous `apps/web/src/features/<feature>`.
5. Ajouter la feature mobile sous `apps/mobile/src/features/<feature>`.
6. Tester les contrats, le client HTTP et les règles métier du backend.
7. Exécuter `pnpm lint`, `pnpm typecheck`, `pnpm test` et `pnpm build`.

Les DTO de transport doivent rester simples. Les règles métier appartiennent
aux services de la feature backend, pas aux contrôleurs ni aux composants.
