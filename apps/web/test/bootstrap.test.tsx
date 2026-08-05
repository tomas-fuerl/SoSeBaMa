// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from 'vitest';

describe('web bootstrap', () => {
  afterEach(() => {
    document.documentElement.innerHTML = '<head></head><body></body>';
  });

  it('mounts the React application into the served root element', async () => {
    document.body.innerHTML = '<div id="root"></div>';

    await import('../src/main.js');

    await vi.waitFor(() => {
      expect(document.querySelector('[data-runtime-health="ready"]')?.textContent).toContain(
        'Der technische Webstart ist bereit.',
      );
    });
  });
});
