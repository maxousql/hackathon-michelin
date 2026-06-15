# Architecture

## Vue générale

Le dépôt est un monorepo pnpm piloté par Turborepo.

```text
apps/web      Next.js, interface web
apps/api      NestJS, API HTTP
apps/mobile   Expo React Native, iOS et Android
packages/contracts    Schémas Zod et types partagés
packages/api-client   Client HTTP partagé
packages/config-*     Configurations techniques communes
```

Le flux applicatif est volontairement unidirectionnel :

```text
NestJS API -> API client -> Next.js
                         -> React Native
```

Les interfaces ne partagent pas leurs composants visuels. Elles partagent les
contrats métier et l'accès réseau, qui constituent la frontière stable entre
les plateformes.

## Organisation par feature

Chaque domaine fonctionnel possède un dossier dédié :

```text
features/<feature>/
  components/
  hooks/
  services/
  dto/
```

Seuls les sous-dossiers utiles doivent être créés. Une feature backend expose
son module NestJS. Les applications clientes regroupent les composants,
services et hooks propres à la même capacité métier.

## Décisions initiales

- App Router et Server Components par défaut pour le web.
- Expo managed workflow pour éviter de maintenir deux projets natifs trop tôt.
- Contrats validés à l'exécution avec Zod.
- Swagger généré par NestJS sur `/docs`.
- Pas de base de données tant qu'un besoin de persistance n'est pas défini.
- Images web et API publiées dans GitHub Container Registry.
