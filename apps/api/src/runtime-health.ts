import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import { type HealthLifecycleStatus } from '@sobama/runtime-health';

export type RuntimeHealthStatus = HealthLifecycleStatus;

@Injectable()
export class RuntimeHealth implements OnApplicationShutdown {
  private status: RuntimeHealthStatus = 'starting';

  current(): RuntimeHealthStatus {
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
