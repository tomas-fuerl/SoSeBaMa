#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const help = `Usage: node tools/check-licenses.mjs [command]

Verifies that every resolved dependency carries a licence allowed by
docs/development/LICENSE-POLICY.md. Unknown licences fail by default.

Commands:
  (none)   Verify all resolved dependency licences.
  --list   Print the resolved licences and their package counts.
  --help   Show this help.

Exit codes:
  0  Every dependency carries an allowed licence.
  1  A disallowed or unknown licence was found.
  2  Usage or input error.
`;

/**
 * Allowed licences per docs/development/LICENSE-POLICY.md.
 *
 * Permissive licences plus MPL-2.0, whose copyleft is file-scoped and does not
 * reach the code of this repository. Everything else, in particular the GPL,
 * LGPL, AGPL and SSPL families, needs a documented owner decision first.
 */
const allowed = new Set([
  '0BSD',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'BlueOak-1.0.0',
  'ISC',
  'MIT',
  'MPL-2.0',
]);

function fail(message, exitCode) {
  process.stderr.write(`${message}\n`);
  process.exitCode = exitCode;
}

function readLicenses() {
  const output = execFileSync('pnpm', ['licenses', 'list', '--json'], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  });
  const parsed = JSON.parse(output);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('pnpm did not report a licence object.');
  }
  return parsed;
}

/**
 * Resolves an SPDX expression against the allowlist.
 *
 * `OR` passes when any operand is allowed, `AND` only when all are. Anything
 * that is not a plain identifier or one of these two forms fails closed, so an
 * unparsed expression can never silently pass.
 */
function isAllowed(expression) {
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
  return allowed.has(normalized.replace(/\+$/u, ''));
}

function main() {
  const command = process.argv[2];
  if (command === '--help' || command === '-h') {
    process.stdout.write(help);
    return;
  }
  if (command !== undefined && command !== '--list') {
    process.stderr.write(help);
    fail('Expected no command, --list, or --help.', 2);
    return;
  }

  let licenses;
  try {
    licenses = readLicenses();
  } catch {
    fail('Licence verification could not read the resolved dependency tree.', 1);
    return;
  }

  if (command === '--list') {
    const rows = Object.entries(licenses)
      .map(([license, packages]) => [license, Array.isArray(packages) ? packages.length : 0])
      .toSorted((left, right) => right[1] - left[1]);
    for (const [license, count] of rows) {
      process.stdout.write(`${String(count).padStart(5)}  ${license}\n`);
    }
    return;
  }

  const violations = [];
  for (const [license, packages] of Object.entries(licenses)) {
    if (isAllowed(license)) {
      continue;
    }
    for (const entry of Array.isArray(packages) ? packages : []) {
      const versions = Array.isArray(entry?.versions) ? entry.versions.join(', ') : 'unknown';
      violations.push(`  ${entry?.name ?? 'unknown'}@${versions}: ${license}`);
    }
  }

  if (violations.length > 0) {
    fail(
      [
        'Disallowed dependency licences found:',
        ...violations.toSorted(),
        '',
        'See docs/development/LICENSE-POLICY.md. A new licence needs a documented',
        'owner decision before it may be added to the allowlist.',
      ].join('\n'),
      1,
    );
  }
}

main();
