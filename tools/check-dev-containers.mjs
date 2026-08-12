#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const help = `Usage: node tools/check-dev-containers.mjs <command>

Commands:
  smoke    Verify gateway, web, and API through the local DEV host ingress.
  cleanup  Fail if sosebama-dev containers or networks remain.
  --help   Show this help.

Environment for smoke:
  SOSEBAMA_DEV_GATEWAY_PORT  Required local loopback port (1-65535).

Exit codes:
  0  Verification passed.
  1  Verification failed.
  2  Usage or input error.
`;

function fail(message, exitCode) {
  process.stderr.write(`${message}\n`);
  process.exitCode = exitCode;
}

async function verifyHostIngress() {
  const port = process.env.SOSEBAMA_DEV_GATEWAY_PORT;
  if (!/^[1-9]\d{0,4}$/u.test(port ?? '') || Number(port) > 65_535) {
    fail('SOSEBAMA_DEV_GATEWAY_PORT must be a decimal port from 1 through 65535.', 2);
    return;
  }

  const checks = [
    ['gateway', '/health/gateway'],
    ['web', '/health.json'],
    ['api', '/api/health/ready'],
  ];
  try {
    await Promise.all(
      checks.map(async ([role, path]) => {
        const response = await fetch(`http://127.0.0.1:${port}${path}`);
        const body = await response.json();
        if (!response.ok || body.role !== role || body.status !== 'ready') {
          throw new Error();
        }
      }),
    );
  } catch {
    fail('DEV host ingress verification failed.', 1);
  }
}

function verifyCleanup() {
  const resources = [
    [
      'container',
      ['ps', '--all', '--filter', 'label=com.docker.compose.project=sosebama-dev', '--quiet'],
    ],
    [
      'network',
      ['network', 'ls', '--filter', 'label=com.docker.compose.project=sosebama-dev', '--quiet'],
    ],
  ];
  try {
    for (const [kind, arguments_] of resources) {
      const remaining = execFileSync('docker', arguments_, { encoding: 'utf8' }).trim();
      if (remaining) {
        fail(`DEV cleanup left ${kind} resources behind.`, 1);
        return;
      }
    }
  } catch {
    fail('DEV cleanup verification could not inspect Docker resources.', 1);
  }
}

const command = process.argv[2];
if (command === '--help' || command === '-h') {
  process.stdout.write(help);
} else if (command === 'smoke') {
  await verifyHostIngress();
} else if (command === 'cleanup') {
  verifyCleanup();
} else {
  process.stderr.write(help);
  fail('Expected one command: smoke or cleanup.', 2);
}
