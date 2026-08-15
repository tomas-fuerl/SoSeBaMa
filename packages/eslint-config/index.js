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
            '@prisma/*',
            'prisma',
            '@sobama/api',
            '@sobama/api/*',
            '@sobama/config',
            '@sobama/config/*',
            '@sobama/observability',
            '@sobama/observability/*',
            '@sobama/runtime-health',
            '@sobama/runtime-health/*',
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

/**
 * Verbietet Importe, die nur wegen Inline-Typspezifizierern bestehen bleiben.
 *
 * Mit `verbatimModuleSyntax` emittiert `import { type X } from 'y'` ein
 * `import {} from 'y'` und damit eine echte Modulaufloesung zur Laufzeit. Fuer
 * ein rein typseitig genutztes Paket entsteht so eine Abhaengigkeit, die im
 * Containerimage fehlschlaegt. `import type { X } from 'y'` wird dagegen
 * vollstaendig geloescht.
 *
 * Bewusst nicht `consistent-type-imports`: Diese Regel wuerde auch reine
 * Wertimporte umschreiben. `apps/api` und `apps/worker` setzen
 * `emitDecoratorMetadata`, sodass NestJS injizierte Klassen ueber
 * `design:paramtypes` zur Laufzeit referenziert. Ein `import type` wuerde die
 * Bindung loeschen und Dependency Injection brechen.
 */
/** @type {import('eslint').Linter.RulesRecord} */
const typeImportRules = {
  '@typescript-eslint/no-import-type-side-effects': 'error',
};

export const sobamaConfig = tseslint.config(
  {
    ignores: [
      '.git/**',
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
    files: ['**/*.{ts,tsx,mts,cts}'],
    rules: typeImportRules,
  },
  {
    files: ['apps/web/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
    rules: clientOnlyRestrictions,
  },
);
