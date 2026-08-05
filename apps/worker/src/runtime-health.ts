import { Injectable, type OnApplicationShutdown } from '@nestjs/common';

export type WorkerHealthStatus = 'starting' | 'ready' | 'error' | 'stopped';

@Injectable()
export class WorkerRuntimeHealth implements OnApplicationShutdown {
  private status: WorkerHealthStatus = 'starting';

  current(): WorkerHealthStatus {
    return this.status;
  }

  markReady(): void {
    this.status = 'ready';
  }

  markError(): void {
    this.status = 'error';
  }

  onApplicationShutdown(): void {
    this.status = 'stopped';
  }
}
