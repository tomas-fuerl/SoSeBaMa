import 'reflect-metadata';

import { ConfigurationError, loadWorkerRuntimeConfig } from '@sobama/config';

import { startWorker } from './start-worker.js';

function waitForShutdownSignal(): Promise<void> {
  return new Promise((resolve) => {
    const keepAlive = setInterval(() => undefined, 60_000);
    const stop = () => {
      clearInterval(keepAlive);
      process.off('SIGINT', stop);
      process.off('SIGTERM', stop);
      resolve();
    };
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
  });
}

async function main(): Promise<void> {
  const config = loadWorkerRuntimeConfig(process.env);
  const { app } = await startWorker(config);
  process.stdout.write(`${JSON.stringify({ event: 'runtime.started', role: 'worker' })}\n`);
  await waitForShutdownSignal();
  await app.close();
  process.stdout.write(`${JSON.stringify({ event: 'runtime.stopped', role: 'worker' })}\n`);
}

void main().catch((error: unknown) => {
  const message =
    error instanceof ConfigurationError ? error.message : 'Worker runtime failed to start.';
  process.stderr.write(`${JSON.stringify({ event: 'runtime.failed', message, role: 'worker' })}\n`);
  process.exitCode = 1;
});
