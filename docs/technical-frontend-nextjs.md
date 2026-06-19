# Documentation technique frontend Next.js

## Perimetre

Le frontend web vit dans `apps/web` et publie le package workspace
`@michelin/web`.

- Framework : Next.js `16.2.9` avec App Router.
- React : `19.2.3`.
- Port local par defaut : `3000`.
- Build de production : `output: 'standalone'`.
- Donnees backend : `@michelin/api-client` et route handlers Next.js.

Conformement aux regles du projet, les docs Next.js locales suivantes ont ete
lues avant cette documentation :

- `apps/web/node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`
- `apps/web/node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`
- `apps/web/node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md`
- `apps/web/node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md`
- `apps/web/node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`
- `apps/web/node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`

## Demarrage

Depuis la racine du monorepo :

```bash
pnpm --filter @michelin/web dev
```

Commandes utiles :

```bash
pnpm --filter @michelin/web lint
pnpm --filter @michelin/web typecheck
pnpm --filter @michelin/web test
pnpm --filter @michelin/web build
pnpm lint
pnpm typecheck
pnpm test
```

## Organisation

```text
apps/web/src/app              Routes App Router, layouts, route handlers
apps/web/src/features         Code metier par domaine
apps/web/src/components       Composants UI et layout transverses
apps/web/src/styles           Reset et tokens globaux
apps/web/src/types            Declarations TypeScript locales
apps/web/public               Assets statiques servis par Next.js
```

Les fichiers `page.tsx` et `layout.tsx` restent fins et composent les
composants de `src/features/<feature>`. Les composants, actions et services
specifiques a un domaine restent dans la feature correspondante.

## Routing App Router

Les routes principales sont :

| Route                | Fichier                              | Role                        |
| -------------------- | ------------------------------------ | --------------------------- |
| `/`                  | `src/app/page.tsx`                   | Landing Michelin Race       |
| `/login`             | `src/app/login/page.tsx`             | Connexion                   |
| `/register`          | `src/app/register/page.tsx`          | Inscription                 |
| `/products`          | `src/app/products/page.tsx`          | Catalogue                   |
| `/products/[id]`     | `src/app/products/[id]/page.tsx`     | Detail catalogue            |
| `/produit/[id]`      | `src/app/produit/[id]/page.tsx`      | Alias detail produit        |
| `/comparateur`       | `src/app/comparateur/page.tsx`       | Comparateur pneus           |
| `/challenge`         | `src/app/challenge/page.tsx`         | Challenge Tour de France    |
| `/reprise`           | `src/app/reprise/page.tsx`           | Reprise / buyback           |
| `/race-intelligence` | `src/app/race-intelligence/page.tsx` | Recommandation course       |
| `/profil`            | `src/app/profil/page.tsx`            | Profil utilisateur          |
| `/admin/users`       | `src/app/admin/users/page.tsx`       | Administration utilisateurs |

Layouts specialises :

- `src/app/layout.tsx` : layout racine et styles globaux.
- `src/app/products/layout.tsx` : layout catalogue.
- `src/app/reprise/layout.tsx` : layout reprise.
- `src/app/admin/layout.tsx` : controle d'acces admin et layout admin.

## Server Components, Client Components et actions

Next.js App Router rend les pages et layouts en Server Components par defaut.
Le projet suit cette convention :

- Les pages chargent les donnees serveur quand c'est possible.
- Les composants interactifs declarent explicitement `"use client"`.
- Les mutations sont placees dans des Server Actions sous
  `src/features/<feature>/actions`.
- Les formulaires d'auth, d'admin, de reprise, de comparateur et de Race
  Intelligence passent par ces actions serveur.

Les Server Actions et les route handlers doivent toujours verifier
l'authentification eux-memes : d'apres la doc Next.js locale, les Server
Functions sont joignables par requete `POST`, pas uniquement via l'interface.

## Acces API

Le frontend ne parle pas directement a Supabase. Il consomme le backend NestJS
via `@michelin/api-client`, avec validation Zod des reponses.

Services serveur principaux :

- `features/status/services/get-status.ts`
- `features/products/services/products.api.ts`
- `features/retailers/services/retailers.api.ts`
- `features/challenge/services/challenges.api.ts`
- `features/auth/services/current-user.ts`
- `features/buyback/services/buyback.api.ts`
- `features/admin/services/admin.api.ts`

L'URL serveur par defaut est :

```text
API_INTERNAL_URL=http://localhost:3001/api/v1
```

En Docker, `API_INTERNAL_URL` vaut `http://api:3001/api/v1`.

## Route handlers Next.js

Les route handlers dans `src/app/api` jouent le role de Backend-for-Frontend
pour les cas ou le navigateur ne doit pas manipuler directement les tokens ou
quand il faut agreguer des donnees.

| Route handler                                       | Role                                              |
| --------------------------------------------------- | ------------------------------------------------- |
| `/api/bikes` et `/api/bikes/[id]`                   | Proxy authentifie vers les velos utilisateur      |
| `/api/saved-races` et `/api/saved-races/[id]`       | Proxy authentifie vers les courses sauvegardees   |
| `/api/tire-passports` et `/api/tire-passports/[id]` | Proxy authentifie vers les passeports pneu        |
| `/api/strava/auth`                                  | Redirection OAuth Strava                          |
| `/api/strava/callback`                              | Echange OAuth, cookies Strava et liaison Michelin |
| `/api/strava/athlete`                               | Lecture athlete Strava avec cookie `strava_at`    |
| `/api/strava/activities`                            | Lecture activites Strava                          |
| `/api/strava/activities/[id]/streams`               | Streams d'activite Strava                         |
| `/api/strava/routes`                                | Routes Strava                                     |
| `/api/strava/routes/[id]/streams`                   | Export GPX d'une route Strava                     |
| `/api/product-search`                               | Recherche courte catalogue                        |
| `/api/nearby-stores`                                | Recherche de magasins physiques                   |
| `/api/tire-recommendations`                         | Recommandations pour le profil                    |

Les route handlers utilisent les APIs Web `Request` / `Response` et
`NextResponse`, comme recommande par la doc Next.js locale.

## Authentification web

`features/auth/actions/auth.actions.ts` gere l'authentification par Server
Actions.

- `loginAction` et `registerAction` appellent l'API NestJS.
- Le token Michelin est stocke dans le cookie `auth_token`.
- Le cookie est `httpOnly`, `sameSite: 'lax'`, `path: '/'` et dure sept jours.
- `logoutAction` supprime `auth_token`.
- `stravaLogoutAction` supprime `strava_at`, `strava_profile` et `auth_token`.

`src/proxy.ts` protege les pages sur les requetes `GET`. Il laisse passer les
Server Actions (`POST`) et exclut `/api`, `_next/static`, `_next/image` et les
assets images. Sans `auth_token`, seules la landing, les pages d'auth et les
routes ouvertes du catalogue/comparateur restent accessibles.

## Styling et assets

- Styles globaux : `src/app/globals.css`, `src/styles/reset.css`,
  `src/styles/tokens.css`.
- Styles de composants : CSS Modules colocates avec les composants ou pages.
- Assets publics : `apps/web/public`.
- `next.config.mjs` autorise les images distantes CloudFront et transpile les
  packages workspace `@michelin/api-client` et `@michelin/contracts`.

## Configuration

`apps/web/.env.example` documente :

| Variable               | Role                                                       |
| ---------------------- | ---------------------------------------------------------- |
| `API_INTERNAL_URL`     | URL serveur vers l'API NestJS.                             |
| `NEXT_PUBLIC_API_URL`  | URL publique si une lecture client directe est necessaire. |
| `STRAVA_CLIENT_ID`     | OAuth Strava web.                                          |
| `STRAVA_CLIENT_SECRET` | Secret OAuth Strava cote serveur.                          |
| `STRAVA_CALLBACK_URL`  | Callback OAuth web.                                        |

## Tests et qualite

- Tests unitaires avec Vitest.
- ESLint via `@michelin/config-eslint`.
- TypeScript via `@michelin/config-typescript`.
- Validation globale attendue avant merge : `pnpm lint`, `pnpm typecheck`,
  `pnpm test`.

## Ajouter une feature web

1. Ajouter ou modifier les contrats dans `packages/contracts`.
2. Ajouter l'appel partage dans `packages/api-client` si web et mobile en ont
   besoin.
3. Creer `apps/web/src/features/<feature>`.
4. Garder `src/app/<route>/page.tsx` fin et composer la feature.
5. Utiliser une Server Action pour les mutations serveur.
6. Utiliser un route handler uniquement pour un besoin BFF, token serveur ou
   integration externe.
7. Couvrir les fonctions metier ou services critiques avec Vitest.

## Points de vigilance

- Ne pas exposer `API_INTERNAL_URL`, les secrets Strava ou les tokens Michelin
  dans des Client Components.
- Ne pas mettre `"use client"` sur une page ou un layout complet sans besoin
  fort : cela augmente le bundle navigateur.
- Les route handlers `GET` ne sont pas caches par defaut ; toute strategie de
  cache doit etre explicite.
- Les Server Actions doivent verifier les droits, meme si `src/proxy.ts`
  protege deja la navigation.
