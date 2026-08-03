import { type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { type ApiRuntimeConfig } from '@sobama/config';
import { type AddressInfo } from 'node:net';

import { ApiModule } from './app.module.js';
import { RuntimeHealth } from './runtime-health.js';

export interface StartedApi {
  app: INestApplication;
  health: RuntimeHealth;
  port: number;
}

export async function startApi(config: ApiRuntimeConfig): Promise<StartedApi> {
  const app = await NestFactory.create(ApiModule, { logger: false });
  const health = app.get(RuntimeHealth);
  await app.listen(config.port, config.host);
  health.markReady();

  const address = app.getHttpServer().address() as AddressInfo | null;
  if (!address) {
    health.markError();
    await app.close();
    throw new Error('API listener did not expose a network address.');
  }

  return { app, health, port: address.port };
}
