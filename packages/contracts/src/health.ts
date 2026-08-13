/**
 * Externally visible health wire contract.
 *
 * This module deliberately carries no lifecycle state and no HTTP mapping.
 * Both are server-internal and live in `@sobama/runtime-health`, which the
 * browser may not import.
 */

export type HealthRole = 'api' | 'worker';

/** The only status values a health response may report to a client. */
export type HealthReportedStatus = 'alive' | 'error' | 'not-ready' | 'ready' | 'started';

export interface HealthResponseBody {
  role: HealthRole;
  status: HealthReportedStatus;
}
