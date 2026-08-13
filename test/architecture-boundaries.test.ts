import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { basename, dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { ESLint } from 'eslint';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(fileURLToPath(new URL('../', import.meta.url)));
const sourceExtensions = new Set(['.cjs', '.cts', '.js', '.jsx', '.mjs', '.mts', '.ts', '.tsx']);
const forbiddenGenericPackages = new Set(['common', 'helpers', 'shared', 'utils']);
const dependencyFields = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
] as const;
const execFileAsync = promisify(execFile);

interface WorkspacePolicy {
  development: ReadonlySet<string>;
  runtime: ReadonlySet<string>;
}

const workspacePolicies: Readonly<Record<string, WorkspacePolicy>> = {
  sobama: {
    development: new Set(['@sobama/eslint-config', '@sobama/testing', '@sobama/typescript-config']),
    runtime: new Set(),
  },
  '@sobama/api': {
    development: new Set(['@sobama/testing']),
    runtime: new Set([
      '@sobama/config',
      '@sobama/contracts',
      '@sobama/observability',
      '@sobama/runtime-health',
      '@sobama/validation',
    ]),
  },
  '@sobama/config': {
    development: new Set(['@sobama/testing']),
    runtime: new Set(['@sobama/validation']),
  },
  '@sobama/contracts': {
    development: new Set(['@sobama/testing']),
    runtime: new Set(),
  },
  '@sobama/eslint-config': { development: new Set(), runtime: new Set() },
  '@sobama/observability': { development: new Set(['@sobama/testing']), runtime: new Set() },
  '@sobama/runtime-health': {
    development: new Set(['@sobama/testing']),
    runtime: new Set(['@sobama/contracts']),
  },
  '@sobama/testing': {
    development: new Set(),
    runtime: new Set(['@sobama/contracts', '@sobama/validation']),
  },
  '@sobama/typescript-config': { development: new Set(), runtime: new Set() },
  '@sobama/validation': {
    development: new Set(['@sobama/testing']),
    runtime: new Set(['@sobama/contracts']),
  },
  '@sobama/web': {
    development: new Set(['@sobama/testing']),
    runtime: new Set(['@sobama/contracts', '@sobama/validation']),
  },
  '@sobama/worker': {
    development: new Set(['@sobama/testing']),
    runtime: new Set([
      '@sobama/config',
      '@sobama/contracts',
      '@sobama/observability',
      '@sobama/runtime-health',
      '@sobama/validation',
    ]),
  },
};

interface PackageManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  exports?: unknown;
  name?: unknown;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

interface Workspace {
  directory: string;
  manifest: PackageManifest;
  manifestPath: string;
  name: string;
}

interface PnpmWorkspaceRecord {
  name?: unknown;
  path?: unknown;
}

let workspaceCache: Promise<Workspace[]> | undefined;

function toRepositoryPath(path: string): string {
  return relative(repositoryRoot, path).split(sep).join('/');
}

async function readJson(path: string): Promise<PackageManifest> {
  return JSON.parse(await readFile(path, 'utf8')) as PackageManifest;
}

async function readWorkspaces(): Promise<Workspace[]> {
  workspaceCache ??= discoverWorkspaces();
  return await workspaceCache;
}

async function discoverWorkspaces(): Promise<Workspace[]> {
  const { stdout } = await execFileAsync(
    'pnpm',
    ['--recursive', 'list', '--depth', '-1', '--json'],
    { cwd: repositoryRoot, encoding: 'utf8' },
  );
  const records = JSON.parse(String(stdout)) as PnpmWorkspaceRecord[];
  if (!Array.isArray(records)) {
    throw new Error('pnpm workspace discovery did not return an array.');
  }

  const workspaces: Workspace[] = [];
  for (const record of records) {
    if (typeof record.name !== 'string' || typeof record.path !== 'string') {
      throw new Error('pnpm workspace discovery returned a record without string name and path.');
    }
    const directory = resolve(record.path);
    const repositoryRelativePath = relative(repositoryRoot, directory);
    if (repositoryRelativePath === '..' || repositoryRelativePath.startsWith(`..${sep}`)) {
      throw new Error(`pnpm workspace ${record.name} resolves outside the repository.`);
    }
    const manifestPath = resolve(directory, 'package.json');
    const manifest = await readJson(manifestPath);
    if (manifest.name !== record.name) {
      throw new Error(
        `${toRepositoryPath(manifestPath)} name does not match pnpm workspace ${record.name}.`,
      );
    }
    workspaces.push({ directory, manifest, manifestPath, name: record.name });
  }

  return workspaces.toSorted((left, right) => left.directory.localeCompare(right.directory));
}

function requireWorkspace(workspaces: readonly Workspace[], name: string): Workspace {
  const workspace = workspaces.find((candidate) => candidate.name === name);
  if (!workspace) {
    throw new Error(`Expected pnpm workspace ${name} to exist.`);
  }
  return workspace;
}

async function findRepositorySourceFiles(): Promise<string[]> {
  const { stdout } = await execFileAsync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
    { cwd: repositoryRoot, encoding: 'utf8' },
  );
  return String(stdout)
    .split('\0')
    .filter((path) => sourceExtensions.has(extname(path)))
    .map((path) => resolve(repositoryRoot, path))
    .toSorted((left, right) => left.localeCompare(right));
}

function collectModuleSpecifiers(source: string, path: string): string[] {
  const sourceFile = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);
  const specifiers = new Set<string>();

  function visit(node: ts.Node): void {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      specifiers.add(node.moduleSpecifier.text);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      node.moduleReference.expression &&
      ts.isStringLiteralLike(node.moduleReference.expression)
    ) {
      specifiers.add(node.moduleReference.expression.text);
    } else if (
      ts.isCallExpression(node) &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0]) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
    ) {
      specifiers.add(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return [...specifiers];
}

function workspaceForPath(path: string, workspaces: readonly Workspace[]): Workspace | undefined {
  return workspaces
    .toSorted((left, right) => right.directory.length - left.directory.length)
    .find(
      (workspace) =>
        path === workspace.directory || path.startsWith(`${workspace.directory}${sep}`),
    );
}

function declaredDependencies(manifest: PackageManifest): ReadonlySet<string> {
  return new Set(dependencyFields.flatMap((field) => Object.keys(manifest[field] ?? {})));
}

function exportPatternMatches(pattern: string, exportKey: string): boolean {
  const wildcardIndex = pattern.indexOf('*');
  if (wildcardIndex < 0) {
    return pattern === exportKey;
  }
  const prefix = pattern.slice(0, wildcardIndex);
  const suffix = pattern.slice(wildcardIndex + 1);
  return exportKey.startsWith(prefix) && exportKey.endsWith(suffix);
}

function compareExportPatterns(left: string, right: string): number {
  const leftPrefixLength = left.indexOf('*') + 1;
  const rightPrefixLength = right.indexOf('*') + 1;
  if (leftPrefixLength !== rightPrefixLength) {
    return rightPrefixLength - leftPrefixLength;
  }

  return right.length - left.length || left.localeCompare(right);
}

function hasUsableExportTarget(target: unknown): boolean {
  if (typeof target === 'string') {
    return true;
  }
  if (Array.isArray(target)) {
    return target.some((candidate) => hasUsableExportTarget(candidate));
  }
  if (!target || typeof target !== 'object') {
    return false;
  }

  return Object.values(target).some((candidate) => hasUsableExportTarget(candidate));
}

function resolveExportTarget(packageExports: unknown, exportKey: string): unknown {
  if (
    typeof packageExports === 'string' ||
    packageExports === null ||
    Array.isArray(packageExports)
  ) {
    return exportKey === '.' ? packageExports : undefined;
  }
  if (typeof packageExports !== 'object') {
    return undefined;
  }

  const exportsMap = packageExports as Record<string, unknown>;
  const exportKeys = Object.keys(exportsMap);
  const hasSubpathKeys = exportKeys.some((key) => key.startsWith('.'));
  if (exportKey === '.') {
    if (!hasSubpathKeys) {
      return exportsMap;
    }
    return Object.hasOwn(exportsMap, '.') ? exportsMap['.'] : undefined;
  }
  if (!hasSubpathKeys) {
    return undefined;
  }

  if (Object.hasOwn(exportsMap, exportKey)) {
    return exportsMap[exportKey];
  }

  const matchingPattern = exportKeys
    .filter(
      (key) => key.startsWith('.') && key.includes('*') && exportPatternMatches(key, exportKey),
    )
    .toSorted(compareExportPatterns)[0];
  return matchingPattern === undefined ? undefined : exportsMap[matchingPattern];
}

function isPublicExport(manifest: PackageManifest, subpath: string | undefined): boolean {
  return hasUsableExportTarget(
    resolveExportTarget(manifest.exports, subpath === undefined ? '.' : `.${subpath}`),
  );
}

function localPackageImport(
  specifier: string,
  workspacesByName: ReadonlyMap<string, Workspace>,
): { subpath: string | undefined; workspace: Workspace } | undefined {
  for (const workspace of workspacesByName.values()) {
    if (specifier === workspace.name) {
      return { subpath: undefined, workspace };
    }
    if (specifier.startsWith(`${workspace.name}/`)) {
      return { subpath: specifier.slice(workspace.name.length), workspace };
    }
  }
  return undefined;
}

function isDomainSource(path: string, workspace: Workspace): boolean {
  const segments = relative(workspace.directory, path).split(sep);
  return segments[0] === 'src' && segments.includes('domain');
}

function isTestSource(path: string, workspace: Workspace): boolean {
  const segments = relative(workspace.directory, path).split(sep);
  return (
    segments.includes('test') ||
    segments.some((segment) => segment.includes('.spec.') || segment.includes('.test.'))
  );
}

function importViolations(
  file: string,
  source: string,
  workspace: Workspace,
  workspaces: readonly Workspace[],
): string[] {
  const violations: string[] = [];
  const workspacesByName = new Map(workspaces.map((candidate) => [candidate.name, candidate]));
  const dependencies = declaredDependencies(workspace.manifest);
  const repositoryPath = toRepositoryPath(file);

  for (const specifier of collectModuleSpecifiers(source, file)) {
    const localImport = localPackageImport(specifier, workspacesByName);
    if (localImport && localImport.workspace.name !== workspace.name) {
      if (!dependencies.has(localImport.workspace.name)) {
        violations.push(
          `${repositoryPath}: declare ${localImport.workspace.name} with workspace:* before importing it.`,
        );
      }
      if (localImport.subpath?.startsWith('/internal')) {
        violations.push(
          `${repositoryPath}: ${specifier} is internal; import the package's public facade instead.`,
        );
      } else if (localImport.subpath) {
        if (!isPublicExport(localImport.workspace.manifest, localImport.subpath)) {
          violations.push(
            `${repositoryPath}: ${specifier} is not a public export of ${localImport.workspace.name}.`,
          );
        }
      } else if (!isPublicExport(localImport.workspace.manifest, undefined)) {
        violations.push(
          `${repositoryPath}: ${localImport.workspace.name} has no public root export.`,
        );
      }
      if (localImport.workspace.name === '@sobama/testing' && !isTestSource(file, workspace)) {
        violations.push(`${repositoryPath}: @sobama/testing may be imported only by test code.`);
      }
    }

    if (specifier.startsWith('.')) {
      const targetWorkspace = workspaceForPath(resolve(dirname(file), specifier), workspaces);
      if (targetWorkspace && targetWorkspace.name !== workspace.name) {
        violations.push(
          `${repositoryPath}: relative import ${specifier} crosses into ${targetWorkspace.name}; use its public package export.`,
        );
      }
    }

    if (
      workspace.name === '@sobama/web' &&
      (specifier === 'prisma' ||
        specifier.startsWith('@prisma/') ||
        specifier === '@sobama/api' ||
        specifier.startsWith('@sobama/api/') ||
        specifier === '@sobama/config' ||
        specifier.startsWith('@sobama/config/') ||
        specifier === '@sobama/observability' ||
        specifier.startsWith('@sobama/observability/') ||
        specifier === '@sobama/runtime-health' ||
        specifier.startsWith('@sobama/runtime-health/') ||
        specifier === '@sobama/worker' ||
        specifier.startsWith('@sobama/worker/'))
    ) {
      violations.push(
        `${repositoryPath}: browser code may not import server runtime or persistence module ${specifier}.`,
      );
    }

    if (
      isDomainSource(file, workspace) &&
      (specifier === 'prisma' ||
        specifier.startsWith('@prisma/') ||
        specifier.startsWith('@nestjs/'))
    ) {
      violations.push(
        `${repositoryPath}: domain code must remain framework-free and may not import ${specifier}.`,
      );
    }
  }

  return violations;
}

function manifestViolations(workspaces: readonly Workspace[]): string[] {
  const violations: string[] = [];
  const workspacesByName = new Map(workspaces.map((workspace) => [workspace.name, workspace]));

  for (const workspace of workspaces) {
    const shortName = workspace.name.split('/').at(-1) ?? workspace.name;
    const workspacePathSegments = relative(repositoryRoot, workspace.directory).split(sep);
    if (
      workspacePathSegments[0] === 'packages' &&
      (forbiddenGenericPackages.has(basename(workspace.directory)) ||
        forbiddenGenericPackages.has(shortName))
    ) {
      violations.push(
        `${toRepositoryPath(workspace.manifestPath)}: generic aggregator package ${workspace.name} is forbidden.`,
      );
    }

    const policy = workspacePolicies[workspace.name];
    if (!policy) {
      violations.push(
        `${toRepositoryPath(workspace.manifestPath)}: add an explicit dependency policy for ${workspace.name}.`,
      );
    }
    const runtimeTargets = policy?.runtime ?? new Set<string>();
    const developmentTargets = policy?.development ?? new Set<string>();

    for (const field of dependencyFields) {
      for (const [dependency, specifier] of Object.entries(workspace.manifest[field] ?? {})) {
        if (!workspacesByName.has(dependency)) {
          continue;
        }
        if (!specifier.startsWith('workspace:')) {
          violations.push(
            `${toRepositoryPath(workspace.manifestPath)}: ${field}.${dependency} must use the workspace: protocol.`,
          );
        }
        const allowedTargets =
          field === 'devDependencies'
            ? new Set([...runtimeTargets, ...developmentTargets])
            : runtimeTargets;
        if (!allowedTargets.has(dependency)) {
          violations.push(
            `${toRepositoryPath(workspace.manifestPath)}: ${workspace.name} may not depend on ${dependency} in ${field}.`,
          );
        }
      }
    }
  }

  return violations;
}

async function repositoryViolations(): Promise<string[]> {
  const workspaces = await readWorkspaces();
  const violations = manifestViolations(workspaces);

  for (const file of await findRepositorySourceFiles()) {
    const workspace = workspaceForPath(file, workspaces);
    if (!workspace) {
      violations.push(`${toRepositoryPath(file)}: no pnpm workspace owns this source file.`);
      continue;
    }
    violations.push(...importViolations(file, await readFile(file, 'utf8'), workspace, workspaces));
  }

  return violations;
}

describe('architecture boundaries', () => {
  it('keeps the repository inside the documented workspace and import boundaries', async () => {
    const violations = await repositoryViolations();
    expect(violations, violations.join('\n')).toEqual([]);
  });

  it('discovers the root and nested workspaces through pnpm and scans root-owned sources', async () => {
    const workspaces = await readWorkspaces();
    const root = requireWorkspace(workspaces, 'sobama');
    const rootSources = (await findRepositorySourceFiles())
      .filter((file) => workspaceForPath(file, workspaces)?.name === root.name)
      .map(toRepositoryPath);

    expect(root.directory).toBe(repositoryRoot);
    expect(rootSources).toContain('tools/check-markdown-links.mjs');
    expect(rootSources).toContain('test/architecture-boundaries.test.ts');
  });

  it('reports forbidden root dependencies and internal imports from root tools', async () => {
    const workspaces = await readWorkspaces();
    const root = requireWorkspace(workspaces, 'sobama');
    const rootWithConfig: Workspace = {
      ...root,
      manifest: {
        ...root.manifest,
        devDependencies: {
          ...root.manifest.devDependencies,
          '@sobama/config': 'workspace:*',
        },
      },
    };
    const modifiedWorkspaces = workspaces.map((workspace) =>
      workspace.name === root.name ? rootWithConfig : workspace,
    );

    expect(manifestViolations(modifiedWorkspaces)).toContain(
      'package.json: sobama may not depend on @sobama/config in devDependencies.',
    );
    expect(
      importViolations(
        resolve(repositoryRoot, 'tools/example.mjs'),
        "import '@sobama/config/internal';",
        rootWithConfig,
        modifiedWorkspaces,
      ),
    ).toContain(
      "tools/example.mjs: @sobama/config/internal is internal; import the package's public facade instead.",
    );
  });

  it('keeps observability test overrides behind the package-internal runtime module', async () => {
    const workspaces = await readWorkspaces();
    const api = requireWorkspace(workspaces, '@sobama/api');
    const observability = requireWorkspace(workspaces, '@sobama/observability');
    const file = resolve(api.directory, 'src/example.ts');

    expect(isPublicExport(observability.manifest, '/runtime')).toBe(false);
    expect(
      importViolations(file, "import '@sobama/observability/runtime';", api, workspaces),
    ).toContain(
      'apps/api/src/example.ts: @sobama/observability/runtime is not a public export of @sobama/observability.',
    );
  });

  it.each([
    '@sobama/config',
    '@sobama/observability',
    '@sobama/runtime-health',
    '@prisma/adapter-pg',
  ])('reports forbidden %s imports in browser code', async (specifier) => {
    const workspaces = await readWorkspaces();
    const web = requireWorkspace(workspaces, '@sobama/web');
    const file = resolve(web.directory, 'src/example.ts');

    expect(importViolations(file, `import '${specifier}';`, web, workspaces)).toContain(
      `apps/web/src/example.ts: browser code may not import server runtime or persistence module ${specifier}.`,
    );
  });

  it('keeps the ESLint client guard consistent for the Prisma namespace', async () => {
    const eslint = new ESLint({ cwd: repositoryRoot });
    const [result] = await eslint.lintText("import '@prisma/adapter-pg';", {
      filePath: resolve(repositoryRoot, 'apps/web/src/example.ts'),
    });

    expect(result?.messages.some((message) => message.ruleId === 'no-restricted-imports')).toBe(
      true,
    );
  });

  it.each(['@nestjs/common', '@prisma/client'])(
    'reports framework import %s in domain code',
    async (specifier) => {
      const workspaces = await readWorkspaces();
      const api = requireWorkspace(workspaces, '@sobama/api');
      const file = resolve(api.directory, 'src/identity/domain/member.ts');

      expect(importViolations(file, `import '${specifier}';`, api, workspaces)).toContain(
        `apps/api/src/identity/domain/member.ts: domain code must remain framework-free and may not import ${specifier}.`,
      );
    },
  );

  it('reports internal package imports', async () => {
    const workspaces = await readWorkspaces();
    const api = requireWorkspace(workspaces, '@sobama/api');
    const file = resolve(api.directory, 'src/example.ts');

    expect(importViolations(file, "import '@sobama/config/internal';", api, workspaces)).toContain(
      "apps/api/src/example.ts: @sobama/config/internal is internal; import the package's public facade instead.",
    );
  });

  it('resolves conditional, pattern and null exports with specific-pattern precedence', async () => {
    const workspaces = await readWorkspaces();
    const api = requireWorkspace(workspaces, '@sobama/api');
    const config = requireWorkspace(workspaces, '@sobama/config');
    const configWithPattern: Workspace = {
      ...config,
      manifest: {
        ...config.manifest,
        exports: {
          '.': { import: './src/index.ts', types: './src/index.ts' },
          './features/*': './src/features/*.ts',
          './features/private-internal/*': null,
        },
      },
    };
    const patternWorkspaces = workspaces.map((workspace) =>
      workspace.name === config.name ? configWithPattern : workspace,
    );
    const file = resolve(api.directory, 'src/example.ts');

    expect(importViolations(file, "import '@sobama/config/private';", api, workspaces)).toContain(
      'apps/api/src/example.ts: @sobama/config/private is not a public export of @sobama/config.',
    );
    expect(
      importViolations(file, "import '@sobama/config/features/member.js';", api, patternWorkspaces),
    ).toEqual([]);
    expect(
      importViolations(
        file,
        "import '@sobama/config/features/private-internal/member.js';",
        api,
        patternWorkspaces,
      ),
    ).toContain(
      'apps/api/src/example.ts: @sobama/config/features/private-internal/member.js is not a public export of @sobama/config.',
    );
    expect(
      isPublicExport({ exports: { import: './index.js', require: './index.cjs' } }, undefined),
    ).toBe(true);
    expect(isPublicExport({ exports: { '.': null } }, undefined)).toBe(false);
    expect(isPublicExport({ exports: {} }, undefined)).toBe(false);
  });

  it('reports relative imports across workspace boundaries', async () => {
    const workspaces = await readWorkspaces();
    const web = requireWorkspace(workspaces, '@sobama/web');
    const file = resolve(web.directory, 'src/example.ts');

    expect(importViolations(file, "import '../../api/src/main.js';", web, workspaces)).toContain(
      'apps/web/src/example.ts: relative import ../../api/src/main.js crosses into @sobama/api; use its public package export.',
    );
  });

  it('reports workspace dependencies outside the documented matrix', async () => {
    const workspaces = await readWorkspaces();
    const web = requireWorkspace(workspaces, '@sobama/web');
    const webWithServerDependency: Workspace = {
      ...web,
      manifest: {
        ...web.manifest,
        dependencies: {
          ...web.manifest.dependencies,
          '@sobama/config': 'workspace:*',
        },
      },
    };
    const violations = manifestViolations(
      workspaces.map((workspace) =>
        workspace.name === webWithServerDependency.name ? webWithServerDependency : workspace,
      ),
    );

    expect(violations).toContain(
      'apps/web/package.json: @sobama/web may not depend on @sobama/config in dependencies.',
    );
  });

  it('allows @sobama/testing from .spec. files and rejects it from production code', async () => {
    const workspaces = await readWorkspaces();
    const api = requireWorkspace(workspaces, '@sobama/api');
    const testing = requireWorkspace(workspaces, '@sobama/testing');
    const apiWithTesting: Workspace = {
      ...api,
      manifest: {
        ...api.manifest,
        devDependencies: { ...api.manifest.devDependencies, '@sobama/testing': 'workspace:*' },
      },
    };
    const testingWithExport: Workspace = {
      ...testing,
      manifest: { ...testing.manifest, exports: './src/index.ts' },
    };
    const modifiedWorkspaces = workspaces.map((workspace) => {
      if (workspace.name === api.name) return apiWithTesting;
      if (workspace.name === testing.name) return testingWithExport;
      return workspace;
    });

    expect(
      importViolations(
        resolve(api.directory, 'src/member.ts'),
        "import '@sobama/testing';",
        apiWithTesting,
        modifiedWorkspaces,
      ),
    ).toContain('apps/api/src/member.ts: @sobama/testing may be imported only by test code.');
    expect(
      importViolations(
        resolve(api.directory, 'src/member.spec.ts'),
        "import '@sobama/testing';",
        apiWithTesting,
        modifiedWorkspaces,
      ),
    ).toEqual([]);
  });

  it('reports generic aggregator packages and unpinned workspace dependencies', async () => {
    const workspaces = await readWorkspaces();
    const sharedManifestPath = resolve(repositoryRoot, 'packages/shared/package.json');
    const shared: Workspace = {
      directory: dirname(sharedManifestPath),
      manifest: {
        dependencies: { '@sobama/contracts': '^1.0.0' },
        name: '@sobama/shared',
      },
      manifestPath: sharedManifestPath,
      name: '@sobama/shared',
    };
    const violations = manifestViolations([
      ...workspaces.filter((workspace) => workspace.name !== '@sobama/shared'),
      shared,
    ]);

    expect(violations).toContain(
      'packages/shared/package.json: generic aggregator package @sobama/shared is forbidden.',
    );
    expect(violations).toContain(
      'packages/shared/package.json: add an explicit dependency policy for @sobama/shared.',
    );
    expect(violations).toContain(
      'packages/shared/package.json: dependencies.@sobama/contracts must use the workspace: protocol.',
    );
  });
});
