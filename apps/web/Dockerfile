# Build context is the monorepo root (see .dockerignore).
# NEXT_PUBLIC_API_URL is inlined into the client JS bundle at build time (Next.js behavior),
# so it must be supplied as a build-arg, not a runtime env var.
# Build: docker build -f apps/web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://... -t gym-app-web .

FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@10.29.2 --activate
WORKDIR /app

# ---- install all workspace deps (cached unless a manifest changes) ----
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY packages/shared/package.json packages/shared/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile

# ---- build shared + web ----
FROM deps AS build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
COPY packages/shared packages/shared
COPY apps/web apps/web
RUN pnpm --filter @gym-app/shared build \
 && pnpm --filter @gym-app/web build

# ---- minimal runtime image (Next.js standalone output) ----
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build /app/apps/web/public ./apps/web/public
EXPOSE 8080
ENV PORT=8080
# Cloud Run requires the server to listen on all interfaces, not just localhost.
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/web/server.js"]
