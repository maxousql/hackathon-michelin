# Documentation technique backend NestJS

## Perimetre

Le backend vit dans `apps/api` et publie le package workspace
`@michelin/api`. Il expose l'API HTTP consommee par le frontend Next.js et
l'application Expo React Native.

- Framework : NestJS 11 avec TypeScript.
- Port local par defaut : `3001`.
- Prefixe HTTP global : `/api/v1`.
- Documentation OpenAPI : `/docs`.
- Validation d'entree : DTO NestJS + `class-validator` + `ValidationPipe`.
- Source de persistance principale : Supabase, appelee cote serveur avec la
  service role key.

## Demarrage

Depuis la racine du monorepo :

```bash
pnpm --filter @michelin/api dev
```

Commandes utiles :

```bash
pnpm --filter @michelin/api lint
pnpm --filter @michelin/api typecheck
pnpm --filter @michelin/api test
pnpm --filter @michelin/api build
pnpm lint
pnpm typecheck
pnpm test
```

## Runtime NestJS

`apps/api/src/main.ts` initialise l'application avec :

- `AppModule` comme module racine.
- `ConfigService<Environment>` pour lire une configuration validee par Zod.
- CORS active avec `credentials: true` et les origines de `CORS_ORIGIN`.
- `ValidationPipe` global avec `whitelist`, `forbidNonWhitelisted` et
  `transform`.
- Swagger configure avec le titre `Michelin Hackathon API`, la version
  `APP_VERSION` et l'authentification Bearer.
- `enableShutdownHooks()` pour arreter proprement l'application.

`apps/api/src/app.module.ts` rend `ConfigModule` global et importe les modules
metier :

```text
AdminModule
AuthModule
BikesModule
BuybackModule
ChallengeModule
ComparatorModule
ProductsModule
RaceIntelligenceModule
RetailersModule
SavedRacesModule
StatusModule
StravaModule
TirePassportsModule
```

## Configuration

La configuration est definie dans `apps/api/src/config/environment.ts`.

| Variable                    | Obligatoire | Role                                                |
| --------------------------- | ----------- | --------------------------------------------------- |
| `PORT`                      | Non         | Port HTTP, `3001` par defaut.                       |
| `NODE_ENV`                  | Non         | `development`, `test` ou `production`.              |
| `CORS_ORIGIN`               | Non         | Liste separee par virgules des origines autorisees. |
| `APP_VERSION`               | Non         | Version exposee dans Swagger.                       |
| `SUPABASE_URL`              | Oui         | URL du projet Supabase.                             |
| `SUPABASE_SERVICE_ROLE_KEY` | Oui         | Cle serveur utilisee par les services NestJS.       |
| `SUPABASE_JWT_SECRET`       | Oui         | Secret attendu par la configuration actuelle.       |
| `OPENWEATHER_API_KEY`       | Non         | Utilise par la recommandation Race Intelligence.    |
| `STRAVA_CLIENT_ID`          | Non         | OAuth Strava.                                       |
| `STRAVA_CLIENT_SECRET`      | Non         | OAuth Strava.                                       |

L'exemple local est dans `apps/api/.env.example`.

## Organisation par feature

Chaque domaine backend suit le modele :

```text
apps/api/src/features/<feature>/
  <feature>.module.ts
  <feature>.controller.ts
  <feature>.service.ts
  dto/
  *.spec.ts
```

Les controleurs restent minces : parsing HTTP, guards et appel du service. Les
regles metier et les appels externes restent dans les services.

## Endpoints

Tous les chemins ci-dessous sont relatifs a `/api/v1`.

| Feature           | Endpoints                                                                                                   | Acces                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Status            | `GET /status`                                                                                               | Public                                           |
| Auth              | `POST /auth/register`, `POST /auth/login`, `POST /auth/strava`, `GET /auth/me`                              | `GET /auth/me` requiert Bearer JWT               |
| Admin             | `GET /admin/users`, `PATCH /admin/users/:id`, `DELETE /admin/users/:id`                                     | Bearer JWT + profil admin                        |
| Products          | `GET /products`, `GET /products/facets`, `GET /products/:id`                                                | Public                                           |
| Retailers         | `GET /retailers`                                                                                            | Public                                           |
| Challenges        | `GET /challenges`                                                                                           | Public                                           |
| Comparator        | `POST /comparator/benchmark`                                                                                | Public                                           |
| Race Intelligence | `POST /race-intelligence/analyze`                                                                           | Public                                           |
| Buyback           | `POST /buyback/estimate`, `POST /buyback/requests`, `GET /buyback/requests/mine`                            | Bearer JWT                                       |
| Bikes             | `GET /bikes`, `POST /bikes`, `PATCH /bikes/:id`, `DELETE /bikes/:id`                                        | Bearer JWT                                       |
| Saved races       | `GET /saved-races`, `POST /saved-races`, `PATCH /saved-races/:id`, `DELETE /saved-races/:id`                | Bearer JWT                                       |
| Tire passports    | `GET /tire-passports`, `POST /tire-passports`, `PATCH /tire-passports/:id`, `DELETE /tire-passports/:id`    | Bearer JWT                                       |
| Strava            | `POST /strava/token`, `GET /strava/athlete`, `GET /strava/activities`, `GET /strava/activities/:id/streams` | Header `x-strava-token` pour les lectures Strava |

## Contrats et validation

Les payloads partages vivent dans `packages/contracts`. Le backend utilise des
DTO locaux pour la validation HTTP, tandis que le client commun
`packages/api-client` valide les reponses avec les schemas Zod partages.

Regle de maintenance :

1. Ajouter ou modifier le schema dans `packages/contracts/src/<feature>`.
2. Exporter le schema et les types depuis `packages/contracts/src/index.ts`.
3. Adapter `packages/api-client` si l'operation doit etre partagee par web et
   mobile.
4. Ajouter les DTO NestJS sous `apps/api/src/features/<feature>/dto`.
5. Tester le contrat, le client et le service metier.

## Authentification et autorisation

L'authentification applicative repose sur Supabase Auth.

- `AuthService` cree ou connecte les utilisateurs via Supabase.
- Les routes protegees utilisent `JwtAuthGuard`.
- `JwtStrategy` lit le token Bearer, verifie les JWT ES256 avec le JWKS du
  projet Supabase et recharge le profil applicatif.
- `CurrentUser` expose l'utilisateur authentifie aux controleurs.
- `AdminGuard` refuse l'acces si `profiles.is_admin` n'est pas vrai.

Les clients web et mobile ne doivent pas utiliser `SUPABASE_SERVICE_ROLE_KEY`.
Cette cle reste strictement cote backend.

## Donnees

Les services NestJS creent leur propre client Supabase avec
`SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`. Les migrations connues sont dans
`supabase/migrations`.

Tables gerees ou consommees :

- `profiles` : extension applicative de `auth.users`, avec `is_admin`.
- `buyback_requests` : demandes de reprise.
- `retailers` : revendeurs publics.
- `bikes` : velos utilisateur.
- `saved_races` : courses sauvegardees.
- `tire_passports` : passeports pneu utilisateur.
- `michelin_products` : catalogue produit lu par `ProductsService`.
- `challenges` : donnees du challenge Tour de France.

Les migrations activent la RLS sur les tables utilisateur, mais les services
backend utilisent la service role key pour centraliser les controles
d'autorisation dans NestJS.

## Integrations externes

- Strava : echange de code OAuth, lecture athlete, activites et streams.
- OpenWeather : enrichissement meteo de `RaceIntelligenceService` si la cle est
  disponible.
- Supabase : Auth, tables metier et JWKS.

## Build et deploiement

`apps/api/Dockerfile` construit uniquement `@michelin/api`, puis utilise
`pnpm deploy --prod /prod/api` pour produire une image Node 22 minimale qui
lance `node dist/main.js`.

Le `docker-compose.yml` expose l'API sur `3001` et verifie
`http://localhost:3001/api/v1/status`.

## Points de vigilance

- Toute nouvelle route protegee doit declarer `@UseGuards(JwtAuthGuard)` et
  documenter l'auth Bearer dans Swagger si elle est publique dans `/docs`.
- Les filtres catalogue doivent rester synchronises entre `ProductQueryDto`,
  `ProductFilters` et `serializeProductFilters`.
- Les erreurs attendues doivent utiliser les exceptions NestJS (`BadRequest`,
  `Unauthorized`, `Forbidden`, `NotFound`) pour conserver des statuts HTTP
  stables.
