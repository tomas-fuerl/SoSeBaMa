export type RuntimeEnvironment = 'DEV';

export type EnvironmentSource = Readonly<Record<string, string | undefined>>;

export interface ApiRuntimeConfig {
  environment: RuntimeEnvironment;
  host: string;
  port: number;
}

export interface WorkerRuntimeConfig {
  environment: RuntimeEnvironment;
}

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

function readApiHost(environment: EnvironmentSource): string {
  const host = readRequired(environment, 'SOSEBAMA_API_HOST');
  const developmentLoopbacks = new Set(['localhost', '127.0.0.1', '::1']);
  if (!developmentLoopbacks.has(host)) {
    throw new ConfigurationError('SOSEBAMA_API_HOST', 'DEV requires localhost, 127.0.0.1, or ::1');
  }
  return host;
}

function readApiPort(environment: EnvironmentSource): number {
  const value = readRequired(environment, 'SOSEBAMA_API_PORT');
  if (!/^[1-9]\d{0,4}$/u.test(value)) {
    throw new ConfigurationError(
      'SOSEBAMA_API_PORT',
      'expected a decimal integer from 1 through 65535',
    );
  }
  const port = Number(value);
  if (port > 65_535) {
    throw new ConfigurationError(
      'SOSEBAMA_API_PORT',
      'expected a decimal integer from 1 through 65535',
    );
  }
  return port;
}

export function loadApiRuntimeConfig(environment: EnvironmentSource): ApiRuntimeConfig {
  const runtime = readRuntimeEnvironment(environment);
  return {
    environment: runtime,
    host: readApiHost(environment),
    port: readApiPort(environment),
  };
}

export function loadWorkerRuntimeConfig(environment: EnvironmentSource): WorkerRuntimeConfig {
  return {
    environment: readRuntimeEnvironment(environment),
  };
}
