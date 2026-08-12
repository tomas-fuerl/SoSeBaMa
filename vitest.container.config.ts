import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/container-policy.container.ts'],
  },
});
