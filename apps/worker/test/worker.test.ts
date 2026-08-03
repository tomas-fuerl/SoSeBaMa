import { afterEach, describe, expect, it } from 'vitest';

import { startWorker, type StartedWorker } from '../src/start-worker.js';

describe('worker runtime', () => {
  let worker: StartedWorker | undefined;

  afterEach(async () => {
    await worker?.app.close();
    worker = undefined;
  });

  it('starts without jobs or database access, reports failure, and stops cleanly', async () => {
    worker = await startWorker({ environment: 'DEV' });
    expect(worker.environment).toBe('DEV');
    expect(worker.health.current()).toBe('ready');

    worker.health.markError();
    expect(worker.health.current()).toBe('error');

    await worker.app.close();
    expect(worker.health.current()).toBe('stopped');
    worker = undefined;
  });
});
