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
export type TelemetryExporterConfig = { exporter: 'none' } | { endpoint: string; exporter: 'otlp' };

export interface RuntimeLogStreams {
  stderr: DestinationStream;
  stdout: DestinationStream;
}

export interface RuntimeLogger {
  error(event: string, attributes?: Readonly<Record<string, unknown>>): void;
  info(event: string, attributes?: Readonly<Record<string, unknown>>): void;
}

interface TelemetryExporterOverrides {
  metrics?: PushMetricExporter;
  traces?: SpanExporter;
}

export interface RuntimeObservabilityOptions {
  environment: 'DEV';
  exporters?: TelemetryExporterOverrides;
  role: RuntimeRole;
  streams?: RuntimeLogStreams;
  telemetry: TelemetryExporterConfig;
}

export interface RuntimeSpan {
  end(outcome: 'error' | 'ok'): void;
  inject(carrier: Record<string, string>): void;
}

export interface RuntimeObservability {
  failed(stage: 'shutdown' | 'startup'): void;
  flush(): Promise<void>;
  logger: RuntimeLogger;
  shutdown(): Promise<void>;
  span(name: string): RuntimeSpan;
  started(): void;
  stopped(): void;
}

const redacted = '[Redacted]';
const exportTimeoutMillis = 1_000;
const sensitiveKey =
  /(?:authorization|baggage|body|content|cookie|email|message|overlay|params|password|pdf|secret|sql|token)/iu;
const technicalEventName = /^[a-z][a-z\d]*(?:[.-][a-z][a-z\d]*){1,7}$/u;

function sanitize(value: unknown, seen = new WeakSet<object>()): unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }
  if (seen.has(value)) {
    return redacted;
  }
  seen.add(value);
  if (Array.isArray(value)) {
    return value.map((entry) => sanitize(entry, seen));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      sensitiveKey.test(key) ? redacted : sanitize(entry, seen),
    ]),
  );
}

function loggerOptions(role: RuntimeRole, environment: RuntimeEnvironmentName): pino.LoggerOptions {
  return {
    base: { environment, role, service: `sobama-${role}` },
    formatters: {
      log: (record) => sanitize(record) as Record<string, unknown>,
    },
    level: 'info',
  };
}

export function createRuntimeLogger(
  role: RuntimeRole,
  environment: RuntimeEnvironmentName,
  streams: RuntimeLogStreams = { stderr: process.stderr, stdout: process.stdout },
): RuntimeLogger {
  const stdout = pino(loggerOptions(role, environment), streams.stdout);
  const stderr = pino(loggerOptions(role, environment), streams.stderr);
  const normalizeEvent = (event: string) =>
    technicalEventName.test(event) ? event : 'runtime.invalid-event';
  return {
    error: (event, attributes = {}) =>
      stderr.error({ ...attributes, event: normalizeEvent(event) }),
    info: (event, attributes = {}) => stdout.info({ ...attributes, event: normalizeEvent(event) }),
  };
}

function signalEndpoint(endpoint: string, signal: 'metrics' | 'traces'): string {
  return `${endpoint.replace(/\/+$/u, '')}/v1/${signal}`;
}

function createExporters(
  telemetry: TelemetryExporterConfig,
  overrides: TelemetryExporterOverrides | undefined,
): Required<TelemetryExporterOverrides> | undefined {
  if (overrides?.metrics && overrides.traces) {
    return { metrics: overrides.metrics, traces: overrides.traces };
  }
  if (telemetry.exporter === 'none') {
    return undefined;
  }
  return {
    metrics:
      overrides?.metrics ??
      new OTLPMetricExporter({
        timeoutMillis: exportTimeoutMillis,
        url: signalEndpoint(telemetry.endpoint, 'metrics'),
      }),
    traces:
      overrides?.traces ??
      new OTLPTraceExporter({
        timeoutMillis: exportTimeoutMillis,
        url: signalEndpoint(telemetry.endpoint, 'traces'),
      }),
  };
}

export function createRuntimeObservability(
  options: RuntimeObservabilityOptions,
): RuntimeObservability {
  const logger = createRuntimeLogger(options.role, options.environment, options.streams);
  const resource = resourceFromAttributes({
    'deployment.environment.name': options.environment,
    'service.name': `sobama-${options.role}`,
    'service.namespace': 'sosebama',
  });
  const exporters = createExporters(options.telemetry, options.exporters);
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

  const span = (name: string): RuntimeSpan => {
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
    const current = span(event);
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
    failed: (stage) => {
      const event = stage === 'startup' ? 'runtime.failed' : 'runtime.shutdown-failed';
      logger.error(event, { stage });
      record(event);
    },
    flush,
    logger,
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
    span,
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
