import 'reflect-metadata';

import { ConfigurationError, loadWorkerRuntimeConfig } from '@sobama/config';

import { startWorker, type StartedWorker } from './start-worker.js';

interface ShutdownSignals {
  dispose(): void;
  wait(): Promise<NodeJS.Signals>;
}

function observeShutdownSignals(): ShutdownSignals {
  const keepAlive = setInterval(() => undefined, 60_000);
  let receivedSignal: NodeJS.Signals | undefined;
  let resolveSignal: (signal: NodeJS.Signals) => void = () => undefined;
  const signalPromise = new Promise<NodeJS.Signals>((resolve) => {
    resolveSignal = resolve;
  });
  const requestShutdown = (signal: NodeJS.Signals) => {
    if (!receivedSignal) {
      receivedSignal = signal;
      clearInterval(keepAlive);
      resolveSignal(signal);
    }
  };
  const onSigint = () => requestShutdown('SIGINT');
  const onSigterm = () => requestShutdown('SIGTERM');
  process.on('SIGINT', onSigint);
  process.on('SIGTERM', onSigterm);

  return {
    dispose: () => {
      clearInterval(keepAlive);
      process.off('SIGINT', onSigint);
      process.off('SIGTERM', onSigterm);
    },
    wait: () => signalPromise,
  };
}

function writeFailure(event: 'runtime.failed' | 'runtime.shutdown-failed', message: string): void {
  process.stderr.write(`${JSON.stringify({ event, message, role: 'worker' })}\n`);
}

async function main(): Promise<void> {
  const shutdownSignals = observeShutdownSignals();
  let runtime: StartedWorker | undefined;
  let phase: 'startup' | 'running' | 'shutdown' = 'startup';
  let shutdownFailureReported = false;

  try {
    const config = loadWorkerRuntimeConfig(process.env);
    runtime = await startWorker(config);
    process.stdout.write(`${JSON.stringify({ event: 'runtime.started', role: 'worker' })}\n`);
    phase = 'running';

    await shutdownSignals.wait();
    phase = 'shutdown';
    await runtime.app.close();
    process.stdout.write(`${JSON.stringify({ event: 'runtime.stopped', role: 'worker' })}\n`);
  } catch (error: unknown) {
    const shutdownFailed = phase === 'shutdown';
    const message =
      !shutdownFailed && error instanceof ConfigurationError
        ? error.message
        : shutdownFailed
          ? 'Worker runtime failed to shut down.'
          : 'Worker runtime failed to start.';
    writeFailure(shutdownFailed ? 'runtime.shutdown-failed' : 'runtime.failed', message);
    shutdownFailureReported = shutdownFailed;
    process.exitCode = 1;
  } finally {
    shutdownSignals.dispose();
    if (runtime && runtime.health.current() !== 'stopped') {
      try {
        await runtime.app.close();
      } catch {
        if (!shutdownFailureReported) {
          writeFailure('runtime.shutdown-failed', 'Worker runtime failed to shut down.');
          process.exitCode = 1;
        }
      }
    }
  }
}

void main();
