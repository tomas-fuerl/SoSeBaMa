import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { createServer, type AddressInfo } from 'node:net';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const PROCESS_TIMEOUT_MS = 10_000;

interface ExitResult {
  code: number | null;
  signal: NodeJS.Signals | null;
}

class RuntimeProcess {
  readonly child: ChildProcessWithoutNullStreams;
  stderr = '';
  stdout = '';
  private exitResult: ExitResult | undefined;
  private readonly exitPromise: Promise<ExitResult>;

  constructor(entrypoint: string, environment: NodeJS.ProcessEnv) {
    this.child = spawn(process.execPath, [entrypoint], {
      cwd: repositoryRoot,
      env: environment,
      stdio: 'pipe',
    });
    this.child.stdin.end();
    this.child.stdout.setEncoding('utf8');
    this.child.stderr.setEncoding('utf8');
    this.child.stdout.on('data', (chunk: string) => {
      this.stdout += chunk;
    });
    this.child.stderr.on('data', (chunk: string) => {
      this.stderr += chunk;
    });
    this.exitPromise = new Promise((resolve, reject) => {
      this.child.once('error', reject);
      this.child.once('exit', (code, signal) => {
        this.exitResult = { code, signal };
        resolve(this.exitResult);
      });
    });
  }

  signal(signal: NodeJS.Signals): boolean {
    return this.child.kill(signal);
  }

  async waitForOutput(source: 'stdout' | 'stderr', expected: string): Promise<void> {
    const stream = source === 'stdout' ? this.child.stdout : this.child.stderr;
    const currentOutput = () => (source === 'stdout' ? this.stdout : this.stderr);
    if (currentOutput().includes(expected)) {
      return;
    }
    if (this.exitResult) {
      throw new Error(this.failureMessage(`exited before emitting ${expected}`));
    }

    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timeout);
        stream.off('data', onData);
        this.child.off('exit', onExit);
      };
      const onData = () => {
        if (currentOutput().includes(expected)) {
          cleanup();
          resolve();
        }
      };
      const onExit = () => {
        cleanup();
        reject(new Error(this.failureMessage(`exited before emitting ${expected}`)));
      };
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error(this.failureMessage(`timed out waiting for ${expected}`)));
      }, PROCESS_TIMEOUT_MS);

      stream.on('data', onData);
      this.child.once('exit', onExit);
      onData();
    });
  }

  async waitForExit(): Promise<ExitResult> {
    if (this.exitResult) {
      return this.exitResult;
    }
    return await new Promise<ExitResult>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(this.failureMessage('timed out waiting for process exit')));
      }, PROCESS_TIMEOUT_MS);
      this.exitPromise.then(
        (result) => {
          clearTimeout(timeout);
          resolve(result);
        },
        (error: unknown) => {
          clearTimeout(timeout);
          reject(error);
        },
      );
    });
  }

  async forceCleanup(): Promise<void> {
    if (!this.exitResult) {
      this.child.kill('SIGKILL');
      await this.waitForExit().catch(() => undefined);
    }
  }

  private failureMessage(reason: string): string {
    return `${reason}\nstdout:\n${this.stdout}\nstderr:\n${this.stderr}`;
  }
}

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
    throw new Error('Cannot allocate a loopback port for the API process test.');
  }
  return address.port;
}

function parseJsonLines(output: string): Array<Record<string, unknown>> {
  return output
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>);
}

describe('built runtime processes', { timeout: PROCESS_TIMEOUT_MS + 5_000 }, () => {
  const processes = new Set<RuntimeProcess>();

  const startProcess = (entrypoint: string, environment: NodeJS.ProcessEnv) => {
    const runtimeProcess = new RuntimeProcess(entrypoint, environment);
    processes.add(runtimeProcess);
    return runtimeProcess;
  };

  afterEach(async () => {
    await Promise.all([...processes].map(async (runtimeProcess) => runtimeProcess.forceCleanup()));
    processes.clear();
  });

  it('starts the API, handles SIGINT, reports stop, and exits successfully', async () => {
    const port = await findFreeLoopbackPort();
    const runtimeProcess = startProcess('apps/api/dist/main.js', {
      SOSEBAMA_API_HOST: '127.0.0.1',
      SOSEBAMA_API_PORT: String(port),
      SOSEBAMA_ENVIRONMENT: 'DEV',
    });

    await runtimeProcess.waitForOutput('stdout', '"event":"runtime.started"');
    expect(parseJsonLines(runtimeProcess.stdout)).toEqual([
      expect.objectContaining({
        environment: 'DEV',
        event: 'runtime.started',
        role: 'api',
        service: 'sobama-api',
      }),
    ]);
    expect(runtimeProcess.stdout).not.toMatch(/"(?:hostname|pid)":/u);
    expect(runtimeProcess.signal('SIGINT')).toBe(true);
    await runtimeProcess.waitForOutput('stdout', '"event":"runtime.stopped"');
    await expect(runtimeProcess.waitForExit()).resolves.toEqual({ code: 0, signal: null });
  });

  it('starts the worker, handles SIGTERM, reports stop, and exits successfully', async () => {
    const runtimeProcess = startProcess('apps/worker/dist/main.js', {
      SOSEBAMA_ENVIRONMENT: 'DEV',
      SOSEBAMA_WORKER_HEALTH_PORT: String(await findFreeLoopbackPort()),
    });

    await runtimeProcess.waitForOutput('stdout', '"event":"runtime.started"');
    expect(parseJsonLines(runtimeProcess.stdout)).toEqual([
      expect.objectContaining({
        environment: 'DEV',
        event: 'runtime.started',
        role: 'worker',
        service: 'sobama-worker',
      }),
    ]);
    expect(runtimeProcess.signal('SIGTERM')).toBe(true);
    await runtimeProcess.waitForOutput('stdout', '"event":"runtime.stopped"');
    await expect(runtimeProcess.waitForExit()).resolves.toEqual({ code: 0, signal: null });
  });

  for (const [role, entrypoint] of [
    ['api', 'apps/api/dist/main.js'],
    ['worker', 'apps/worker/dist/main.js'],
  ] as const) {
    it(`reports a configuration failure and exit code 1 for the ${role}`, async () => {
      const runtimeProcess = startProcess(entrypoint, {});

      await runtimeProcess.waitForOutput('stderr', '"event":"runtime.failed"');
      await expect(runtimeProcess.waitForExit()).resolves.toEqual({ code: 1, signal: null });
      expect(runtimeProcess.stdout).not.toContain('"event":"runtime.started"');
    });
  }

  it('answers the worker health probes on loopback only and closes them on shutdown', async () => {
    const healthPort = await findFreeLoopbackPort();
    const runtimeProcess = startProcess('apps/worker/dist/main.js', {
      SOSEBAMA_ENVIRONMENT: 'DEV',
      SOSEBAMA_WORKER_HEALTH_PORT: String(healthPort),
    });

    await runtimeProcess.waitForOutput('stdout', '"event":"runtime.started"');

    const ready = await fetch(`http://127.0.0.1:${healthPort}/health/ready`);
    expect(ready.status).toBe(200);
    expect(await ready.json()).toEqual({ role: 'worker', status: 'ready' });

    for (const path of ['/health/startup', '/health/live']) {
      const response = await fetch(`http://127.0.0.1:${healthPort}${path}`);
      expect(response.status, path).toBe(200);
    }

    // Bound to loopback only: a wildcard bind on the same port must therefore
    // still be possible. If the worker had taken 0.0.0.0, this would fail with
    // EADDRINUSE. This is deterministic and does not depend on the host's
    // network interfaces.
    const wildcard = createServer();
    await expect(
      new Promise<void>((resolve, reject) => {
        wildcard.once('error', reject);
        wildcard.listen(healthPort, '0.0.0.0', resolve);
      }),
    ).resolves.toBeUndefined();
    await new Promise<void>((resolve, reject) => {
      wildcard.close((error) => (error ? reject(error) : resolve()));
    });

    expect(runtimeProcess.signal('SIGTERM')).toBe(true);
    await expect(runtimeProcess.waitForExit()).resolves.toEqual({ code: 0, signal: null });
    await expect(fetch(`http://127.0.0.1:${healthPort}/health/ready`)).rejects.toThrow();
  });

  it('keeps a worker runtime healthy when the optional OTLP collector is unavailable', async () => {
    const unavailableCollectorPort = await findFreeLoopbackPort();
    const runtimeProcess = startProcess('apps/worker/dist/main.js', {
      OTEL_EXPORTER_OTLP_ENDPOINT: `http://127.0.0.1:${unavailableCollectorPort}`,
      SOSEBAMA_ENVIRONMENT: 'DEV',
      SOSEBAMA_TELEMETRY_EXPORTER: 'otlp',
      SOSEBAMA_WORKER_HEALTH_PORT: String(await findFreeLoopbackPort()),
    });

    await runtimeProcess.waitForOutput('stdout', '"event":"runtime.started"');
    expect(runtimeProcess.signal('SIGTERM')).toBe(true);
    await runtimeProcess.waitForOutput('stdout', '"event":"runtime.stopped"');
    await expect(runtimeProcess.waitForExit()).resolves.toEqual({ code: 0, signal: null });
    expect(runtimeProcess.stderr).toContain('"event":"telemetry.flush-failed"');
    expect(runtimeProcess.stderr).not.toContain(String(unavailableCollectorPort));
  });
});
