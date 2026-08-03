import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

import { RuntimeHealth } from './runtime-health.js';

interface HealthResponse {
  role: 'api';
  status: 'started' | 'alive' | 'not-ready' | 'ready' | 'error';
}

@Controller('health')
export class HealthController {
  constructor(private readonly runtimeHealth: RuntimeHealth) {}

  @Get('startup')
  startup(): HealthResponse {
    if (this.runtimeHealth.current() === 'error') {
      throw new ServiceUnavailableException({ role: 'api', status: 'error' });
    }
    return { role: 'api', status: 'started' };
  }

  @Get('live')
  liveness(): HealthResponse {
    const status = this.runtimeHealth.current();
    if (status === 'error' || status === 'stopped') {
      throw new ServiceUnavailableException({ role: 'api', status: 'error' });
    }
    return { role: 'api', status: 'alive' };
  }

  @Get('ready')
  readiness(): HealthResponse {
    const status = this.runtimeHealth.current();
    if (status === 'ready') {
      return { role: 'api', status: 'ready' };
    }
    if (status === 'error') {
      throw new ServiceUnavailableException({ role: 'api', status: 'error' });
    }
    throw new ServiceUnavailableException({ role: 'api', status: 'not-ready' });
  }
}
