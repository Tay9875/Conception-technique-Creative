FROM node:20-alpine AS prod-deps

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN pnpm install --frozen-lockfile --filter server --prod

FROM node:20-alpine AS build

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN pnpm install --frozen-lockfile --filter server

COPY server ./server
RUN pnpm --filter server build
RUN test -f /app/server/dist/index.js

FROM node:20-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app/server

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/server/node_modules ./node_modules
COPY server/package.json ./package.json
COPY --from=build /app/server/dist ./dist
COPY server/migrations ./migrations
RUN test -f /app/server/dist/index.js

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]
