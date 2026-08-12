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
import { describe, expect, it } from 'vitest';

import {
  createRuntimeLogger,
  createRuntimeObservability,
  type RuntimeLogStreams,
} from '../src/index.js';

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
  it('writes bounded JSON logs and recursively redacts sensitive values', () => {
    const { captures, streams } = captureStreams();
    const logger = createRuntimeLogger('api', 'DEV', streams);

    logger.info('runtime.test', {
      authorization: 'private-authorization',
      message: 'private-message',
      nested: {
        email: 'private-email',
        safe: 'visible',
        values: [{ requestBody: 'private-body' }],
      },
    });

    const record = JSON.parse(captures.stdout.output.trim()) as Record<string, unknown>;
    expect(record).toMatchObject({
      authorization: '[Redacted]',
      environment: 'DEV',
      event: 'runtime.test',
      role: 'api',
      service: 'sobama-api',
    });
    expect(record).not.toHaveProperty('hostname');
    expect(record).not.toHaveProperty('pid');
    expect(captures.stdout.output).toContain('visible');
    expect(captures.stdout.output).not.toMatch(/private-(?:authorization|body|email|message)/u);
    expect(captures.stderr.output).toBe('');

    logger.info('private user supplied value');
    expect(captures.stdout.output).not.toContain('private user supplied value');
    expect(captures.stdout.output).toContain('"event":"runtime.invalid-event"');
  });

  it('exports bounded lifecycle spans, metrics, and W3C trace context', async () => {
    const traces = new InMemorySpanExporter();
    const metrics = new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE);
    const { captures, streams } = captureStreams();
    const observability = createRuntimeObservability({
      environment: 'DEV',
      exporters: { metrics, traces },
      role: 'worker',
      streams,
      telemetry: { exporter: 'none' },
    });

    observability.started();
    const propagationSpan = observability.span('runtime.propagation');
    const carrier: Record<string, string> = {};
    propagationSpan.inject(carrier);
    propagationSpan.end('ok');
    observability.failed('startup');
    observability.failed('shutdown');
    observability.stopped();
    await expect(observability.flush()).resolves.toBeUndefined();

    expect(carrier.traceparent).toMatch(/^00-[a-f\d]{32}-[a-f\d]{16}-01$/u);
    expect(Object.keys(carrier)).toEqual(['traceparent']);

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

  it('keeps exporter failures generic and non-blocking', async () => {
    const { captures, streams } = captureStreams();
    const observability = createRuntimeObservability({
      environment: 'DEV',
      exporters: { metrics: new FailingMetricExporter(), traces: new FailingTraceExporter() },
      role: 'api',
      streams,
      telemetry: { exporter: 'none' },
    });

    expect(() => observability.started()).not.toThrow();
    await expect(observability.shutdown()).resolves.toBeUndefined();
    expect(captures.stderr.output).toMatch(/telemetry\.(?:flush|shutdown)-failed/u);
    expect(captures.stderr.output).not.toMatch(/private-(?:metric|trace)-value/u);
  });
});
