export type RuntimeEnvironment = 'DEV';

export type EnvironmentSource = Readonly<Record<string, string | undefined>>;

export interface ApiRuntimeConfig {
  environment: RuntimeEnvironment;
  host: string;
  port: number;
}

/**
 * The worker health endpoint is a container-internal diagnostic surface. Only
 * its port is configurable; the bind address is a constant at the network sink
 * in the worker itself, so no configuration value can widen it.
 */
export interface WorkerHealthConfig {
  port: number;
}

export interface WorkerRuntimeConfig {
  environment: RuntimeEnvironment;
  health: WorkerHealthConfig;
}

const DEFAULT_WORKER_HEALTH_PORT = 3001;

export type TelemetryRuntimeConfig = { exporter: 'none' } | { endpoint: string; exporter: 'otlp' };

export type ApiRuntimeContext = 'container' | 'local';

export class ConfigurationError extends Error {
  constructor(variable: string, expectation: string) {
    super(`Invalid configuration variable ${variable}: ${expectation}.`);
    this.name = 'ConfigurationError';
  }
}

function readRequired(environment: EnvironmentSource, variable: string): string {
  const value = environment[variable]?.trim();
  if (!value) {
    throw new ConfigurationError(variable, 'a non-empty value is required');
  }
  return value;
}

function readRuntimeEnvironment(environment: EnvironmentSource): RuntimeEnvironment {
  const value = readRequired(environment, 'SOSEBAMA_ENVIRONMENT');
  if (value !== 'DEV') {
    throw new ConfigurationError('SOSEBAMA_ENVIRONMENT', 'expected DEV for this local runtime');
  }
  return value;
}

function readApiHost(environment: EnvironmentSource, context: ApiRuntimeContext): string {
  const host = readRequired(environment, 'SOSEBAMA_API_HOST');
  if (context === 'container') {
    if (host !== '0.0.0.0') {
      throw new ConfigurationError(
        'SOSEBAMA_API_HOST',
        'container DEV requires the internal all-interfaces bind address',
      );
    }
    return host;
  }

  const developmentLoopbacks = new Set(['localhost', '127.0.0.1', '::1']);
  if (!developmentLoopbacks.has(host)) {
    throw new ConfigurationError(
      'SOSEBAMA_API_HOST',
      'local DEV requires localhost, 127.0.0.1, or ::1',
    );
  }
  return host;
}

function parsePort(variable: string, value: string): number {
  const expectation = 'expected a decimal integer from 1 through 65535';
  if (!/^[1-9]\d{0,4}$/u.test(value)) {
    throw new ConfigurationError(variable, expectation);
  }
  const port = Number(value);
  if (port > 65_535) {
    throw new ConfigurationError(variable, expectation);
  }
  return port;
}

function readApiPort(environment: EnvironmentSource): number {
  return parsePort('SOSEBAMA_API_PORT', readRequired(environment, 'SOSEBAMA_API_PORT'));
}

function readWorkerHealthPort(environment: EnvironmentSource): number {
  const variable = 'SOSEBAMA_WORKER_HEALTH_PORT';
  const value = environment[variable]?.trim();
  if (!value) {
    return DEFAULT_WORKER_HEALTH_PORT;
  }
  return parsePort(variable, value);
}

function readOtlpEndpoint(environment: EnvironmentSource): string {
  const value = readRequired(environment, 'OTEL_EXPORTER_OTLP_ENDPOINT');
  const expectation =
    'expected an absolute loopback HTTP or HTTPS URL without credentials, query, or fragment';
  let endpoint: URL;
  try {
    endpoint = new URL(value);
  } catch {
    throw new ConfigurationError('OTEL_EXPORTER_OTLP_ENDPOINT', expectation);
  }
  const loopbackHosts = new Set(['127.0.0.1', '[::1]', 'localhost']);
  if (
    !['http:', 'https:'].includes(endpoint.protocol) ||
    !loopbackHosts.has(endpoint.hostname) ||
    endpoint.username ||
    endpoint.password ||
    endpoint.search ||
    endpoint.hash
  ) {
    throw new ConfigurationError('OTEL_EXPORTER_OTLP_ENDPOINT', expectation);
  }
  return `${endpoint.origin}${endpoint.pathname.replace(/\/+$/u, '')}`;
}

function rejectUnsupportedOtlpEnvironment(environment: EnvironmentSource): void {
  const supportedVariable = 'OTEL_EXPORTER_OTLP_ENDPOINT';
  const hasUnsupportedVariable = Object.keys(environment).some((variable) => {
    const normalizedVariable = variable.toUpperCase();
    return (
      normalizedVariable.startsWith('OTEL_EXPORTER_OTLP_') &&
      normalizedVariable !== supportedVariable
    );
  });
  if (hasUnsupportedVariable) {
    throw new ConfigurationError(
      'OTEL_EXPORTER_OTLP_*',
      'only OTEL_EXPORTER_OTLP_ENDPOINT is supported for local DEV',
    );
  }
}

export function loadTelemetryRuntimeConfig(environment: EnvironmentSource): TelemetryRuntimeConfig {
  const exporter = environment.SOSEBAMA_TELEMETRY_EXPORTER?.trim() || 'none';
  if (exporter === 'none') {
    return { exporter };
  }
  if (exporter === 'otlp') {
    rejectUnsupportedOtlpEnvironment(environment);
    return { endpoint: readOtlpEndpoint(environment), exporter };
  }
  throw new ConfigurationError(
    'SOSEBAMA_TELEMETRY_EXPORTER',
    'expected none or otlp for this runtime',
  );
}

export function loadApiRuntimeConfig(
  environment: EnvironmentSource,
  context: ApiRuntimeContext = 'local',
): ApiRuntimeConfig {
  const runtime = readRuntimeEnvironment(environment);
  return {
    environment: runtime,
    host: readApiHost(environment, context),
    port: readApiPort(environment),
  };
}

export function loadWorkerRuntimeConfig(environment: EnvironmentSource): WorkerRuntimeConfig {
  return {
    environment: readRuntimeEnvironment(environment),
    health: {
      port: readWorkerHealthPort(environment),
    },
  };
}
