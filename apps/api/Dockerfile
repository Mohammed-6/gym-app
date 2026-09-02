# Build context is the monorepo root (see .dockerignore) — required so this stage can see
# packages/shared, the workspace lockfile, and pnpm-workspace.yaml.
# Build: docker build -f apps/api/Dockerfile -t gym-app-api .

FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@10.29.2 --activate
WORKDIR /app

# ---- install all workspace deps (cached unless a manifest changes) ----
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/api/package.json apps/api/package.json
RUN pnpm install --frozen-lockfile

# ---- build shared + api, then produce a pruned, self-contained deploy ----
FROM deps AS build
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN pnpm --filter @gym-app/shared build \
 && pnpm --filter @gym-app/api build \
 && pnpm deploy --filter=@gym-app/api --prod /prod/api

# ---- minimal runtime image ----
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /prod/api ./
EXPOSE 8080
CMD ["node", "dist/server.js"]
