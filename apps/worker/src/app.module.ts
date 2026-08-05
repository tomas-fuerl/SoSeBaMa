import { Module } from '@nestjs/common';

import { WorkerRuntimeHealth } from './runtime-health.js';

@Module({
  providers: [WorkerRuntimeHealth],
})
export class WorkerModule {}
