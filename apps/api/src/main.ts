import 'reflect-metadata';

import { ConfigurationError, loadApiRuntimeConfig } from '@sobama/config';

import { startApi } from './start-api.js';

function waitForShutdownSignal(): Promise<void> {
  return new Promise((resolve) => {
    const stop = () => {
      process.off('SIGINT', stop);
      process.off('SIGTERM', stop);
      resolve();
    };
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
  });
}

async function main(): Promise<void> {
  const config = loadApiRuntimeConfig(process.env);
  const { app, port } = await startApi(config);
  process.stdout.write(`${JSON.stringify({ event: 'runtime.started', port, role: 'api' })}\n`);
  await waitForShutdownSignal();
  await app.close();
  process.stdout.write(`${JSON.stringify({ event: 'runtime.stopped', role: 'api' })}\n`);
}

void main().catch((error: unknown) => {
  const message =
    error instanceof ConfigurationError ? error.message : 'API runtime failed to start.';
  process.stderr.write(`${JSON.stringify({ event: 'runtime.failed', message, role: 'api' })}\n`);
  process.exitCode = 1;
});
