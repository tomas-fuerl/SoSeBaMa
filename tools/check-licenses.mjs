#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { argv, stderr, stdout } from 'node:process';
import { pathToFileURL } from 'node:url';

const help = `Usage: node tools/check-licenses.mjs [command]

Verifies that every resolved dependency carries a licence allowed by
docs/development/LICENSE-POLICY.md. Unknown licences and unexpected report
shapes fail by default.

Commands:
  (none)   Verify all resolved dependency licences.
  --list   Print the resolved licences and their package counts.
  --help   Show this help.

Exit codes:
  0  Every dependency carries an allowed licence.
  1  A disallowed or unknown licence, or an unusable licence report.
  2  Usage or input error.
`;

/**
 * Allowed licences per docs/development/LICENSE-POLICY.md.
 *
 * Permissive licences plus MPL-2.0, whose copyleft is file-scoped and does not
 * reach the code of this repository. Everything else, in particular the GPL,
 * LGPL, AGPL and SSPL families, needs a documented owner decision first.
 */
export const allowedLicenses = new Set([
  '0BSD',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'BlueOak-1.0.0',
  'ISC',
  'MIT',
  'MPL-2.0',
]);

/**
 * @typedef {{ name: string, versions: string[] }} LicensePackage
 * @typedef {Record<string, LicensePackage[]>} LicenseReport
 */

export class LicenseReportError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = 'LicenseReportError';
  }
}

/**
 * Resolves an SPDX expression against the allowlist.
 *
 * `OR` passes when any operand is allowed, `AND` only when all are. Anything
 * that is not a plain identifier or one of these two forms fails closed, so an
 * unparsed expression can never silently pass.
 *
 * @param {unknown} expression
 * @returns {boolean}
 */
export function isAllowed(expression) {
  if (typeof expression !== 'string') {
    return false;
  }
  const normalized = expression
    .trim()
    .replace(/^\((.*)\)$/su, '$1')
    .trim();
  if (!normalized) {
    return false;
  }
  if (/\sOR\s/iu.test(normalized) && !/\sAND\s/iu.test(normalized)) {
    return normalized.split(/\sOR\s/iu).some((part) => isAllowed(part));
  }
  if (/\sAND\s/iu.test(normalized) && !/\sOR\s/iu.test(normalized)) {
    return normalized.split(/\sAND\s/iu).every((part) => isAllowed(part));
  }
  return allowedLicenses.has(normalized.replace(/\+$/u, ''));
}

/**
 * Rejects any report whose shape is not exactly what the violation scan relies
 * on.
 *
 * Without this the scan would iterate an empty list for a malformed bucket and
 * report success for a disallowed licence, which would defeat the purpose of a
 * default-deny gate.
 *
 * @param {unknown} report
 * @returns {LicenseReport}
 */
export function assertLicenseReport(report) {
  if (report === null || typeof report !== 'object' || Array.isArray(report)) {
    throw new LicenseReportError('The licence report is not an object.');
  }
  for (const [license, packages] of Object.entries(
    /** @type {Record<string, unknown>} */ (report),
  )) {
    if (license.trim() === '') {
      throw new LicenseReportError('The licence report contains an empty licence name.');
    }
    if (!Array.isArray(packages)) {
      throw new LicenseReportError(`The licence report entry for ${license} is not a list.`);
    }
    if (packages.length === 0) {
      throw new LicenseReportError(`The licence report entry for ${license} is empty.`);
    }
    for (const candidate of packages) {
      if (candidate === null || typeof candidate !== 'object' || Array.isArray(candidate)) {
        throw new LicenseReportError(`The licence report entry for ${license} is malformed.`);
      }
      const entry = /** @type {{ name?: unknown, versions?: unknown }} */ (candidate);
      if (typeof entry.name !== 'string' || entry.name.trim() === '') {
        throw new LicenseReportError(`A package under ${license} has no usable name.`);
      }
      if (!Array.isArray(entry.versions) || entry.versions.length === 0) {
        throw new LicenseReportError(`Package ${entry.name} under ${license} has no versions.`);
      }
    }
  }
  return /** @type {LicenseReport} */ (report);
}

/**
 * Returns one sorted line per package whose licence is not allowed.
 *
 * @param {unknown} report
 * @returns {string[]}
 */
export function collectViolations(report) {
  const validated = assertLicenseReport(report);
  /** @type {string[]} */
  const violations = [];
  for (const [license, packages] of Object.entries(validated)) {
    if (isAllowed(license)) {
      continue;
    }
    for (const entry of packages) {
      violations.push(`  ${entry.name}@${entry.versions.join(', ')}: ${license}`);
    }
  }
  return violations.toSorted();
}

/**
 * @param {string} message
 * @param {number} exitCode
 */
function fail(message, exitCode) {
  stderr.write(`${message}\n`);
  process.exitCode = exitCode;
}

/** @returns {LicenseReport} */
function readLicenseReport() {
  const output = execFileSync('pnpm', ['licenses', 'list', '--json'], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  return assertLicenseReport(JSON.parse(output));
}

/** @param {string | undefined} command */
export function main(command) {
  if (command === '--help' || command === '-h') {
    stdout.write(help);
    return;
  }
  if (command !== undefined && command !== '--list') {
    stderr.write(help);
    fail('Expected no command, --list, or --help.', 2);
    return;
  }

  let report;
  try {
    report = readLicenseReport();
  } catch (error) {
    const detail = error instanceof LicenseReportError ? ` ${error.message}` : '';
    fail(`Licence verification could not read the resolved dependency tree.${detail}`, 1);
    return;
  }

  if (command === '--list') {
    const rows = Object.entries(report)
      .map(
        ([license, packages]) =>
          /** @type {[license: string, count: number]} */ ([license, packages.length]),
      )
      .toSorted((left, right) => right[1] - left[1]);
    for (const [license, count] of rows) {
      stdout.write(`${String(count).padStart(5)}  ${license}\n`);
    }
    return;
  }

  const violations = collectViolations(report);
  if (violations.length > 0) {
    fail(
      [
        'Disallowed dependency licences found:',
        ...violations,
        '',
        'See docs/development/LICENSE-POLICY.md. A new licence needs a documented',
        'owner decision before it may be added to the allowlist.',
      ].join('\n'),
      1,
    );
  }
}

// Only run as a command line tool, so that the pure helpers above stay
// importable from the regression tests.
if (argv[1] && import.meta.url === pathToFileURL(argv[1]).href) {
  main(argv[2]);
}
