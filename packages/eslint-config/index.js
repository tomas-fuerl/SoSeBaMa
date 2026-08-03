import eslint from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.RulesRecord} */
const clientOnlyRestrictions = {
  'no-restricted-imports': [
    'error',
    {
      patterns: [
        {
          group: [
            '@prisma/client',
            'prisma',
            '@sobama/api',
            '@sobama/api/*',
            '@sobama/config',
            '@sobama/config/*',
            '@sobama/worker',
            '@sobama/worker/*',
            '@sobama/*/internal',
            '@sobama/*/internal/*',
          ],
          message:
            'Client code may import only public contracts and validation, never server internals.',
        },
        {
          regex: '^(?:\\.\\./)+(?:api|worker|packages/config)(?:/|$)',
          message:
            'Relative client imports may not cross into server applications or configuration.',
        },
      ],
    },
  ],
};

export const sobamaConfig = tseslint.config(
  {
    ignores: [
      '.git/**',
      '.local-agent/**',
      '.pnpm-store/**',
      '.worktrees/**',
      '**/coverage/**',
      '**/dist/**',
      'node_modules/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['apps/web/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
    rules: clientOnlyRestrictions,
  },
);
