import { describe, expect, it } from 'vitest';

import type { HealthReportedStatus, HealthResponseBody, HealthRole } from '../src/index.js';

/** Fails to compile if the two type arguments stop being identical. */
type AssertExact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

const reportedStatuses = [
  'alive',
  'error',
  'not-ready',
  'ready',
  'started',
] as const satisfies readonly HealthReportedStatus[];

const roles = ['api', 'worker'] as const satisfies readonly HealthRole[];

const statusVocabularyIsExhaustive: AssertExact<
  HealthReportedStatus,
  (typeof reportedStatuses)[number]
> = true;

const roleVocabularyIsExhaustive: AssertExact<HealthRole, (typeof roles)[number]> = true;

describe('health wire contract', () => {
  it('pins the published status vocabulary', () => {
    expect(statusVocabularyIsExhaustive).toBe(true);
    expect([...reportedStatuses]).toEqual(['alive', 'error', 'not-ready', 'ready', 'started']);
  });

  it('pins the published role vocabulary', () => {
    expect(roleVocabularyIsExhaustive).toBe(true);
    expect([...roles]).toEqual(['api', 'worker']);
  });

  it('describes a body of exactly role and status', () => {
    const body: HealthResponseBody = { role: 'api', status: 'ready' };

    expect(Object.keys(body).toSorted()).toEqual(['role', 'status']);
  });

  it('exports no server-internal lifecycle or transport detail', async () => {
    // The lifecycle state and the HTTP mapping belong to @sobama/runtime-health.
    // Browser code may import this package, so neither may reappear here.
    const contracts = await import('../src/index.js');

    expect(Object.keys(contracts)).toEqual([]);
  });
});
