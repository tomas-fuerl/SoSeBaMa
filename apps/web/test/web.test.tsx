import { createServer, type ViteDevServer } from 'vite';
import { renderToStaticMarkup } from 'react-dom/server';
import type { AddressInfo } from 'node:net';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

import { App } from '../src/app.js';

describe('web runtime', () => {
  let server: ViteDevServer | undefined;

  afterEach(async () => {
    await server?.close();
    server = undefined;
  });

  it('contains only the technical start view and no navigation', () => {
    const markup = renderToStaticMarkup(<App />);
    expect(markup).toContain('data-runtime-health="ready"');
    expect(markup).not.toContain('<nav');
  });

  it('starts, serves the application and health, and stops cleanly', async () => {
    server = await createServer({
      logLevel: 'silent',
      root: fileURLToPath(new URL('../', import.meta.url)),
      // Bind and fetch the same address family explicitly. Node 24.21 can
      // resolve `localhost` to IPv4 while Vite listens on IPv6, which turns
      // this runtime assertion into an address-selection test.
      server: { host: '127.0.0.1', port: 0 },
    });
    await server.listen();

    const address = server.httpServer?.address() as AddressInfo | null;
    expect(address).not.toBeNull();
    const baseUrl = `http://127.0.0.1:${address?.port ?? 0}`;
    const healthUrl = `${baseUrl}/health.json`;

    const pageResponse = await fetch(`${baseUrl}/`);
    expect(pageResponse.status).toBe(200);
    const pageMarkup = await pageResponse.text();
    expect(pageMarkup).toContain('src="/src/main.tsx"');
    expect(pageMarkup).toContain('<div id="root"></div>');

    const response = await fetch(healthUrl);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ role: 'web', status: 'ready' });

    await server.close();
    server = undefined;
    await expect(fetch(healthUrl)).rejects.toThrow();
  });
});
