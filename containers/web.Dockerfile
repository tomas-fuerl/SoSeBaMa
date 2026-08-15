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
COPY packages/testing/package.json packages/testing/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
COPY packages/validation/package.json packages/validation/package.json

RUN pnpm install --frozen-lockfile --ignore-scripts --strict-peer-dependencies

FROM dependencies AS build

COPY apps/web apps/web
COPY packages/typescript-config packages/typescript-config

RUN pnpm --filter @sobama/web run build

FROM caddy:2.11.4@sha256:df7f1c2fb114453b951de51a98efc010db1655a92c2e86be6706714e2417a78d AS caddy

FROM node:24.18.1-bookworm-slim@sha256:235600a8101ab264e117b1768e925532262668dc9b581ef1dd7d96ced463b8e7 AS runtime

ENV XDG_CONFIG_HOME=/tmp/caddy-config
ENV XDG_DATA_HOME=/tmp/caddy-data

COPY --from=caddy /usr/bin/caddy /tmp/caddy-with-file-capability
RUN cp /tmp/caddy-with-file-capability /usr/bin/caddy \
    && rm /tmp/caddy-with-file-capability \
    && chmod 0755 /usr/bin/caddy
COPY --chown=node:node containers/caddy /etc/caddy
COPY --from=build --chown=node:node /workspace/apps/web/dist /srv

USER node

EXPOSE 8080

ENTRYPOINT ["caddy"]
CMD ["run", "--config", "/etc/caddy/Web.Caddyfile", "--adapter", "caddyfile"]
