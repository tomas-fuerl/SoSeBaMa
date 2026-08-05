import { afterEach, describe, expect, it } from 'vitest';

import { startApi, type StartedApi } from '../src/start-api.js';

describe('API runtime', () => {
  let startedApi: StartedApi | undefined;

  afterEach(async () => {
    await startedApi?.app.close();
    startedApi = undefined;
  });

  it('starts, exposes distinct health states, and stops cleanly', async () => {
    startedApi = await startApi({ environment: 'DEV', host: 'localhost', port: 0 });
    const baseUrl = `http://localhost:${startedApi.port}`;

    const startup = await fetch(`${baseUrl}/health/startup`);
    expect(startup.status).toBe(200);
    await expect(startup.json()).resolves.toEqual({ role: 'api', status: 'started' });

    const ready = await fetch(`${baseUrl}/health/ready`);
    expect(ready.status).toBe(200);
    await expect(ready.json()).resolves.toEqual({ role: 'api', status: 'ready' });

    startedApi.health.markNotReady();
    const notReady = await fetch(`${baseUrl}/health/ready`);
    expect(notReady.status).toBe(503);
    await expect(notReady.json()).resolves.toEqual({ role: 'api', status: 'not-ready' });

    startedApi.health.markError();
    const failed = await fetch(`${baseUrl}/health/live`);
    expect(failed.status).toBe(503);
    await expect(failed.json()).resolves.toEqual({ role: 'api', status: 'error' });

    await startedApi.app.close();
    expect(startedApi.health.current()).toBe('stopped');
    await expect(fetch(`${baseUrl}/health/live`)).rejects.toThrow();
    startedApi = undefined;
  });
});
