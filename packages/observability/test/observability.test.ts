import { ExportResultCode, type ExportResult } from '@opentelemetry/core';
import {
  AggregationTemporality,
  InMemoryMetricExporter,
  type PushMetricExporter,
  type ResourceMetrics,
} from '@opentelemetry/sdk-metrics';
import {
  InMemorySpanExporter,
  type ReadableSpan,
  type SpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  createRuntimeFailureReporterCore,
  createRuntimeObservabilityCore,
  type RuntimeFailureCategory,
  type RuntimeFailureStage,
  type RuntimeLogStreams,
  type RuntimeObservabilityOptions,
} from '../src/runtime.js';

class CaptureStream {
  output = '';

  write(message: string): void {
    this.output += message;
  }
}

function captureStreams(): {
  captures: { stderr: CaptureStream; stdout: CaptureStream };
  streams: RuntimeLogStreams;
} {
  const stderr = new CaptureStream();
  const stdout = new CaptureStream();
  return { captures: { stderr, stdout }, streams: { stderr, stdout } };
}

function parseJsonLines(output: string): Array<Record<string, unknown>> {
  return output
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>);
}

class FailingTraceExporter implements SpanExporter {
  export(_spans: ReadableSpan[], callback: (result: ExportResult) => void): void {
    callback({ code: ExportResultCode.FAILED, error: new Error('private-trace-value') });
  }

  forceFlush(): Promise<void> {
    return Promise.reject(new Error('private-trace-value'));
  }

  shutdown(): Promise<void> {
    return Promise.reject(new Error('private-trace-value'));
  }
}

class FailingMetricExporter implements PushMetricExporter {
  export(_metrics: ResourceMetrics, callback: (result: ExportResult) => void): void {
    callback({ code: ExportResultCode.FAILED, error: new Error('private-metric-value') });
  }

  forceFlush(): Promise<void> {
    return Promise.reject(new Error('private-metric-value'));
  }

  shutdown(): Promise<void> {
    return Promise.reject(new Error('private-metric-value'));
  }
}

describe('server observability foundation', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('writes only allowlisted failure fields and normalizes invalid runtime values', () => {
    const { captures, streams } = captureStreams();
    const reporter = createRuntimeFailureReporterCore('api', 'unvalidated', streams);

    reporter.failed('shutdown', 'configuration');
    reporter.failed(
      'private-stage' as RuntimeFailureStage,
      'private-category' as RuntimeFailureCategory,
    );

    const records = parseJsonLines(captures.stderr.output);
    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({
      category: 'configuration',
      environment: 'unvalidated',
      event: 'runtime.shutdown-failed',
      role: 'api',
      service: 'sobama-api',
      stage: 'shutdown',
    });
    expect(Object.keys(records[0] ?? {}).toSorted()).toEqual([
      'category',
      'environment',
      'event',
      'level',
      'role',
      'service',
      'stage',
      'time',
    ]);
    expect(records[1]).toMatchObject({
      category: 'runtime',
      event: 'runtime.failed',
      stage: 'startup',
    });
    expect(captures.stderr.output).not.toContain('private');
    expect(captures.stdout.output).toBe('');
  });

  it('exports fixed lifecycle spans, metrics, and W3C trace context', async () => {
    const traces = new InMemorySpanExporter();
    const metrics = new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE);
    const { captures, streams } = captureStreams();
    const observability = createRuntimeObservabilityCore(
      {
        environment: 'DEV',
        role: 'worker',
        telemetry: { endpoint: 'http://127.0.0.1:4318', exporter: 'otlp' },
      },
      { exporters: { metrics, traces }, streams },
    );

    observability.started();
    const propagationSpan = observability.propagationSpan();
    const foreignCarrier = {
      baggage: 'private-baggage',
      private: 'private-marker',
      tracestate: 'private-tracestate',
    };
    const carrier = Reflect.apply(propagationSpan.inject, propagationSpan, [foreignCarrier]);
    propagationSpan.end('ok');
    observability.failed('startup');
    observability.failed('shutdown');
    observability.stopped();
    await expect(observability.flush()).resolves.toBeUndefined();

    expect(observability).not.toHaveProperty('span');
    expect(observability).not.toHaveProperty('logger');
    expect(carrier.traceparent).toMatch(/^00-[a-f\d]{32}-[a-f\d]{16}-01$/u);
    expect(Object.keys(carrier)).toEqual(['traceparent']);
    expect(foreignCarrier).toEqual({
      baggage: 'private-baggage',
      private: 'private-marker',
      tracestate: 'private-tracestate',
    });
    expect(JSON.stringify(carrier)).not.toContain('private');

    const spans = traces.getFinishedSpans();
    expect(spans.map((span) => span.name).toSorted()).toEqual([
      'runtime.failed',
      'runtime.propagation',
      'runtime.shutdown-failed',
      'runtime.started',
      'runtime.stopped',
    ]);
    for (const span of spans) {
      expect(span.attributes).toEqual({});
      expect(span.resource.attributes).toMatchObject({
        'deployment.environment.name': 'DEV',
        'service.name': 'sobama-worker',
        'service.namespace': 'sosebama',
      });
    }

    const exportedMetrics = metrics
      .getMetrics()
      .flatMap((resource) => resource.scopeMetrics)
      .flatMap((scope) => scope.metrics);
    expect(exportedMetrics.map((metric) => metric.descriptor.name).toSorted()).toEqual([
      'sobama.runtime.failed',
      'sobama.runtime.started',
    ]);
    for (const metric of exportedMetrics) {
      expect(metric.dataPoints.every((point) => Object.keys(point.attributes).length === 0)).toBe(
        true,
      );
    }
    expect(
      exportedMetrics.find((metric) => metric.descriptor.name === 'sobama.runtime.failed')
        ?.dataPoints,
    ).toEqual([expect.objectContaining({ value: 2 })]);
    expect(captures.stdout.output).toContain('"event":"runtime.started"');
    expect(captures.stderr.output).toContain('"event":"runtime.failed"');
    await expect(observability.shutdown()).resolves.toBeUndefined();
  });

  it('gives exporter none precedence over package-internal test overrides', async () => {
    const traces = new InMemorySpanExporter();
    const metrics = new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE);
    const { streams } = captureStreams();
    const observability = createRuntimeObservabilityCore(
      { environment: 'DEV', role: 'api', telemetry: { exporter: 'none' } },
      { exporters: { metrics, traces }, streams },
    );

    observability.started();
    observability.propagationSpan().end('ok');
    await observability.shutdown();

    expect(traces.getFinishedSpans()).toEqual([]);
    expect(metrics.getMetrics()).toEqual([]);
  });

  it.each(['unvalidated', 'TST', 'PRD'])(
    'rejects the non-DEV runtime environment %s at the observability boundary',
    (environment) => {
      const options = {
        environment,
        role: 'api',
        telemetry: { exporter: 'none' },
      } as unknown as RuntimeObservabilityOptions;

      expect(() => createRuntimeObservabilityCore(options)).toThrowError(
        /Invalid runtime environment(?!.*(?:unvalidated|TST|PRD))/u,
      );
    },
  );

  it('rejects non-loopback exporters at the observability boundary without echoing them', () => {
    const endpoint = 'https://private-external.invalid/collector';

    expect(() =>
      createRuntimeObservabilityCore({
        environment: 'DEV',
        role: 'api',
        telemetry: { endpoint, exporter: 'otlp' },
      }),
    ).toThrowError(/Invalid local telemetry configuration(?!.*private-external)/u);
  });

  it.each([
    'OTEL_EXPORTER_OTLP_HEADERS',
    'OTEL_EXPORTER_OTLP_TRACES_HEADERS',
    'OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE',
    'OTEL_EXPORTER_OTLP_CLIENT_KEY',
    'otel_exporter_otlp_headers',
    'Otel_Exporter_Otlp_Traces_Client_Key',
  ])('rejects inherited OTLP input %s before creating exporters', (variable) => {
    vi.stubEnv(variable, 'private-otel-marker');

    expect(() =>
      createRuntimeObservabilityCore({
        environment: 'DEV',
        role: 'api',
        telemetry: { endpoint: 'http://127.0.0.1:4318', exporter: 'otlp' },
      }),
    ).toThrowError(/Invalid local telemetry configuration(?!.*private-otel-marker)/u);
  });

  it('keeps exporter failures generic and non-blocking', async () => {
    const { captures, streams } = captureStreams();
    const observability = createRuntimeObservabilityCore(
      {
        environment: 'DEV',
        role: 'api',
        telemetry: { endpoint: 'http://127.0.0.1:4318', exporter: 'otlp' },
      },
      {
        exporters: {
          metrics: new FailingMetricExporter(),
          traces: new FailingTraceExporter(),
        },
        streams,
      },
    );

    expect(() => observability.started()).not.toThrow();
    await expect(observability.shutdown()).resolves.toBeUndefined();
    expect(captures.stderr.output).toMatch(/telemetry\.(?:flush|shutdown)-failed/u);
    expect(captures.stderr.output).not.toMatch(/private-(?:metric|trace)-value/u);
  });
});
