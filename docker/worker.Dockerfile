FROM node:20-alpine AS base
RUN npm install -g pnpm@9

WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY turbo.json tsconfig.base.json ./

COPY packages/config/package.json packages/config/
COPY packages/logger/package.json packages/logger/
COPY packages/shared/package.json packages/shared/
COPY packages/database/package.json packages/database/
COPY packages/redis/package.json packages/redis/
COPY apps/worker/package.json apps/worker/

RUN echo "node-linker=hoisted" >> .npmrc && pnpm install --frozen-lockfile

COPY packages/ packages/
COPY apps/worker/ apps/worker/

RUN pnpm --filter @tradepulse/config build \
 && pnpm --filter @tradepulse/logger build \
 && pnpm --filter @tradepulse/shared build \
 && pnpm --filter @tradepulse/database build \
 && pnpm --filter @tradepulse/redis build \
 && pnpm --filter @tradepulse/worker build

CMD ["node", "apps/worker/dist/index.js"]
