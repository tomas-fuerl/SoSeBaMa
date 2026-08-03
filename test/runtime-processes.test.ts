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
    server.listen(0, 'localhost', resolve);
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

describe('built runtime processes', () => {
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
      SOSEBAMA_API_HOST: 'localhost',
      SOSEBAMA_API_PORT: String(port),
      SOSEBAMA_ENVIRONMENT: 'DEV',
    });

    await runtimeProcess.waitForOutput('stdout', '"event":"runtime.started"');
    expect(runtimeProcess.signal('SIGINT')).toBe(true);
    await runtimeProcess.waitForOutput('stdout', '"event":"runtime.stopped"');
    await expect(runtimeProcess.waitForExit()).resolves.toEqual({ code: 0, signal: null });
  });

  it('starts the worker, handles SIGTERM, reports stop, and exits successfully', async () => {
    const runtimeProcess = startProcess('apps/worker/dist/main.js', {
      SOSEBAMA_ENVIRONMENT: 'DEV',
    });

    await runtimeProcess.waitForOutput('stdout', '"event":"runtime.started"');
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
});
