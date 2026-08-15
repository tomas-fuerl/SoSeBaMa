import { describe, expect, it } from 'vitest';

import {
  allowedLicenses,
  assertLicenseReport,
  collectViolations,
  isAllowed,
  LicenseReportError,
} from '../tools/check-licenses.mjs';

function report(license: string, name = 'example', versions: string[] = ['1.0.0']) {
  return { [license]: [{ name, versions }] };
}

describe('licence allowlist', () => {
  it.each([
    'MIT',
    'Apache-2.0',
    'ISC',
    'BSD-2-Clause',
    'BSD-3-Clause',
    '0BSD',
    'BlueOak-1.0.0',
    'MPL-2.0',
  ])('allows the documented licence %s', (license) => {
    expect(isAllowed(license)).toBe(true);
  });

  it.each([
    'AGPL-3.0',
    'AGPL-3.0-only',
    'AGPL-3.0-or-later',
    'SSPL-1.0',
    'GPL-3.0',
    'GPL-2.0-or-later',
    'LGPL-3.0',
    'UNLICENSED',
    'Custom: see LICENSE',
    '',
    '   ',
  ])('blocks %s', (license) => {
    expect(isAllowed(license)).toBe(false);
  });

  it('keeps the allowlist and the policy document in sync', () => {
    expect([...allowedLicenses].toSorted()).toEqual([
      '0BSD',
      'Apache-2.0',
      'BSD-2-Clause',
      'BSD-3-Clause',
      'BlueOak-1.0.0',
      'ISC',
      'MIT',
      'MPL-2.0',
    ]);
  });
});

describe('SPDX expressions', () => {
  it.each([
    ['(MIT OR Apache-2.0)', true],
    ['MIT OR GPL-3.0', true],
    ['GPL-3.0 OR MIT', true],
    ['(AGPL-3.0 OR SSPL-1.0)', false],
    ['MIT AND Apache-2.0', true],
    ['MIT AND GPL-3.0', false],
    ['GPL-3.0 AND MIT', false],
    // Mixed operators are not parsed and must fail closed.
    ['MIT OR GPL-3.0 AND SSPL-1.0', false],
    ['(MIT OR (Apache-2.0 AND ISC))', false],
  ] as const)('resolves %s to %s', (expression, expected) => {
    expect(isAllowed(expression)).toBe(expected);
  });

  it('never treats a non-string as allowed', () => {
    for (const value of [undefined, null, 42, {}, []]) {
      expect(isAllowed(value as unknown as string)).toBe(false);
    }
  });
});

describe('report validation', () => {
  it('accepts a well formed report', () => {
    expect(() => assertLicenseReport(report('MIT'))).not.toThrow();
  });

  it.each([
    ['null', null],
    ['an array', []],
    ['a string', 'unexpected'],
    ['a number', 7],
  ] as const)('rejects a report that is %s', (_label, value) => {
    expect(() => assertLicenseReport(value)).toThrow(LicenseReportError);
  });

  it.each([
    ['a string bucket', { 'GPL-3.0': 'unexpected' }],
    ['a null bucket', { 'GPL-3.0': null }],
    ['an empty bucket', { 'GPL-3.0': [] }],
    ['a bucket of nulls', { 'GPL-3.0': [null] }],
    ['a package without a name', { 'GPL-3.0': [{ versions: ['1.0.0'] }] }],
    ['a package with a blank name', { 'GPL-3.0': [{ name: '  ', versions: ['1.0.0'] }] }],
    ['a package without versions', { 'GPL-3.0': [{ name: 'example' }] }],
    ['a package with empty versions', { 'GPL-3.0': [{ name: 'example', versions: [] }] }],
    ['an empty licence name', { '': [{ name: 'example', versions: ['1.0.0'] }] }],
  ] as const)('rejects %s', (_label, value) => {
    expect(() => assertLicenseReport(value)).toThrow(LicenseReportError);
  });

  it('rejects a malformed bucket even when the licence itself is allowed', () => {
    expect(() => assertLicenseReport({ MIT: 'unexpected' })).toThrow(LicenseReportError);
  });
});

describe('violation collection', () => {
  it('reports nothing for allowed licences', () => {
    expect(collectViolations(report('MIT'))).toEqual([]);
  });

  it('reports package, versions and licence for a disallowed licence', () => {
    expect(collectViolations(report('GPL-3.0', 'left-pad', ['1.3.0']))).toEqual([
      '  left-pad@1.3.0: GPL-3.0',
    ]);
  });

  /**
   * The regression this test exists for: a malformed bucket previously made the
   * scan iterate an empty list, so a disallowed licence produced no violation
   * and the gate reported success.
   */
  it.each([
    ['a string bucket', { 'GPL-3.0': 'unexpected' }],
    ['an empty bucket', { 'GPL-3.0': [] }],
    ['a null bucket', { 'GPL-3.0': null }],
  ] as const)('fails closed instead of passing silently for %s', (_label, value) => {
    expect(() => collectViolations(value)).toThrow(LicenseReportError);
  });

  it('sorts violations so that output is stable', () => {
    const violations = collectViolations({
      'GPL-3.0': [
        { name: 'zeta', versions: ['1.0.0'] },
        { name: 'alpha', versions: ['2.0.0'] },
      ],
    });

    expect(violations).toEqual(['  alpha@2.0.0: GPL-3.0', '  zeta@1.0.0: GPL-3.0']);
  });
});
