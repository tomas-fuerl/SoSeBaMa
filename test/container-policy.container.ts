import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(fileURLToPath(new URL('../', import.meta.url)));
const serviceNames = ['api', 'gateway', 'web', 'worker'] as const;

interface RenderedNetwork {
  internal?: boolean;
}

interface RenderedPort {
  host_ip?: string;
  published?: string;
  target?: number;
}

interface RenderedHealthcheck {
  test?: string[];
}

interface RenderedService {
  cap_add?: string[];
  cap_drop?: string[];
  devices?: unknown[];
  expose?: string[];
  healthcheck?: RenderedHealthcheck;
  image?: string;
  ipc?: string;
  network_mode?: string;
  networks?: Record<string, unknown>;
  pid?: string;
  pids_limit?: number;
  ports?: RenderedPort[];
  privileged?: boolean;
  pull_policy?: string;
  read_only?: boolean;
  security_opt?: string[];
  tmpfs?: string[];
  user?: string;
  volumes?: unknown[];
}

interface RenderedCompose {
  name?: string;
  networks?: Record<string, RenderedNetwork>;
  services?: Record<string, RenderedService>;
}

function renderCompose(): RenderedCompose {
  const output = execFileSync(
    'docker',
    ['compose', '-f', 'compose.yaml', '-f', 'compose.dev.yaml', 'config', '--format', 'json'],
    {
      cwd: repositoryRoot,
      encoding: 'utf8',
      env: { ...process.env, SOSEBAMA_DEV_GATEWAY_PORT: '18080' },
    },
  );
  return JSON.parse(output) as RenderedCompose;
}

describe('DEV container policy', () => {
  const compose = renderCompose();
  const services = compose.services ?? {};

  it('uses exactly the four intended DEV roles and explicit network boundaries', () => {
    expect(compose.name).toBe('sosebama-dev');
    expect(Object.keys(services).toSorted()).toEqual([...serviceNames].toSorted());
    expect(compose.networks?.application?.internal).toBe(true);
    expect(services.gateway?.networks).toEqual({ application: null, edge: null });

    for (const serviceName of ['api', 'web', 'worker'] as const) {
      expect(services[serviceName]?.networks).toEqual({ application: null });
    }
  });

  it('hardens every container without host networking, bind mounts, or privileges', () => {
    for (const serviceName of serviceNames) {
      const service = services[serviceName];
      expect(service, serviceName).toBeDefined();
      expect(service?.user, serviceName).toBe('1000:1000');
      expect(service?.read_only, serviceName).toBe(true);
      expect(service?.privileged, serviceName).not.toBe(true);
      expect(service?.network_mode, serviceName).not.toBe('host');
      expect(service?.pid, serviceName).toBeUndefined();
      expect(service?.ipc, serviceName).toBeUndefined();
      expect(service?.cap_add ?? [], serviceName).toEqual([]);
      expect(service?.cap_drop, serviceName).toContain('ALL');
      expect(service?.security_opt, serviceName).toContain('no-new-privileges:true');
      expect(service?.pids_limit, serviceName).toBe(128);
      expect(service?.tmpfs, serviceName).toEqual(
        expect.arrayContaining([expect.stringMatching(/^\/tmp:/u)]),
      );
      expect(service?.volumes ?? [], serviceName).toEqual([]);
      expect(service?.devices ?? [], serviceName).toEqual([]);
    }

    expect(JSON.stringify(compose)).not.toContain('docker.sock');
  });

  it('verifies the role and status contract in every healthcheck', () => {
    for (const serviceName of serviceNames) {
      const test = services[serviceName]?.healthcheck?.test ?? [];
      expect(test[0], serviceName).toBe('CMD');
      const probe = test.join(' ');

      // A signal-only probe such as process.kill(1, 0) succeeds for as long as
      // the container exists and can therefore not detect a blocked runtime.
      expect(probe, serviceName).not.toContain('process.kill');
      expect(probe, serviceName).toContain('response.ok');
      expect(probe, serviceName).toContain('body.role');
      expect(probe, serviceName).toContain("body.status!=='ready'");
    }

    // Each role-local check asserts its own role literally.
    for (const serviceName of ['api', 'web', 'worker'] as const) {
      expect(services[serviceName]?.healthcheck?.test?.join(' '), serviceName).toContain(
        `body.role!=='${serviceName}'`,
      );
    }

    // The gateway is the single application entry point and therefore verifies
    // all three ingress roles generically instead of only itself.
    const gateway = services.gateway?.healthcheck?.test?.join(' ') ?? '';
    expect(gateway).toContain('body.role!==role');
    for (const role of ['gateway', 'web', 'api']) {
      expect(gateway, role).toContain(`'${role}'`);
    }
  });

  it('keeps the worker health endpoint off every published and internal port', () => {
    expect(services.worker?.ports ?? []).toEqual([]);
    expect(services.worker?.expose ?? []).toEqual([]);
    expect(services.worker?.healthcheck?.test?.join(' ')).toContain('http://127.0.0.1:');
  });

  it('publishes only Caddy on the selected loopback port', () => {
    expect(services.gateway?.ports).toEqual([
      expect.objectContaining({ host_ip: '127.0.0.1', published: '18080', target: 8080 }),
    ]);
    expect(services.api?.ports ?? []).toEqual([]);
    expect(services.web?.ports ?? []).toEqual([]);
    expect(services.worker?.ports ?? []).toEqual([]);
  });

  it('uses only prebuilt local DEV images without implicit registry pulls', () => {
    for (const serviceName of serviceNames) {
      expect(services[serviceName]?.pull_policy, serviceName).toBe('never');
    }
  });

  it('pins every external Dockerfile base and avoids latest image tags', () => {
    for (const dockerfile of ['containers/backend.Dockerfile', 'containers/web.Dockerfile']) {
      const source = readFileSync(resolve(repositoryRoot, dockerfile), 'utf8');
      const fromLines = source.split('\n').filter((line) => line.startsWith('FROM '));
      expect(fromLines.length, dockerfile).toBeGreaterThan(0);
      const knownStages = new Set<string>();
      for (const line of fromLines) {
        const [, reference, asKeyword, stage] = line.split(/\s+/u);
        if (!reference || !knownStages.has(reference)) {
          expect(reference, line).toMatch(/@sha256:[a-f\d]{64}$/u);
        }
        if (asKeyword?.toUpperCase() === 'AS' && stage) {
          knownStages.add(stage);
        }
      }
      expect(source).not.toMatch(/(?:^|:)latest(?:@|\s|$)/mu);
    }

    for (const service of Object.values(services)) {
      expect(service.image).not.toMatch(/(?:^|:)latest$/u);
    }
  });
});
