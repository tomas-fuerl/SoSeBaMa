import { createServer, type AddressInfo } from 'node:net';

import { afterEach, describe, expect, it } from 'vitest';

import { startWorker, type StartedWorker } from '../src/start-worker.js';

async function findFreeLoopbackPort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address() as AddressInfo | null;
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  if (!address) {
    throw new Error('Cannot allocate a loopback port for the worker test.');
  }
  return address.port;
}

async function startTestWorker(port: number): Promise<StartedWorker> {
  return await startWorker({ environment: 'DEV', health: { host: '127.0.0.1', port } });
}

describe('worker runtime', () => {
  let worker: StartedWorker | undefined;

  afterEach(async () => {
    await worker?.app.close();
    worker = undefined;
  });

  it('starts without jobs or database access, reports failure, and stops cleanly', async () => {
    worker = await startTestWorker(await findFreeLoopbackPort());
    expect(worker.environment).toBe('DEV');
    expect(worker.health.current()).toBe('ready');

    worker.health.markNotReady();
    expect(worker.health.current()).toBe('not-ready');

    worker.health.markError();
    expect(worker.health.current()).toBe('error');

    await worker.app.close();
    expect(worker.health.current()).toBe('stopped');
    worker = undefined;
  });

  it('answers the three health probes and reflects the lifecycle state', async () => {
    const port = await findFreeLoopbackPort();
    worker = await startTestWorker(port);
    const probe = async (path: string) => {
      const response = await fetch(`http://127.0.0.1:${port}${path}`);
      return { body: (await response.json()) as unknown, status: response.status };
    };

    expect(await probe('/health/startup')).toEqual({
      body: { role: 'worker', status: 'started' },
      status: 200,
    });
    expect(await probe('/health/live')).toEqual({
      body: { role: 'worker', status: 'alive' },
      status: 200,
    });
    expect(await probe('/health/ready')).toEqual({
      body: { role: 'worker', status: 'ready' },
      status: 200,
    });

    worker.health.markNotReady();
    expect(await probe('/health/ready')).toEqual({
      body: { role: 'worker', status: 'not-ready' },
      status: 503,
    });
    expect(await probe('/health/live')).toEqual({
      body: { role: 'worker', status: 'alive' },
      status: 200,
    });
  });

  it('exposes nothing but the three probes and rejects other methods', async () => {
    const port = await findFreeLoopbackPort();
    worker = await startTestWorker(port);

    const unknownPath = await fetch(`http://127.0.0.1:${port}/metrics`);
    expect(unknownPath.status).toBe(404);
    expect(await unknownPath.text()).toBe('');

    const rootPath = await fetch(`http://127.0.0.1:${port}/`);
    expect(rootPath.status).toBe(404);

    const post = await fetch(`http://127.0.0.1:${port}/health/ready`, { method: 'POST' });
    expect(post.status).toBe(405);
  });

  it('closes the health endpoint when the application shuts down', async () => {
    const port = await findFreeLoopbackPort();
    worker = await startTestWorker(port);
    await worker.app.close();

    await expect(fetch(`http://127.0.0.1:${port}/health/ready`)).rejects.toThrow();
    worker = undefined;
  });

  it('fails the start when the health port is already taken', async () => {
    const port = await findFreeLoopbackPort();
    const blocker = createServer();
    await new Promise<void>((resolve, reject) => {
      blocker.once('error', reject);
      blocker.listen(port, '127.0.0.1', resolve);
    });

    try {
      await expect(startTestWorker(port)).rejects.toThrow();
    } finally {
      await new Promise<void>((resolve, reject) => {
        blocker.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});
