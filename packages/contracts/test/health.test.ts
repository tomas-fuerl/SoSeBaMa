import { describe, expect, it } from 'vitest';

import {
  resolveHealthResponse,
  type HealthLifecycleStatus,
  type HealthProbe,
  type HealthReportedStatus,
  type HealthRole,
} from '../src/index.js';

type Expectation = readonly [httpStatus: 200 | 503, status: HealthReportedStatus];

/**
 * The complete externally observable contract. Every lifecycle state is listed
 * for every probe so that a behaviour change cannot pass unnoticed.
 */
const matrix: Readonly<Record<HealthLifecycleStatus, Readonly<Record<HealthProbe, Expectation>>>> =
  {
    error: {
      live: [503, 'error'],
      ready: [503, 'error'],
      startup: [503, 'error'],
    },
    'not-ready': {
      live: [200, 'alive'],
      ready: [503, 'not-ready'],
      startup: [200, 'started'],
    },
    ready: {
      live: [200, 'alive'],
      ready: [200, 'ready'],
      startup: [200, 'started'],
    },
    starting: {
      live: [200, 'alive'],
      ready: [503, 'not-ready'],
      startup: [200, 'started'],
    },
    stopped: {
      live: [503, 'error'],
      ready: [503, 'not-ready'],
      startup: [200, 'started'],
    },
  };

const roles: readonly HealthRole[] = ['api', 'worker'];
const probes: readonly HealthProbe[] = ['startup', 'live', 'ready'];
const lifecycleStatuses = Object.keys(matrix) as HealthLifecycleStatus[];

describe('health response contract', () => {
  for (const role of roles) {
    for (const status of lifecycleStatuses) {
      for (const probe of probes) {
        const [httpStatus, reported] = matrix[status][probe];

        it(`maps ${role} ${probe} in state ${status} to ${httpStatus} ${reported}`, () => {
          expect(resolveHealthResponse(role, probe, status)).toEqual({
            body: { role, status: reported },
            httpStatus,
          });
        });
      }
    }
  }

  it('never reports a status outside the published vocabulary', () => {
    const allowed = new Set<HealthReportedStatus>([
      'alive',
      'error',
      'not-ready',
      'ready',
      'started',
    ]);

    for (const role of roles) {
      for (const status of lifecycleStatuses) {
        for (const probe of probes) {
          const response = resolveHealthResponse(role, probe, status);
          expect(allowed.has(response.body.status)).toBe(true);
          expect(Object.keys(response.body).toSorted()).toEqual(['role', 'status']);
          expect(response.body.role).toBe(role);
        }
      }
    }
  });

  it('reports readiness only in the ready state', () => {
    for (const status of lifecycleStatuses) {
      const response = resolveHealthResponse('worker', 'ready', status);
      expect(response.httpStatus === 200, status).toBe(status === 'ready');
    }
  });
});
