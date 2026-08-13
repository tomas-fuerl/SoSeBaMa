import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { type HealthLifecycleStatus } from '@sobama/runtime-health';

export type WorkerHealthStatus = HealthLifecycleStatus;

@Injectable()
export class WorkerRuntimeHealth implements OnApplicationShutdown {
  private status: WorkerHealthStatus = 'starting';

  current(): WorkerHealthStatus {
    return this.status;
  }

  markReady(): void {
    this.status = 'ready';
  }

  markNotReady(): void {
    this.status = 'not-ready';
  }

  markError(): void {
    this.status = 'error';
  }

  onApplicationShutdown(): void {
    this.status = 'stopped';
  }
}
