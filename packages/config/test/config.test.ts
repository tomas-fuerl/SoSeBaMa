import { describe, expect, it } from 'vitest';

import { ConfigurationError, loadApiRuntimeConfig, loadWorkerRuntimeConfig } from '../src/index.js';

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
});
