import { Module } from '@nestjs/common';

import { HealthController } from './health.controller.js';
import { RuntimeHealth } from './runtime-health.js';

@Module({
  controllers: [HealthController],
  providers: [RuntimeHealth],
})
export class ApiModule {}
