FROM node:24.18.1-bookworm-slim@sha256:235600a8101ab264e117b1768e925532262668dc9b581ef1dd7d96ced463b8e7 AS dependencies

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
COPY packages/typescript-config packages/typescript-config
COPY packages/validation packages/validation

RUN pnpm --filter @sobama/config run build \
    && pnpm --filter @sobama/observability run build \
    && pnpm --filter @sobama/api run build \
    && pnpm --filter @sobama/worker run build
RUN pnpm --filter @sobama/api deploy --prod --legacy /output/api
RUN pnpm --filter @sobama/worker deploy --prod --legacy /output/worker

FROM node:24.18.1-bookworm-slim@sha256:235600a8101ab264e117b1768e925532262668dc9b581ef1dd7d96ced463b8e7 AS runtime

ENV NODE_ENV=production

WORKDIR /opt/sobama

COPY --from=build --chown=node:node /output/api ./api
COPY --from=build --chown=node:node /output/worker ./worker

USER node

CMD ["node", "/opt/sobama/api/dist/container-main.js"]
