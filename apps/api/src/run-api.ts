import { ConfigurationError, loadApiRuntimeConfig, type ApiRuntimeContext } from '@sobama/config';

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

function writeFailure(event: 'runtime.failed' | 'runtime.shutdown-failed', message: string): void {
  process.stderr.write(`${JSON.stringify({ event, message, role: 'api' })}\n`);
}

export async function runApi(context: ApiRuntimeContext): Promise<void> {
  const shutdownSignals = observeShutdownSignals();
  let runtime: StartedApi | undefined;
  let phase: 'startup' | 'running' | 'shutdown' = 'startup';
  let shutdownFailureReported = false;

  try {
    const config = loadApiRuntimeConfig(process.env, context);
    runtime = await startApi(config);
    process.stdout.write(
      `${JSON.stringify({ event: 'runtime.started', port: runtime.port, role: 'api' })}\n`,
    );
    phase = 'running';

    await shutdownSignals.wait();
    phase = 'shutdown';
    runtime.health.markNotReady();
    await runtime.app.close();
    process.stdout.write(`${JSON.stringify({ event: 'runtime.stopped', role: 'api' })}\n`);
  } catch (error: unknown) {
    const shutdownFailed = phase === 'shutdown';
    const message =
      !shutdownFailed && error instanceof ConfigurationError
        ? error.message
        : shutdownFailed
          ? 'API runtime failed to shut down.'
          : 'API runtime failed to start.';
    writeFailure(shutdownFailed ? 'runtime.shutdown-failed' : 'runtime.failed', message);
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
          writeFailure('runtime.shutdown-failed', 'API runtime failed to shut down.');
          process.exitCode = 1;
        }
      }
    }
  }
}
