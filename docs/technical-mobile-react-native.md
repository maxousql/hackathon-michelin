# Documentation technique mobile React Native

## Perimetre

L'application mobile vit dans `apps/mobile` et publie le package workspace
`@michelin/mobile`.

- Runtime : Expo SDK 54, React Native `0.81.5`.
- React : `19.1.0`.
- Navigation : React Navigation 7.
- Persistance securisee : `expo-secure-store`.
- API backend : `@michelin/api-client`.
- Builds cloud : EAS.

L'application cible iOS et Android en workflow Expo managed.

## Demarrage

Depuis la racine du monorepo :

```bash
pnpm --filter @michelin/mobile dev
```

Commandes utiles :

```bash
pnpm --filter @michelin/mobile ios
pnpm --filter @michelin/mobile android
pnpm --filter @michelin/mobile lint
pnpm --filter @michelin/mobile typecheck
pnpm --filter @michelin/mobile test
pnpm --filter @michelin/mobile build
pnpm lint
pnpm typecheck
pnpm test
```

Note : les scripts `ios` et `android` actuels contiennent `expo start--ios` et
`expo start--android`. Si ces commandes echouent localement, utiliser
`pnpm --filter @michelin/mobile expo start --ios` ou corriger les scripts.

## Entrees applicatives

```text
apps/mobile/index.ts       Enregistre le composant racine avec Expo
apps/mobile/App.tsx        Providers globaux et navigation
```

`App.tsx` compose :

- `SafeAreaProvider`
- `AuthProvider`
- `NavigationContainer`
- `RootNavigator`

## Organisation

```text
apps/mobile/src/components       UI transverse
apps/mobile/src/config           Configuration runtime
apps/mobile/src/features         Code metier par domaine
apps/mobile/src/navigation       Stacks, tabs et types de navigation
apps/mobile/src/test-utils       Helpers de test
apps/mobile/src/theme            Tokens visuels
apps/mobile/src/types            Declarations TypeScript
apps/mobile/src/utils            Utilitaires transverses
apps/mobile/assets               Assets natifs Expo
```

Les features suivent le meme decoupage que le web et le backend :

```text
src/features/<feature>/
  api.ts
  components/
  hooks/
  screens/
  utils/
```

Seuls les dossiers utiles a la feature sont crees.

## Navigation

`src/navigation/root-navigator.tsx` definit :

- `RootStack` avec `Tabs` et `Auth`.
- `AuthStack` avec `Login` et `Register`.
- `AppTabNavigator` avec les onglets `Home`, `Catalog`, `Race`, `Challenge`,
  `Comparateur`, `Reprise`, `Admin` et `Profile`.
- `CatalogStack` imbrique pour `CatalogMain` et `ProductDetail`.
- `FloatingTabBar` comme tab bar personnalisee.

Les types de routes sont centralises dans `src/navigation/types.ts`.

## Authentification

`src/features/auth/context/auth-context.tsx` centralise l'etat utilisateur.

- `auth_token` : token Michelin JWT.
- `strava_token` : token Strava brut.
- `strava_photo_url` : photo Strava affichee cote profil.

Ces valeurs sont stockees dans `expo-secure-store`.

Au lancement, `AuthProvider` :

1. lit les tokens dans SecureStore ;
2. appelle `client.getMe(token)` si un token Michelin existe ;
3. supprime le token Michelin s'il n'est plus valide ;
4. expose `login`, `register`, `loginWithStrava`, `updateStravaPhoto` et
   `logout`.

L'ecran d'auth est presente dans une stack modale et se ferme automatiquement
quand un token est pose.

## Acces API

L'application ne consomme pas Supabase directement. Les features creent des
clients via `createApiClient({ baseUrl: apiBaseUrl })`.

`src/config/api.ts` calcule l'URL par defaut :

- Android Emulator : `http://10.0.2.2:3001/api/v1`.
- iOS Simulator : `http://localhost:3001/api/v1`.
- Appareil physique : `EXPO_PUBLIC_API_URL` doit pointer vers l'IP locale de
  la machine qui lance l'API.

La meme logique existe pour le web via `webBaseUrl`.

Clients de feature :

- `features/products/api.ts`
- `features/challenge/api.ts`
- `features/comparator/api.ts`
- `features/buyback/api.ts`
- `features/profile/api.ts`
- `features/race-intelligence/api.ts`
- `features/status/hooks/use-status.ts`

Les reponses sont validees par `@michelin/api-client` avec les schemas Zod de
`@michelin/contracts`.

## Features principales

| Feature             | Role                                            |
| ------------------- | ----------------------------------------------- |
| `landing`           | Experience d'accueil mobile                     |
| `home`              | Ecran d'accueil post-lancement                  |
| `auth`              | Connexion, inscription, session et Strava       |
| `products`          | Catalogue, filtres, detail produit              |
| `race-intelligence` | Analyse GPX/parcours, recommandations et Strava |
| `challenge`         | Challenge Tour de France                        |
| `comparator`        | Comparaison de pneus                            |
| `buyback`           | Estimation et demande de reprise                |
| `profile`           | Profil utilisateur                              |
| `admin`             | Gestion utilisateurs admin                      |
| `status`            | Verification de disponibilite API               |

## Strava mobile

`features/auth/hooks/use-strava-login.ts` lance le flux OAuth avec
`expo-web-browser`. Le callback utilise le scheme Expo `michelin-race://`.

Le hook recupere un code Strava, l'echange contre un token, puis appelle
`loginWithStrava` pour creer ou retrouver le compte Michelin via l'API NestJS.

Point de vigilance : le hook contient actuellement un `STRAVA_CLIENT_SECRET`
hardcode. Pour une livraison production, l'echange de code devrait passer par
le backend ou par un secret injecte de maniere securisee.

## Theme et composants

Les tokens visuels sont centralises dans `src/theme` :

- `colors.ts`
- `spacing.ts`
- `radius.ts`
- `shadows.ts`
- `typography.ts`

Composants transverses :

- `AppButton`
- `AppTextInput`
- `AuthGate`
- `ScreenWrapper`

Les composants de feature restent dans la feature pour eviter de partager des
abstractions trop tot.

## Configuration Expo

`apps/mobile/app.config.ts` configure :

- Nom : `Michelin Hackathon`.
- Scheme deep link : `michelin-race`.
- iOS bundle id : `com.esgi.hackathonmichelin`.
- Android package : `com.esgi.hackathonmichelin`.
- Splash screen : `assets/logo-michelin-race.png`.
- `EXPO_PROJECT_ID` injecte dans `extra.eas.projectId` si present.

`apps/mobile/eas.json` definit les profils :

- `development` : development client, distribution interne.
- `preview` : distribution interne.
- `production` : auto-increment.

## Tests et qualite

- Tests avec Jest + `jest-expo`.
- Tests React Native avec `@testing-library/react-native`.
- Helpers dans `src/test-utils`.
- ESLint et TypeScript partagent les configs workspace.

La validation attendue avant merge reste :

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Ajouter une feature mobile

1. Ajouter les contrats dans `packages/contracts`.
2. Ajouter l'appel dans `packages/api-client` si la feature consomme le backend.
3. Creer `apps/mobile/src/features/<feature>`.
4. Ajouter un `api.ts` local si plusieurs ecrans/hooks partagent le meme client.
5. Ajouter les ecrans dans la navigation typee.
6. Stocker les secrets et tokens dans SecureStore ou cote serveur, jamais dans
   un module UI.
7. Tester les hooks, presenters et composants reutilisables.

## Points de vigilance

- Les appareils physiques ne peuvent pas joindre `localhost` sur la machine de
  developpement ; utiliser `EXPO_PUBLIC_API_URL`.
- Les appels directs a Strava depuis mobile exposent plus de surface qu'un
  echange cote backend.
- Les types de navigation doivent etre modifies avant d'ajouter un nouvel ecran
  pour conserver les props typees.
- Les modules natifs Expo doivent rester compatibles avec le SDK declare dans
  `package.json`.
