import { describe, expect, it } from 'vitest';

import {
  ConfigurationError,
  loadApiRuntimeConfig,
  loadTelemetryRuntimeConfig,
  loadWorkerRuntimeConfig,
} from '../src/index.js';

describe('server runtime configuration', () => {
  it('accepts an explicit local development API configuration', () => {
    expect(
      loadApiRuntimeConfig({
        SOSEBAMA_API_HOST: 'localhost',
        SOSEBAMA_API_PORT: '4310',
        SOSEBAMA_ENVIRONMENT: 'DEV',
      }),
    ).toEqual({
      environment: 'DEV',
      host: 'localhost',
      port: 4310,
    });
  });

  it('rejects an ephemeral API port in explicit runtime configuration', () => {
    expect(() =>
      loadApiRuntimeConfig({
        SOSEBAMA_API_HOST: 'localhost',
        SOSEBAMA_API_PORT: '0',
        SOSEBAMA_ENVIRONMENT: 'DEV',
      }),
    ).toThrow(ConfigurationError);
  });

  it('accepts only explicit loopback hosts in DEV', () => {
    for (const host of ['localhost', '127.0.0.1', '::1']) {
      expect(
        loadApiRuntimeConfig({
          SOSEBAMA_API_HOST: host,
          SOSEBAMA_API_PORT: '4310',
          SOSEBAMA_ENVIRONMENT: 'DEV',
        }).host,
      ).toBe(host);
    }
  });

  it('accepts the internal all-interfaces bind only in the DEV container context', () => {
    expect(
      loadApiRuntimeConfig(
        {
          SOSEBAMA_API_HOST: '0.0.0.0',
          SOSEBAMA_API_PORT: '4310',
          SOSEBAMA_ENVIRONMENT: 'DEV',
        },
        'container',
      ),
    ).toEqual({
      environment: 'DEV',
      host: '0.0.0.0',
      port: 4310,
    });
  });

  it('rejects non-loopback hosts in DEV without echoing their contents', () => {
    for (const host of ['0.0.0.0', '192.0.2.1']) {
      expect(() =>
        loadApiRuntimeConfig({
          SOSEBAMA_API_HOST: host,
          SOSEBAMA_API_PORT: '4310',
          SOSEBAMA_ENVIRONMENT: 'DEV',
        }),
      ).toThrowError(/SOSEBAMA_API_HOST(?!.*(?:0\.0\.0\.0|192\.0\.2\.1))/u);
    }
  });

  it('rejects invalid container hosts without echoing their contents', () => {
    expect(() =>
      loadApiRuntimeConfig(
        {
          SOSEBAMA_API_HOST: '192.0.2.1',
          SOSEBAMA_API_PORT: '4310',
          SOSEBAMA_ENVIRONMENT: 'DEV',
        },
        'container',
      ),
    ).toThrowError(/SOSEBAMA_API_HOST(?!.*192\.0\.2\.1)/u);
  });

  it('does not allow environment variables to select the container bind context', () => {
    expect(() =>
      loadApiRuntimeConfig({
        SOSEBAMA_API_HOST: '0.0.0.0',
        SOSEBAMA_API_PORT: '4310',
        SOSEBAMA_ENVIRONMENT: 'DEV',
        SOSEBAMA_RUNTIME_CONTEXT: 'container',
      }),
    ).toThrowError(/SOSEBAMA_API_HOST/u);
  });

  it('rejects TST and PRD for API and worker without echoing the environment', () => {
    for (const runtime of ['TST', 'PRD']) {
      expect(() =>
        loadApiRuntimeConfig({
          SOSEBAMA_API_HOST: 'localhost',
          SOSEBAMA_API_PORT: '4310',
          SOSEBAMA_ENVIRONMENT: runtime,
        }),
      ).toThrowError(/SOSEBAMA_ENVIRONMENT(?!.*(?:TST|PRD))/u);
      expect(() => loadWorkerRuntimeConfig({ SOSEBAMA_ENVIRONMENT: runtime })).toThrowError(
        /SOSEBAMA_ENVIRONMENT(?!.*(?:TST|PRD))/u,
      );
    }
  });

  it('rejects non-decimal port syntax', () => {
    for (const port of ['1e3', '0x50', '04310']) {
      expect(() =>
        loadApiRuntimeConfig({
          SOSEBAMA_API_HOST: 'localhost',
          SOSEBAMA_API_PORT: port,
          SOSEBAMA_ENVIRONMENT: 'DEV',
        }),
      ).toThrow(ConfigurationError);
    }
  });

  it('exposes only a port for worker health, never a bind address', () => {
    const config = loadWorkerRuntimeConfig({ SOSEBAMA_ENVIRONMENT: 'DEV' });

    expect(config).toEqual({ environment: 'DEV', health: { port: 3001 } });

    // The bind address is not part of the configuration surface at all, so no
    // variable and no caller can widen it. It is a constant at the network
    // sink in the worker itself.
    expect(Object.keys(config.health)).toEqual(['port']);
  });

  it('accepts an explicit worker health port and treats a blank value as unset', () => {
    expect(
      loadWorkerRuntimeConfig({
        SOSEBAMA_ENVIRONMENT: 'DEV',
        SOSEBAMA_WORKER_HEALTH_PORT: '4311',
      }).health,
    ).toEqual({ port: 4311 });

    expect(
      loadWorkerRuntimeConfig({
        SOSEBAMA_ENVIRONMENT: 'DEV',
        SOSEBAMA_WORKER_HEALTH_PORT: '   ',
      }).health.port,
    ).toBe(3001);
  });

  it('rejects a malformed worker health port without echoing its value', () => {
    for (const port of ['0', '65536', '1e3', '0x50', '04310']) {
      expect(() =>
        loadWorkerRuntimeConfig({
          SOSEBAMA_ENVIRONMENT: 'DEV',
          SOSEBAMA_WORKER_HEALTH_PORT: port,
        }),
      ).toThrow(ConfigurationError);
    }

    expect(() =>
      loadWorkerRuntimeConfig({
        SOSEBAMA_ENVIRONMENT: 'DEV',
        SOSEBAMA_WORKER_HEALTH_PORT: 'private-value',
      }),
    ).toThrowError(/SOSEBAMA_WORKER_HEALTH_PORT(?!.*private-value)/u);
  });

  it('never lets the environment turn the worker into a reachable network service', () => {
    // No variable, however plausibly named, may introduce a bind address.
    const config = loadWorkerRuntimeConfig({
      SOSEBAMA_API_HOST: '0.0.0.0',
      SOSEBAMA_ENVIRONMENT: 'DEV',
      SOSEBAMA_WORKER_HEALTH_HOST: '0.0.0.0',
    });

    expect(config.health).toEqual({ port: 3001 });
    expect(JSON.stringify(config)).not.toContain('0.0.0.0');
  });

  it('rejects missing and malformed values without echoing their contents', () => {
    expect(() => loadWorkerRuntimeConfig({})).toThrow(
      'Invalid configuration variable SOSEBAMA_ENVIRONMENT',
    );

    expect(() =>
      loadApiRuntimeConfig({
        SOSEBAMA_API_HOST: 'localhost',
        SOSEBAMA_API_PORT: 'private-value',
        SOSEBAMA_ENVIRONMENT: 'DEV',
      }),
    ).toThrowError(/SOSEBAMA_API_PORT(?!.*private-value)/u);
  });

  it('keeps telemetry export disabled by default', () => {
    expect(loadTelemetryRuntimeConfig({})).toEqual({ exporter: 'none' });
  });

  it.each([
    ['http://127.0.0.1:4318/base/', 'http://127.0.0.1:4318/base'],
    ['https://[::1]:4318/base/', 'https://[::1]:4318/base'],
    ['http://localhost:4318/', 'http://localhost:4318'],
  ])('accepts the local OTLP base endpoint %s', (input, expected) => {
    expect(
      loadTelemetryRuntimeConfig({
        OTEL_EXPORTER_OTLP_ENDPOINT: input,
        SOSEBAMA_TELEMETRY_EXPORTER: 'otlp',
      }),
    ).toEqual({ endpoint: expected, exporter: 'otlp' });
  });

  it('rejects unsafe telemetry exporters and endpoints without echoing their values', () => {
    expect(() =>
      loadTelemetryRuntimeConfig({ SOSEBAMA_TELEMETRY_EXPORTER: 'private-exporter' }),
    ).toThrowError(/SOSEBAMA_TELEMETRY_EXPORTER(?!.*private-exporter)/u);
    expect(() =>
      loadTelemetryRuntimeConfig({
        OTEL_EXPORTER_OTLP_ENDPOINT:
          'https://private-user:private-value@external.invalid/path?token=x',
        SOSEBAMA_TELEMETRY_EXPORTER: 'otlp',
      }),
    ).toThrowError(
      /OTEL_EXPORTER_OTLP_ENDPOINT(?!.*(?:private-user|private-value|external|token))/u,
    );
  });

  it.each([
    'OTEL_EXPORTER_OTLP_HEADERS',
    'OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY',
    'OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE',
    'OTEL_EXPORTER_OTLP_TIMEOUT',
    'otel_exporter_otlp_headers',
    'Otel_Exporter_Otlp_Traces_Client_Key',
  ])('rejects unsupported OTLP environment input %s without echoing its value', (variable) => {
    expect(() =>
      loadTelemetryRuntimeConfig({
        OTEL_EXPORTER_OTLP_ENDPOINT: 'http://127.0.0.1:4318',
        SOSEBAMA_TELEMETRY_EXPORTER: 'otlp',
        [variable]: 'private-otel-value',
      }),
    ).toThrowError(/OTEL_EXPORTER_OTLP_\*(?!.*private-otel-value)/u);
  });

  it.each(['http://collector:4318', 'https://external.invalid/v1', 'http://192.168.1.5:4318'])(
    'rejects the non-loopback OTLP endpoint %s without echoing it',
    (endpoint) => {
      expect(() =>
        loadTelemetryRuntimeConfig({
          OTEL_EXPORTER_OTLP_ENDPOINT: endpoint,
          SOSEBAMA_TELEMETRY_EXPORTER: 'otlp',
        }),
      ).toThrowError(new RegExp(`OTEL_EXPORTER_OTLP_ENDPOINT(?!.*${endpoint})`, 'u'));
    },
  );
});
