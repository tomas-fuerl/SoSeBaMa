FROM node:24.21.0-bookworm-slim@sha256:0e0ff40c39bc087845bfb27465a0df4ea419520094bc35842ff83dd8cbe6f9b6 AS dependencies

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

FROM nginx:1.30.6-trixie@sha256:42c68eab6f7e22611786a9fe1d1c019e275c50185bd54b8f75dc2b9184322703 AS runtime

# Official base still contains two fixable HIGH findings in zlib1g.
RUN apt-get update \
    && apt-get install --yes --no-install-recommends --only-upgrade \
      zlib1g=1:1.3.dfsg+really1.3.1-1+deb13u1 \
    && apt-get purge --yes --auto-remove \
      nginx-module-acme nginx-module-geoip nginx-module-image-filter \
      nginx-module-njs nginx-module-xslt curl gettext-base \
    && rm -rf /var/lib/apt/lists/*

# Retain the existing Node health contract; do not add a new probe implementation.
COPY --from=dependencies /usr/local/bin/node /usr/local/bin/node
COPY containers/nginx /etc/nginx/app
COPY --from=build /workspace/apps/web/dist /srv

USER 1000:1000
EXPOSE 8080
STOPSIGNAL SIGQUIT
ENTRYPOINT ["nginx"]
CMD ["-c", "/etc/nginx/app/Web.conf", "-g", "daemon off;"]
