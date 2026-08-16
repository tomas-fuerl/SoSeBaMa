import { expect, test, type ConsoleMessage, type Request } from '@playwright/test';

/**
 * Chromium smoke of the SPA delivery through Caddy.
 *
 * This is the G3 share that no other check covers. `container:smoke` verifies
 * three health paths through the host ingress; none of them proves that the
 * single-page application is actually served, that its bundle loads, or that it
 * renders. A broken build would keep every health path green.
 *
 * The file is named `.browser.ts` on purpose: Vitest collects `.test.` and
 * `.spec.` files across the repository, and a Playwright file caught by
 * `pnpm test` would fail there.
 */

/** Console entries a passing run must not produce. */
const failingConsoleTypes = new Set(['error']);

interface PageProblems {
  consoleErrors: string[];
  failedRequests: string[];
}

/**
 * Records browser-side failures that never surface as an HTTP status.
 *
 * A page can answer 200 for every request and still be broken: a bundle that
 * throws on evaluation reports no failing request at all.
 */
function watchForProblems(page: import('@playwright/test').Page): PageProblems {
  const problems: PageProblems = { consoleErrors: [], failedRequests: [] };

  page.on('console', (message: ConsoleMessage) => {
    if (failingConsoleTypes.has(message.type())) {
      problems.consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error: Error) => {
    problems.consoleErrors.push(`pageerror: ${error.message}`);
  });
  page.on('requestfailed', (request: Request) => {
    problems.failedRequests.push(`${request.method()} ${request.url()}`);
  });

  return problems;
}

test('serves the application shell at the site root', async ({ page }) => {
  const problems = watchForProblems(page);

  const response = await page.goto('/');
  expect(response?.status(), 'HTTP-Status von /').toBe(200);

  // The heading proves the bundle evaluated and React rendered; a served but
  // broken bundle would deliver the HTML shell without ever reaching this.
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('SoSeBaMa');
  await expect(page.locator('[data-runtime-health="ready"]')).toBeVisible();

  expect(problems.consoleErrors, 'Konsolenfehler').toEqual([]);
  expect(problems.failedRequests, 'fehlgeschlagene Requests').toEqual([]);
});

test('falls back to the application shell on an unknown route', async ({ page }) => {
  // `try_files {path} /index.html` in Web.Caddyfile is what makes client-side
  // routing work. Without this assertion the directive could be dropped and
  // every health path would stay green.
  const problems = watchForProblems(page);

  const response = await page.goto('/eine-route-die-es-nicht-gibt');
  expect(response?.status(), 'HTTP-Status einer unbekannten Route').toBe(200);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('SoSeBaMa');

  expect(problems.consoleErrors, 'Konsolenfehler').toEqual([]);
  expect(problems.failedRequests, 'fehlgeschlagene Requests').toEqual([]);
});
