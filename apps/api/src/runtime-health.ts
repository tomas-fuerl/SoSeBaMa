import { Injectable, type OnApplicationShutdown } from '@nestjs/common';

export type RuntimeHealthStatus = 'starting' | 'not-ready' | 'ready' | 'error' | 'stopped';

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
