export type RuntimeEnvironment = 'DEV' | 'TST' | 'PRD';

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
  if (value !== 'DEV' && value !== 'TST' && value !== 'PRD') {
    throw new ConfigurationError('SOSEBAMA_ENVIRONMENT', 'expected DEV, TST, or PRD');
  }
  return value;
}

function readApiPort(environment: EnvironmentSource): number {
  const value = readRequired(environment, 'SOSEBAMA_API_PORT');
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new ConfigurationError('SOSEBAMA_API_PORT', 'expected an integer from 1 through 65535');
  }
  return port;
}

export function loadApiRuntimeConfig(environment: EnvironmentSource): ApiRuntimeConfig {
  const runtime = readRuntimeEnvironment(environment);
  return {
    environment: runtime,
    host: readRequired(environment, 'SOSEBAMA_API_HOST'),
    port: readApiPort(environment),
  };
}

export function loadWorkerRuntimeConfig(environment: EnvironmentSource): WorkerRuntimeConfig {
  return {
    environment: readRuntimeEnvironment(environment),
  };
}
