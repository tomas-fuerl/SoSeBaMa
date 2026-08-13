import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';

import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { resolveHealthResponse, type HealthProbe } from '@sobama/runtime-health';

import { WorkerRuntimeHealth } from './runtime-health.js';

const probesByPath: ReadonlyMap<string, HealthProbe> = new Map([
  ['/health/startup', 'startup'],
  ['/health/live', 'live'],
  ['/health/ready', 'ready'],
]);

/**
 * The bind address of the worker health listener.
 *
 * This is a module constant rather than a parameter or configuration value: it
 * is the network sink itself, so neither an environment variable nor a
 * programmatic caller can widen it beyond container-internal loopback.
 */
export const WORKER_HEALTH_HOST = '127.0.0.1';

/**
 * Minimal diagnostic listener for the worker.
 *
 * The worker is an application context without an HTTP framework. It still has
 * to expose startup, liveness and readiness separately, so this serves exactly
 * three fixed paths and answers everything else with an empty 404. It binds a
 * container-internal loopback address only; it is not reachable from the
 * application network or from the host, and the worker publishes no port.
 *
 * The listener shares the worker's event loop on purpose: if that loop blocks,
 * the probe stops answering and the container healthcheck fails. A check that
 * only asserts process existence could not detect this.
 */
@Injectable()
export class WorkerHealthServer implements OnApplicationShutdown {
  private server: Server | undefined;

  constructor(private readonly runtimeHealth: WorkerRuntimeHealth) {}

  async listen(port: number): Promise<void> {
    if (this.server) {
      return;
    }
    const server = createServer((request, response) => {
      this.handle(request, response);
    });
    await new Promise<void>((resolve, reject) => {
      const onError = (error: Error) => {
        server.off('listening', onListening);
        reject(error);
      };
      const onListening = () => {
        server.off('error', onError);
        resolve();
      };
      server.once('error', onError);
      server.once('listening', onListening);
      server.listen(port, WORKER_HEALTH_HOST);
    });
    this.server = server;
  }

  async close(): Promise<void> {
    const server = this.server;
    if (!server) {
      return;
    }
    this.server = undefined;
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }

  async onApplicationShutdown(): Promise<void> {
    await this.close();
  }

  private handle(request: IncomingMessage, response: ServerResponse): void {
    const method = request.method ?? '';
    if (method !== 'GET' && method !== 'HEAD') {
      response.writeHead(405, { allow: 'GET, HEAD' }).end();
      return;
    }

    const probe = probesByPath.get(request.url ?? '');
    if (!probe) {
      response.writeHead(404).end();
      return;
    }

    const { body, httpStatus } = resolveHealthResponse(
      'worker',
      probe,
      this.runtimeHealth.current(),
    );
    const payload = JSON.stringify(body);
    response.writeHead(httpStatus, {
      'cache-control': 'no-store',
      'content-length': Buffer.byteLength(payload),
      'content-type': 'application/json; charset=utf-8',
    });
    response.end(method === 'HEAD' ? undefined : payload);
  }
}
