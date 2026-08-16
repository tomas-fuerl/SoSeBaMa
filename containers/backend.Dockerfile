FROM node:24.19.0-bookworm-slim@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03 AS dependencies

WORKDIR /workspace

RUN corepack enable && corepack prepare pnpm@11.18.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/observability/package.json packages/observability/package.json
COPY packages/runtime-health/package.json packages/runtime-health/package.json
COPY packages/testing/package.json packages/testing/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/validation/package.json packages/validation/package.json

RUN pnpm install --frozen-lockfile --ignore-scripts --strict-peer-dependencies

FROM dependencies AS build

COPY apps/api apps/api
COPY apps/worker apps/worker
COPY packages/config packages/config
COPY packages/contracts packages/contracts
COPY packages/observability packages/observability
COPY packages/runtime-health packages/runtime-health
COPY packages/typescript-config packages/typescript-config
COPY packages/validation packages/validation

# Every deployed workspace package is built here. `pnpm deploy` copies each
# dependency with its `exports` entry pointing at `dist`, so a package without a
# build produces a deployed artifact whose entry point does not exist, whether
# or not anything imports it at runtime.
RUN pnpm --filter @sobama/config run build \
    && pnpm --filter @sobama/contracts run build \
    && pnpm --filter @sobama/observability run build \
    && pnpm --filter @sobama/runtime-health run build \
    && pnpm --filter @sobama/api run build \
    && pnpm --filter @sobama/worker run build
RUN pnpm --filter @sobama/api deploy --prod --legacy /output/api
RUN pnpm --filter @sobama/worker deploy --prod --legacy /output/worker

FROM node:24.19.0-bookworm-slim@sha256:3638d9a6fe4030bd716be989438248074489337ba3275657f93595428be4fc03 AS runtime

ENV NODE_ENV=production

# Die Runtime startet ausschliesslich `node`; die Healthchecks nutzen ebenfalls
# nur `node -e`. npm und corepack werden nicht benoetigt, bringen aber ein
# eigenes gebuendeltes Abhaengigkeitsset mit. Das Entfernen reduziert sowohl die
# Angriffsflaeche als auch die Scanflaeche des Images.
RUN rm -rf \
    /usr/local/lib/node_modules/npm \
    /usr/local/lib/node_modules/corepack \
    /usr/local/bin/npm \
    /usr/local/bin/npx \
    /usr/local/bin/corepack

WORKDIR /opt/sobama

COPY --from=build --chown=node:node /output/api ./api
COPY --from=build --chown=node:node /output/worker ./worker

USER node

CMD ["node", "/opt/sobama/api/dist/container-main.js"]
