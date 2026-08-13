#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const help = `Usage: node tools/check-dev-containers.mjs <command>

Commands:
  health   Verify that every DEV role reports a healthy container health state.
  smoke    Verify gateway, web, and API through the local DEV host ingress.
  logs     Verify bounded JSON startup logs from API and worker.
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

/**
 * The worker publishes no port and sits on an internal network, so its health
 * is not observable through the host ingress. The container health state is the
 * only external evidence that its probes actually answer.
 */
function verifyContainerHealth() {
  try {
    const output = execFileSync(
      'docker',
      [
        'compose',
        '-f',
        'compose.yaml',
        '-f',
        'compose.dev.yaml',
        'ps',
        '--all',
        '--format',
        'json',
      ],
      { encoding: 'utf8' },
    );
    const trimmed = output.trim();
    const records = trimmed.startsWith('[')
      ? JSON.parse(trimmed)
      : trimmed
          .split('\n')
          .filter(Boolean)
          .map((line) => JSON.parse(line));

    for (const service of ['api', 'gateway', 'web', 'worker']) {
      const record = records.find((candidate) => candidate.Service === service);
      if (record?.Health !== 'healthy') {
        fail(`DEV ${service} container does not report a healthy state.`, 1);
        return;
      }
    }
  } catch {
    fail('DEV container health verification failed.', 1);
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

function verifyRuntimeLogs() {
  try {
    const output = execFileSync(
      'docker',
      [
        'compose',
        '-f',
        'compose.yaml',
        '-f',
        'compose.dev.yaml',
        'logs',
        '--no-color',
        '--no-log-prefix',
        'api',
        'worker',
      ],
      { encoding: 'utf8' },
    );
    const records = output
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    for (const role of ['api', 'worker']) {
      const record = records.find((candidate) => candidate.role === role);
      if (
        record?.environment !== 'DEV' ||
        record.event !== 'runtime.started' ||
        record.service !== `sobama-${role}` ||
        Object.hasOwn(record, 'hostname') ||
        Object.hasOwn(record, 'pid')
      ) {
        fail(`DEV ${role} startup log does not match the bounded JSON contract.`, 1);
        return;
      }
    }
  } catch {
    fail('DEV runtime log verification failed.', 1);
  }
}

const command = process.argv[2];
if (command === '--help' || command === '-h') {
  process.stdout.write(help);
} else if (command === 'health') {
  verifyContainerHealth();
} else if (command === 'smoke') {
  await verifyHostIngress();
} else if (command === 'logs') {
  verifyRuntimeLogs();
} else if (command === 'cleanup') {
  verifyCleanup();
} else {
  process.stderr.write(help);
  fail('Expected one command: health, smoke, logs, or cleanup.', 2);
}
