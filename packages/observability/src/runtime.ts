import { ROOT_CONTEXT, SpanStatusCode, defaultTextMapSetter, trace } from '@opentelemetry/api';
import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
  type PushMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor, type SpanExporter } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import pino, { type DestinationStream } from 'pino';

export type RuntimeEnvironmentName = 'DEV' | 'unvalidated';
export type RuntimeRole = 'api' | 'worker';
export type RuntimeFailureCategory = 'configuration' | 'runtime';
export type RuntimeFailureStage = 'shutdown' | 'startup';
export type TelemetryExporterConfig = { exporter: 'none' } | { endpoint: string; exporter: 'otlp' };

export interface RuntimeLogStreams {
  stderr: DestinationStream;
  stdout: DestinationStream;
}

export interface RuntimeFailureReporter {
  failed(stage: RuntimeFailureStage, category: RuntimeFailureCategory): void;
}

export interface RuntimePropagationSpan {
  end(outcome: 'error' | 'ok'): void;
  inject(carrier: Record<string, string>): void;
}

export interface RuntimeObservabilityOptions {
  environment: 'DEV';
  role: RuntimeRole;
  telemetry: TelemetryExporterConfig;
}

export interface RuntimeObservability {
  failed(stage: RuntimeFailureStage): void;
  flush(): Promise<void>;
  propagationSpan(): RuntimePropagationSpan;
  shutdown(): Promise<void>;
  started(): void;
  stopped(): void;
}

export interface RuntimeObservabilityDependencies {
  exporters?: {
    metrics: PushMetricExporter;
    traces: SpanExporter;
  };
  streams?: RuntimeLogStreams;
}

type RuntimeLogEvent =
  | 'runtime.failed'
  | 'runtime.shutdown-failed'
  | 'runtime.started'
  | 'runtime.stopped'
  | 'telemetry.flush-failed'
  | 'telemetry.shutdown-failed';

interface RuntimeLogAttributes {
  category?: RuntimeFailureCategory;
  stage?: RuntimeFailureStage;
}

interface BoundedRuntimeLogger {
  error(event: RuntimeLogEvent, attributes?: RuntimeLogAttributes): void;
  info(event: RuntimeLogEvent, attributes?: RuntimeLogAttributes): void;
}

const exportTimeoutMillis = 1_000;

function validateRole(role: RuntimeRole): RuntimeRole {
  if (role !== 'api' && role !== 'worker') {
    throw new Error('Invalid runtime role.');
  }
  return role;
}

function validateEnvironment(environment: RuntimeEnvironmentName): RuntimeEnvironmentName {
  if (environment !== 'DEV' && environment !== 'unvalidated') {
    throw new Error('Invalid runtime environment.');
  }
  return environment;
}

function normalizeStage(stage: RuntimeFailureStage): RuntimeFailureStage {
  return stage === 'shutdown' ? 'shutdown' : 'startup';
}

function normalizeCategory(category: RuntimeFailureCategory): RuntimeFailureCategory {
  return category === 'configuration' ? 'configuration' : 'runtime';
}

function createBoundedRuntimeLogger(
  roleInput: RuntimeRole,
  environmentInput: RuntimeEnvironmentName,
  streams: RuntimeLogStreams = { stderr: process.stderr, stdout: process.stdout },
): BoundedRuntimeLogger {
  const role = validateRole(roleInput);
  const environment = validateEnvironment(environmentInput);
  const options: pino.LoggerOptions = {
    base: { environment, role, service: `sobama-${role}` },
    level: 'info',
  };
  const stdout = pino(options, streams.stdout);
  const stderr = pino(options, streams.stderr);
  const record = (event: RuntimeLogEvent, attributes: RuntimeLogAttributes) => ({
    ...(attributes.category ? { category: normalizeCategory(attributes.category) } : {}),
    event,
    ...(attributes.stage ? { stage: normalizeStage(attributes.stage) } : {}),
  });
  return {
    error: (event, attributes = {}) => stderr.error(record(event, attributes)),
    info: (event, attributes = {}) => stdout.info(record(event, attributes)),
  };
}

export function createRuntimeFailureReporterCore(
  role: RuntimeRole,
  environment: RuntimeEnvironmentName,
  streams?: RuntimeLogStreams,
): RuntimeFailureReporter {
  const logger = createBoundedRuntimeLogger(role, environment, streams);
  return {
    failed: (stageInput, categoryInput) => {
      const stage = normalizeStage(stageInput);
      const category = normalizeCategory(categoryInput);
      logger.error(stage === 'shutdown' ? 'runtime.shutdown-failed' : 'runtime.failed', {
        category,
        stage,
      });
    },
  };
}

function signalEndpoint(endpoint: string, signal: 'metrics' | 'traces'): string {
  return `${endpoint.replace(/\/+$/u, '')}/v1/${signal}`;
}

function validateTelemetryConfig(telemetry: TelemetryExporterConfig): TelemetryExporterConfig {
  if (telemetry.exporter === 'none') {
    return telemetry;
  }
  if (telemetry.exporter !== 'otlp') {
    throw new Error('Invalid local telemetry configuration.');
  }
  let endpoint: URL;
  try {
    endpoint = new URL(telemetry.endpoint);
  } catch {
    throw new Error('Invalid local telemetry configuration.');
  }
  if (
    !['http:', 'https:'].includes(endpoint.protocol) ||
    !new Set(['127.0.0.1', '[::1]', 'localhost']).has(endpoint.hostname) ||
    endpoint.username ||
    endpoint.password ||
    endpoint.search ||
    endpoint.hash
  ) {
    throw new Error('Invalid local telemetry configuration.');
  }
  return {
    endpoint: `${endpoint.origin}${endpoint.pathname.replace(/\/+$/u, '')}`,
    exporter: 'otlp',
  };
}

function createExporters(
  telemetry: TelemetryExporterConfig,
  overrides: RuntimeObservabilityDependencies['exporters'],
): RuntimeObservabilityDependencies['exporters'] {
  if (telemetry.exporter === 'none') {
    return undefined;
  }
  if (overrides) {
    return overrides;
  }
  return {
    metrics: new OTLPMetricExporter({
      timeoutMillis: exportTimeoutMillis,
      url: signalEndpoint(telemetry.endpoint, 'metrics'),
    }),
    traces: new OTLPTraceExporter({
      timeoutMillis: exportTimeoutMillis,
      url: signalEndpoint(telemetry.endpoint, 'traces'),
    }),
  };
}

export function createRuntimeObservabilityCore(
  options: RuntimeObservabilityOptions,
  dependencies: RuntimeObservabilityDependencies = {},
): RuntimeObservability {
  const role = validateRole(options.role);
  const environment = validateEnvironment(options.environment);
  const logger = createBoundedRuntimeLogger(role, environment, dependencies.streams);
  const resource = resourceFromAttributes({
    'deployment.environment.name': environment,
    'service.name': `sobama-${role}`,
    'service.namespace': 'sosebama',
  });
  const telemetry = validateTelemetryConfig(options.telemetry);
  const exporters = createExporters(telemetry, dependencies.exporters);
  const metricReader = exporters
    ? new PeriodicExportingMetricReader({
        cardinalityLimits: { default: 16 },
        exporter: exporters.metrics,
      })
    : undefined;
  const meterProvider = new MeterProvider({
    readers: metricReader ? [metricReader] : [],
    resource,
  });
  const tracerProvider = new NodeTracerProvider({
    resource,
    spanProcessors: exporters ? [new BatchSpanProcessor(exporters.traces)] : [],
  });
  const meter = meterProvider.getMeter('@sobama/observability', '0.0.0');
  const tracer = tracerProvider.getTracer('@sobama/observability', '0.0.0');
  const startedCounter = meter.createCounter('sobama.runtime.started', {
    description: 'Number of successful runtime starts.',
  });
  const failedCounter = meter.createCounter('sobama.runtime.failed', {
    description: 'Number of runtime startup or shutdown failures.',
  });
  const propagator = new W3CTraceContextPropagator();

  const startSpan = (
    name:
      | 'runtime.failed'
      | 'runtime.propagation'
      | 'runtime.shutdown-failed'
      | 'runtime.started'
      | 'runtime.stopped',
  ): RuntimePropagationSpan => {
    const current = tracer.startSpan(name);
    const spanContext = trace.setSpan(ROOT_CONTEXT, current);
    return {
      end: (outcome) => {
        current.setStatus({ code: outcome === 'ok' ? SpanStatusCode.OK : SpanStatusCode.ERROR });
        current.end();
      },
      inject: (carrier) => propagator.inject(spanContext, carrier, defaultTextMapSetter),
    };
  };

  const record = (
    event: 'runtime.failed' | 'runtime.shutdown-failed' | 'runtime.started' | 'runtime.stopped',
  ) => {
    const current = startSpan(event);
    if (event === 'runtime.failed' || event === 'runtime.shutdown-failed') {
      failedCounter.add(1);
      current.end('error');
    } else {
      if (event === 'runtime.started') {
        startedCounter.add(1);
      }
      current.end('ok');
    }
  };

  const flush = async () => {
    try {
      await Promise.all([meterProvider.forceFlush(), tracerProvider.forceFlush()]);
    } catch {
      logger.error('telemetry.flush-failed');
    }
  };

  return {
    failed: (stageInput) => {
      const stage = normalizeStage(stageInput);
      const event = stage === 'startup' ? 'runtime.failed' : 'runtime.shutdown-failed';
      logger.error(event, { stage });
      record(event);
    },
    flush,
    propagationSpan: () => startSpan('runtime.propagation'),
    shutdown: async () => {
      await flush();
      const results = await Promise.allSettled([
        meterProvider.shutdown(),
        tracerProvider.shutdown(),
      ]);
      if (results.some((result) => result.status === 'rejected')) {
        logger.error('telemetry.shutdown-failed');
      }
    },
    started: () => {
      logger.info('runtime.started');
      record('runtime.started');
    },
    stopped: () => {
      logger.info('runtime.stopped');
      record('runtime.stopped');
    },
  };
}
