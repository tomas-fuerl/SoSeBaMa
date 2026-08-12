import {
  ConfigurationError,
  loadApiRuntimeConfig,
  loadTelemetryRuntimeConfig,
  type ApiRuntimeContext,
} from '@sobama/config';
import {
  createRuntimeLogger,
  createRuntimeObservability,
  type RuntimeObservability,
} from '@sobama/observability';

import { startApi, type StartedApi } from './start-api.js';

interface ShutdownSignals {
  dispose(): void;
  wait(): Promise<NodeJS.Signals>;
}

function observeShutdownSignals(): ShutdownSignals {
  let receivedSignal: NodeJS.Signals | undefined;
  let resolveSignal: (signal: NodeJS.Signals) => void = () => undefined;
  const signalPromise = new Promise<NodeJS.Signals>((resolve) => {
    resolveSignal = resolve;
  });
  const requestShutdown = (signal: NodeJS.Signals) => {
    if (!receivedSignal) {
      receivedSignal = signal;
      resolveSignal(signal);
    }
  };
  const onSigint = () => requestShutdown('SIGINT');
  const onSigterm = () => requestShutdown('SIGTERM');
  process.on('SIGINT', onSigint);
  process.on('SIGTERM', onSigterm);

  return {
    dispose: () => {
      process.off('SIGINT', onSigint);
      process.off('SIGTERM', onSigterm);
    },
    wait: () => signalPromise,
  };
}

export async function runApi(context: ApiRuntimeContext): Promise<void> {
  const shutdownSignals = observeShutdownSignals();
  const bootstrapLogger = createRuntimeLogger('api', 'unvalidated');
  let observability: RuntimeObservability | undefined;
  let runtime: StartedApi | undefined;
  let phase: 'startup' | 'running' | 'shutdown' = 'startup';
  let shutdownFailureReported = false;

  try {
    const config = loadApiRuntimeConfig(process.env, context);
    const telemetry = loadTelemetryRuntimeConfig(process.env);
    observability = createRuntimeObservability({
      environment: config.environment,
      role: 'api',
      telemetry,
    });
    runtime = await startApi(config);
    observability.started();
    phase = 'running';

    await shutdownSignals.wait();
    phase = 'shutdown';
    runtime.health.markNotReady();
    await runtime.app.close();
    observability.stopped();
  } catch (error: unknown) {
    const shutdownFailed = phase === 'shutdown';
    if (observability) {
      observability.failed(shutdownFailed ? 'shutdown' : 'startup');
    } else {
      bootstrapLogger.error(shutdownFailed ? 'runtime.shutdown-failed' : 'runtime.failed', {
        category: error instanceof ConfigurationError ? 'configuration' : 'runtime',
        ...(error instanceof ConfigurationError ? { variable: error.variable } : {}),
      });
    }
    shutdownFailureReported = shutdownFailed;
    process.exitCode = 1;
  } finally {
    shutdownSignals.dispose();
    if (runtime && runtime.health.current() !== 'stopped') {
      runtime.health.markNotReady();
      try {
        await runtime.app.close();
      } catch {
        if (!shutdownFailureReported) {
          if (observability) {
            observability.failed('shutdown');
          } else {
            bootstrapLogger.error('runtime.shutdown-failed', {
              category: 'runtime',
            });
          }
          process.exitCode = 1;
        }
      }
    }
    await observability?.shutdown();
  }
}
