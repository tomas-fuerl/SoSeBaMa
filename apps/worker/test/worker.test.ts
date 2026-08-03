import { describe, expect, it } from 'vitest';

import { startWorker } from '../src/start-worker.js';

describe('worker runtime', () => {
  it('starts without jobs or database access, reports failure, and stops cleanly', async () => {
    const worker = await startWorker({ environment: 'DEV' });
    expect(worker.environment).toBe('DEV');
    expect(worker.health.current()).toBe('ready');

    worker.health.markError();
    expect(worker.health.current()).toBe('error');

    await worker.app.close();
    expect(worker.health.current()).toBe('stopped');
  });
});
