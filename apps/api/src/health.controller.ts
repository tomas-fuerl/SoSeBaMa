import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { type HealthResponseBody } from '@sobama/contracts';
import { resolveHealthResponse, type HealthProbe } from '@sobama/runtime-health';

import { RuntimeHealth } from './runtime-health.js';

@Controller('health')
export class HealthController {
  constructor(private readonly runtimeHealth: RuntimeHealth) {}

  @Get('startup')
  startup(): HealthResponseBody {
    return this.respond('startup');
  }

  @Get('live')
  liveness(): HealthResponseBody {
    return this.respond('live');
  }

  @Get('ready')
  readiness(): HealthResponseBody {
    return this.respond('ready');
  }

  private respond(probe: HealthProbe): HealthResponseBody {
    const { body, httpStatus } = resolveHealthResponse('api', probe, this.runtimeHealth.current());
    if (httpStatus !== 200) {
      throw new ServiceUnavailableException(body);
    }
    return body;
  }
}
