import { defineConfig } from 'vitest/config';

const testFilePattern = '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['**/dist/**'],
    },
    include: [
      `test/${testFilePattern}`,
      `apps/*/test/${testFilePattern}`,
      `packages/*/test/${testFilePattern}`,
    ],
  },
});
