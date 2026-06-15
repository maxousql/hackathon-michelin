# Hackathon Michelin

Monorepo TypeScript contenant un frontend Next.js, une API NestJS et une
application Expo React Native pour iOS et Android.

## Prérequis

- Node.js 22 ou supérieur
- pnpm 10.22
- Docker Desktop pour exécuter les conteneurs
- Xcode ou Android Studio pour les simulateurs mobiles locaux

## Installation

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env
pnpm dev
```

Services locaux :

- Web : http://localhost:3000
- API : http://localhost:3001/api/v1/status
- Swagger : http://localhost:3001/docs
- Expo : terminal Metro ouvert par `pnpm dev`

Pour démarrer une seule application :

```bash
pnpm --filter @michelin/web dev
pnpm --filter @michelin/api dev
pnpm --filter @michelin/mobile ios
pnpm --filter @michelin/mobile android
```

Sur Android Emulator, l'application utilise automatiquement
`http://10.0.2.2:3001/api/v1`. Sur un appareil physique, renseigner
`EXPO_PUBLIC_API_URL` avec l'adresse IP locale de la machine.

## Commandes

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Les commits suivent Conventional Commits. Husky vérifie le format des fichiers,
le lint et le message de commit.

## Docker

```bash
docker compose up --build
docker compose down
```

Le frontend contacte l'API via le réseau Docker avec `API_INTERNAL_URL`. Les
deux services possèdent un healthcheck.

## CI/CD

- `ci.yml` vérifie format, lint, types, tests, builds et images Docker.
- `cd.yml` publie les images web et API dans GitHub Container Registry depuis
  `main` et les tags `v*`.
- `mobile-release.yml` lance les builds EAS iOS et Android manuellement.

Pour activer EAS, créer un projet Expo, puis configurer :

- variable GitHub `EXPO_PROJECT_ID`
- secret GitHub `EXPO_TOKEN`

## Documentation

- [Architecture](docs/architecture.md)
- [Ajouter une feature](docs/adding-a-feature.md)
- [Guide officiel Next.js pour agents IA](https://nextjs.org/docs/app/guides/ai-agents)

Les agents doivent lire la documentation correspondant à la version installée
dans `apps/web/node_modules/next/dist/docs/` avant toute modification Next.js.
