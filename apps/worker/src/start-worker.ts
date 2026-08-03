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
  let healthForCleanup: WorkerRuntimeHealth | undefined;
  try {
    const health = app.get(WorkerRuntimeHealth);
    healthForCleanup = health;
    health.markReady();
    return { app, environment: config.environment, health };
  } catch (error: unknown) {
    healthForCleanup?.markError();
    try {
      await app.close();
    } catch (closeError: unknown) {
      throw new AggregateError([error, closeError], 'Worker startup and cleanup both failed.', {
        cause: closeError,
      });
    }
    throw error;
  }
}
