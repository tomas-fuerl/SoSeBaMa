import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { ApiRuntimeConfig } from '@sobama/config';
import type { AddressInfo } from 'node:net';

import { ApiModule } from './app.module.js';
import { RuntimeHealth } from './runtime-health.js';

export interface StartedApi {
  app: INestApplication;
  health: RuntimeHealth;
  port: number;
}

export async function startApi(config: ApiRuntimeConfig): Promise<StartedApi> {
  const app = await NestFactory.create(ApiModule, { logger: false });
  let healthForCleanup: RuntimeHealth | undefined;
  try {
    const health = app.get(RuntimeHealth);
    healthForCleanup = health;
    await app.listen(config.port, config.host);
    health.markReady();

    const address = app.getHttpServer().address() as AddressInfo | null;
    if (!address) {
      throw new Error('API listener did not expose a network address.');
    }

    return { app, health, port: address.port };
  } catch (error: unknown) {
    healthForCleanup?.markError();
    try {
      await app.close();
    } catch (closeError: unknown) {
      throw new AggregateError([error, closeError], 'API startup and cleanup both failed.', {
        cause: closeError,
      });
    }
    throw error;
  }
}
