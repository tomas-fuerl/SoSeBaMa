import { createRuntimeFailureReporterCore, createRuntimeObservabilityCore } from './runtime.js';

export type {
  RuntimeEnvironmentName,
  RuntimeFailureCategory,
  RuntimeFailureReporter,
  RuntimeFailureStage,
  RuntimeObservability,
  RuntimeObservabilityOptions,
  RuntimePropagationSpan,
  RuntimeRole,
  TelemetryExporterConfig,
} from './runtime.js';

import type {
  RuntimeEnvironmentName,
  RuntimeFailureReporter,
  RuntimeObservability,
  RuntimeObservabilityOptions,
  RuntimeRole,
} from './runtime.js';

export function createRuntimeFailureReporter(
  role: RuntimeRole,
  environment: RuntimeEnvironmentName,
): RuntimeFailureReporter {
  return createRuntimeFailureReporterCore(role, environment);
}

export function createRuntimeObservability(
  options: RuntimeObservabilityOptions,
): RuntimeObservability {
  return createRuntimeObservabilityCore(options);
}
