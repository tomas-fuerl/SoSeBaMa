import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['**/dist/**'],
    },
    testTimeout: 15_000,
  },
});
