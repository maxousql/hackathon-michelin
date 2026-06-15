FROM node:26-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
WORKDIR /app

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/api-client/package.json packages/api-client/package.json
COPY packages/config-eslint/package.json packages/config-eslint/package.json
COPY packages/config-typescript/package.json packages/config-typescript/package.json
COPY packages/contracts/package.json packages/contracts/package.json

RUN pnpm install --frozen-lockfile

FROM dependencies AS builder

COPY . .

RUN pnpm --filter @michelin/api build
RUN pnpm --filter @michelin/api deploy --prod /prod/api

FROM node:26-bookworm-slim AS runner

ENV NODE_ENV=production
ENV PORT=3001

WORKDIR /app
COPY --from=builder --chown=node:node /prod/api ./

USER node
EXPOSE 3001

CMD ["node", "dist/main.js"]
