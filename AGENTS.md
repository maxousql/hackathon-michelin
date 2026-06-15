# Project instructions

- This repository is a pnpm and Turborepo monorepo.
- Keep application code organized by business feature.
- Shared API payloads belong in `packages/contracts`.
- Shared HTTP behavior belongs in `packages/api-client`.
- Run `pnpm lint`, `pnpm typecheck`, and `pnpm test` before considering work complete.

<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in
`apps/web/node_modules/next/dist/docs/`. Training data may be outdated; the
version-matched bundled docs are the source of truth.

<!-- END:nextjs-agent-rules -->
