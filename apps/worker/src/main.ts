import 'reflect-metadata';

import {
  ConfigurationError,
  loadTelemetryRuntimeConfig,
  loadWorkerRuntimeConfig,
} from '@sobama/config';
import {
  createRuntimeFailureReporter,
  createRuntimeObservability,
  type RuntimeObservability,
} from '@sobama/observability';

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

async function main(): Promise<void> {
  const shutdownSignals = observeShutdownSignals();
  const failureReporter = createRuntimeFailureReporter('worker', 'unvalidated');
  let observability: RuntimeObservability | undefined;
  let runtime: StartedWorker | undefined;
  let phase: 'startup' | 'running' | 'shutdown' = 'startup';
  let shutdownFailureReported = false;

  try {
    const config = loadWorkerRuntimeConfig(process.env);
    const telemetry = loadTelemetryRuntimeConfig(process.env);
    observability = createRuntimeObservability({
      environment: config.environment,
      role: 'worker',
      telemetry,
    });
    runtime = await startWorker(config);
    observability.started();
    phase = 'running';

    await shutdownSignals.wait();
    phase = 'shutdown';
    await runtime.app.close();
    observability.stopped();
  } catch (error: unknown) {
    const shutdownFailed = phase === 'shutdown';
    if (observability) {
      observability.failed(shutdownFailed ? 'shutdown' : 'startup');
    } else {
      failureReporter.failed(
        shutdownFailed ? 'shutdown' : 'startup',
        error instanceof ConfigurationError ? 'configuration' : 'runtime',
      );
    }
    shutdownFailureReported = shutdownFailed;
    process.exitCode = 1;
  } finally {
    shutdownSignals.dispose();
    if (runtime && runtime.health.current() !== 'stopped') {
      try {
        await runtime.app.close();
      } catch {
        if (!shutdownFailureReported) {
          if (observability) {
            observability.failed('shutdown');
          } else {
            failureReporter.failed('shutdown', 'runtime');
          }
          process.exitCode = 1;
        }
      }
    }
    await observability?.shutdown();
  }
}

void main();
