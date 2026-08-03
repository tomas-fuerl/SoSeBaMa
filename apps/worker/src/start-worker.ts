import { type INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { type WorkerRuntimeConfig } from '@sobama/config';

import { WorkerModule } from './app.module.js';
import { WorkerRuntimeHealth } from './runtime-health.js';

export interface StartedWorker {
  app: INestApplicationContext;
  environment: WorkerRuntimeConfig['environment'];
  health: WorkerRuntimeHealth;
}

export async function startWorker(config: WorkerRuntimeConfig): Promise<StartedWorker> {
  const app = await NestFactory.createApplicationContext(WorkerModule, { logger: false });
  const health = app.get(WorkerRuntimeHealth);
  health.markReady();
  return { app, environment: config.environment, health };
}
