export type HealthRole = 'api' | 'worker';

export type HealthProbe = 'live' | 'ready' | 'startup';

/** Internal lifecycle state a runtime role tracks for itself. */
export type HealthLifecycleStatus = 'error' | 'not-ready' | 'ready' | 'starting' | 'stopped';

/** Externally reported status. Never exposes environment or diagnostic detail. */
export type HealthReportedStatus = 'alive' | 'error' | 'not-ready' | 'ready' | 'started';

export interface HealthResponseBody {
  role: HealthRole;
  status: HealthReportedStatus;
}

export interface HealthResponse {
  body: HealthResponseBody;
  httpStatus: 200 | 503;
}

/**
 * Maps a role's lifecycle state to the response of one health probe.
 *
 * Startup reports that the process reached its entrypoint, liveness that it is
 * not in a terminal state, and readiness that it may accept work. Only the
 * error state is distinguishable from the outside; every other unready state
 * collapses to `not-ready` so that the response carries no diagnostic detail.
 */
export function resolveHealthResponse(
  role: HealthRole,
  probe: HealthProbe,
  status: HealthLifecycleStatus,
): HealthResponse {
  if (status === 'error') {
    return { body: { role, status: 'error' }, httpStatus: 503 };
  }
  if (probe === 'startup') {
    return { body: { role, status: 'started' }, httpStatus: 200 };
  }
  if (probe === 'live') {
    return status === 'stopped'
      ? { body: { role, status: 'error' }, httpStatus: 503 }
      : { body: { role, status: 'alive' }, httpStatus: 200 };
  }
  return status === 'ready'
    ? { body: { role, status: 'ready' }, httpStatus: 200 }
    : { body: { role, status: 'not-ready' }, httpStatus: 503 };
}
