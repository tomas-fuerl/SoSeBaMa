import { defineConfig } from '@playwright/test';

/**
 * Configuration for the Chromium smoke.
 *
 * The smoke runs inside the digest-pinned browser image described in
 * `docs/development/BROWSER-RUNTIME.md`, joined to the internal DEV application
 * network. It therefore reaches the gateway by service name and never through
 * the host.
 *
 * Every path this configuration writes to has to be outside the repository:
 * the working tree is mounted read-only so that a test run cannot modify the
 * sources it is verifying.
 */
const baseURL = process.env.SOSEBAMA_SMOKE_BASE_URL;

export default defineConfig({
  testDir: 'test',
  testMatch: 'browser-smoke.browser.ts',

  // The repository is mounted read-only; artefacts belong in the container tmpfs.
  outputDir: '/tmp/playwright-output',

  forbidOnly: true,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    ...(baseURL === undefined ? {} : { baseURL }),
    browserName: 'chromium',

    /**
     * No artefacts are produced, and that is a deliberate limitation.
     *
     * `outputDir` above is writable, so Playwright could write them — but the
     * smoke container is started with `--rm`, so anything written there is gone
     * before it could be inspected. Retaining artefacts would need an extra
     * writable mount and an upload step, which is not worth it for two
     * assertions whose failure messages already name the expected and the
     * received value.
     *
     * If this smoke ever turns flaky, that is the moment to add
     * `screenshot: 'only-on-failure'` together with a mounted output directory.
     */
    trace: 'off',
    screenshot: 'off',
    video: 'off',

    /**
     * Chromium's own sandbox is unavailable here and is switched off knowingly.
     *
     * The container drops every capability (`--cap-drop ALL`) and forbids
     * privilege escalation, which is exactly what the sandbox needs to build
     * its namespaces. Re-enabling it would mean handing the browser back the
     * privileges the container policy removes — a worse trade than disabling
     * it.
     *
     * The container is the isolation boundary instead: ephemeral, read-only
     * root filesystem, no capabilities, unprivileged user, on an `internal`
     * network without host access. The smoke loads only content this
     * repository produced.
     *
     * `--disable-dev-shm-usage` is required because the read-only root
     * filesystem leaves Chromium a `/dev/shm` too small for its default
     * allocation.
     */
    launchOptions: {
      chromiumSandbox: false,
      args: ['--disable-dev-shm-usage'],
    },
  },
});
