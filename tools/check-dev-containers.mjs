#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const help = `Usage: node tools/check-dev-containers.mjs <command>

Commands:
  browser-build  Build the sanitized test-only browser runtime from its pinned source.
  health   Verify that every DEV role reports a healthy container health state.
  smoke    Verify gateway, web, and API through the local DEV host ingress.
  browser  Run the Chromium smoke of the SPA delivery inside the DEV network.
  logs     Verify bounded JSON startup logs from API and worker.
  cleanup  Fail if sosebama-dev containers or networks remain.
  --help   Show this help.

Environment for health, logs, and smoke:
  SOSEBAMA_DEV_GATEWAY_PORT  Required local loopback port (1-65535).

Environment for browser:
  SOSEBAMA_BROWSER_IMAGE_ID  Optional sha256 image ID already scanned by CI.
                            Otherwise inspect the locally built runtime tag.

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

/**
 * Runs the Chromium smoke by immutable local ID of the sanitized test image.
 *
 * The container joins the `internal` DEV application network, so it reaches the
 * gateway by service name. That is the point of the exercise: no host network,
 * no published port, and no route out of the network at all. The browser can
 * only load what this repository produced.
 *
 * The hardening flags mirror the Compose runtime hardening. `pids_limit`
 * deliberately differs: Chromium runs a process per renderer and utility, and
 * the value used for the application roles would starve it.
 */
function browserRuntime() {
  const declared = JSON.parse(readFileSync('containers/browser-runtime.json', 'utf8'));
  const recipe = readFileSync('containers/browser.Dockerfile', 'utf8');
  if (
    !/^mcr\.microsoft\.com\/playwright:v\d+\.\d+\.\d+-noble@sha256:[a-f\d]{64}$/u.test(
      declared.image ?? '',
    ) ||
    declared.runtimeImage !== 'sosebama-browser:dev' ||
    /^FROM (\S+) AS prepared$/mu.exec(recipe)?.[1] !== declared.image
  ) {
    throw new Error('Invalid pinned browser runtime declaration.');
  }
  return { ...declared, recipeDigest: createHash('sha256').update(recipe).digest('hex') };
}

function buildBrowserRuntime() {
  try {
    const declared = browserRuntime();
    execFileSync(
      'docker',
      [
        'build',
        '--file',
        'containers/browser.Dockerfile',
        '--tag',
        declared.runtimeImage,
        '--label',
        `org.opencontainers.image.base.name=${declared.image}`,
        '--label',
        'io.sosebama.browser-runtime=flattened-v1',
        '--label',
        `io.sosebama.browser-recipe=${declared.recipeDigest}`,
        '.',
      ],
      { stdio: 'inherit' },
    );
  } catch {
    fail('Browser runtime build failed; do not fall back to the manufacturer image.', 1);
  }
}

function verifyBrowserSmoke() {
  let network;
  let image;
  try {
    network = execFileSync(
      'docker',
      [
        'network',
        'ls',
        '--filter',
        'label=com.docker.compose.project=sosebama-dev',
        '--filter',
        'label=com.docker.compose.network=application',
        '--format',
        '{{.Name}}',
      ],
      { encoding: 'utf8' },
    ).trim();
    const declared = browserRuntime();
    const expectedID = process.env.SOSEBAMA_BROWSER_IMAGE_ID;
    if (expectedID !== undefined && !/^sha256:[a-f\d]{64}$/u.test(expectedID)) {
      fail('SOSEBAMA_BROWSER_IMAGE_ID must be a full sha256 image ID.', 2);
      return;
    }
    const inspected = JSON.parse(
      execFileSync('docker', ['image', 'inspect', expectedID ?? declared.runtimeImage], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }),
    )[0];
    if (
      !/^sha256:[a-f\d]{64}$/u.test(inspected?.Id ?? '') ||
      inspected.Config?.Labels?.['org.opencontainers.image.base.name'] !== declared.image ||
      inspected.Config?.Labels?.['io.sosebama.browser-runtime'] !== 'flattened-v1' ||
      inspected.Config?.Labels?.['io.sosebama.browser-recipe'] !== declared.recipeDigest
    ) {
      fail('Expected the locally built sanitized browser runtime; run pnpm browser:build.', 1);
      return;
    }
    image = inspected.Id;
  } catch {
    fail(
      'Browser smoke could not inspect DEV resources or the built runtime; run pnpm browser:build.',
      1,
    );
    return;
  }

  if (!network || network.includes('\n')) {
    fail('Expected exactly one internal DEV application network; start the stack first.', 1);
    return;
  }

  // The isolation claimed above is a property of the network, not of the label
  // that found it. Asserting it here makes the guarantee executable instead of
  // leaving it to the Compose file staying unchanged.
  try {
    const internal = execFileSync(
      'docker',
      ['network', 'inspect', network, '--format', '{{.Internal}}'],
      { encoding: 'utf8' },
    ).trim();
    if (internal !== 'true') {
      fail(`DEV network ${network} is not internal; refusing to run the browser there.`, 1);
      return;
    }
  } catch {
    fail('Browser smoke could not confirm that the DEV network is internal.', 1);
    return;
  }

  try {
    execFileSync(
      'docker',
      [
        'run',
        '--rm',
        '--pull',
        'never',
        '--init',
        '--network',
        network,
        '--user',
        '1000:1000',
        '--read-only',
        '--cap-drop',
        'ALL',
        '--security-opt',
        'no-new-privileges:true',
        '--pids-limit',
        '512',
        '--tmpfs',
        '/tmp:rw,nosuid,nodev,size=512m,uid=1000,gid=1000,mode=1777',
        '--volume',
        `${process.cwd()}:/workspace:ro`,
        '--workdir',
        '/workspace',
        '--env',
        'HOME=/tmp',
        '--env',
        'SOSEBAMA_SMOKE_BASE_URL=http://gateway:8080',
        image,
        'node_modules/.bin/playwright',
        'test',
        '--config',
        'playwright.config.ts',
      ],
      { stdio: 'inherit' },
    );
  } catch {
    fail('Chromium smoke of the SPA delivery failed.', 1);
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
} else if (command === 'browser') {
  verifyBrowserSmoke();
} else if (command === 'browser-build') {
  buildBrowserRuntime();
} else if (command === 'logs') {
  verifyRuntimeLogs();
} else if (command === 'cleanup') {
  verifyCleanup();
} else {
  process.stderr.write(help);
  fail('Expected one command: health, smoke, browser-build, browser, logs, or cleanup.', 2);
}
