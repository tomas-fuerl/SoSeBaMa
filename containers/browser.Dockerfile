# Test-only runtime; never used by the application images.
# Keep this source equal to containers/browser-runtime.json (policy-tested).
FROM mcr.microsoft.com/playwright:v1.65.0-noble@sha256:6e3fb709361521eb27161606e6da6d2674e5e89fa16516cb37d6fdd91372273d AS prepared

# Fix APT and the seven medium PCRE2 findings; no browser/npm download.
RUN apt-get update \
    && apt-get install --yes --no-install-recommends --only-upgrade \
       apt=2.8.4ubuntu0.1 libapt-pkg6.0t64=2.8.4ubuntu0.1 \
       libpcre2-8-0=10.42-4ubuntu2.2 \
    && rm -rf /var/lib/apt/lists /var/cache/apt /root/.npm \
       /usr/lib/node_modules /usr/local/lib/node_modules \
    && rm -f /usr/bin/npm /usr/bin/npx /usr/bin/yarn /usr/bin/yarnpkg \
       /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/yarn /usr/local/bin/yarnpkg

# A FROM prepared runtime would still distribute deleted cache/log layers.
# Copy only its merged filesystem, not its history. Preserve OS package records
# and browser licences so scanners and attribution remain effective.
FROM scratch AS runtime
COPY --from=prepared / /
ENV PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
    LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
USER 1000:1000
WORKDIR /workspace
CMD ["node", "--version"]
