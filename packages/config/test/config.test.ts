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
