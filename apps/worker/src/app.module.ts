import { Module } from '@nestjs/common';

import { WorkerHealthServer } from './health-server.js';
import { WorkerRuntimeHealth } from './runtime-health.js';

@Module({
  providers: [WorkerRuntimeHealth, WorkerHealthServer],
})
export class WorkerModule {}
