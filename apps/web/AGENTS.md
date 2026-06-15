<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in
`node_modules/next/dist/docs/`. Training data may be outdated; the
version-matched bundled docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# Web application conventions

- Use the App Router and React Server Components by default.
- Keep business code in `src/features/<feature>`.
- Keep route files thin and compose feature components from them.
- Consume the backend through `@michelin/api-client`.
