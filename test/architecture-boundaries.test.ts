import { readFile, readdir } from 'node:fs/promises';
import { basename, dirname, extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { describe, expect, it } from 'vitest';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const workspaceContainers = ['apps', 'packages'] as const;
const sourceExtensions = new Set(['.cjs', '.cts', '.js', '.jsx', '.mjs', '.mts', '.ts', '.tsx']);
const ignoredDirectories = new Set(['coverage', 'dist', 'node_modules']);
const forbiddenGenericPackages = new Set(['common', 'helpers', 'shared', 'utils']);
const dependencyFields = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
] as const;
const allowedRuntimeDependencies: Readonly<Record<string, ReadonlySet<string>>> = {
  '@sobama/api': new Set(['@sobama/config', '@sobama/contracts', '@sobama/validation']),
  '@sobama/config': new Set(['@sobama/validation']),
  '@sobama/contracts': new Set(),
  '@sobama/eslint-config': new Set(),
  '@sobama/testing': new Set(['@sobama/contracts', '@sobama/validation']),
  '@sobama/typescript-config': new Set(),
  '@sobama/validation': new Set(['@sobama/contracts']),
  '@sobama/web': new Set(['@sobama/contracts', '@sobama/validation']),
  '@sobama/worker': new Set(['@sobama/config', '@sobama/contracts', '@sobama/validation']),
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

function toRepositoryPath(path: string): string {
  return relative(repositoryRoot, path).split(sep).join('/');
}

async function readJson(path: string): Promise<PackageManifest> {
  return JSON.parse(await readFile(path, 'utf8')) as PackageManifest;
}

async function readWorkspaces(): Promise<Workspace[]> {
  const workspaces: Workspace[] = [];

  for (const container of workspaceContainers) {
    const containerPath = resolve(repositoryRoot, container);
    const entries = await readdir(containerPath, { withFileTypes: true });
    for (const entry of entries.toSorted((left, right) => left.name.localeCompare(right.name))) {
      if (!entry.isDirectory()) {
        continue;
      }

      const directory = resolve(containerPath, entry.name);
      const manifestPath = resolve(directory, 'package.json');
      const manifest = await readJson(manifestPath);
      if (typeof manifest.name !== 'string') {
        throw new Error(`${toRepositoryPath(manifestPath)} must contain a string package name.`);
      }
      workspaces.push({ directory, manifest, manifestPath, name: manifest.name });
    }
  }

  return workspaces;
}

async function findSourceFiles(directory: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries.toSorted((left, right) => left.name.localeCompare(right.name))) {
    if (ignoredDirectories.has(entry.name)) {
      continue;
    }
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findSourceFiles(path)));
    } else if (entry.isFile() && sourceExtensions.has(extname(entry.name))) {
      files.push(path);
    }
  }

  return files;
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
  return workspaces.find(
    (workspace) => path === workspace.directory || path.startsWith(`${workspace.directory}${sep}`),
  );
}

function declaredDependencies(manifest: PackageManifest): ReadonlySet<string> {
  return new Set(dependencyFields.flatMap((field) => Object.keys(manifest[field] ?? {})));
}

function exportedSubpaths(manifest: PackageManifest): ReadonlySet<string> {
  if (typeof manifest.exports === 'string') {
    return new Set(['.']);
  }
  if (!manifest.exports || typeof manifest.exports !== 'object') {
    return new Set();
  }
  return new Set(Object.keys(manifest.exports).filter((key) => key.startsWith('.')));
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
  return segments.includes('test') || segments.some((segment) => segment.includes('.test.'));
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
        const exportKey = `.${localImport.subpath}`;
        if (!exportedSubpaths(localImport.workspace.manifest).has(exportKey)) {
          violations.push(
            `${repositoryPath}: ${specifier} is not a public export of ${localImport.workspace.name}.`,
          );
        }
      } else if (!exportedSubpaths(localImport.workspace.manifest).has('.')) {
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
      (specifier === '@prisma/client' ||
        specifier === 'prisma' ||
        specifier === '@sobama/api' ||
        specifier.startsWith('@sobama/api/') ||
        specifier === '@sobama/config' ||
        specifier.startsWith('@sobama/config/') ||
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

function manifestViolations(
  workspaces: readonly Workspace[],
  rootManifest: PackageManifest,
): string[] {
  const violations: string[] = [];
  const workspacesByName = new Map(workspaces.map((workspace) => [workspace.name, workspace]));

  for (const workspace of workspaces) {
    const shortName = workspace.name.split('/').at(-1) ?? workspace.name;
    if (
      workspace.directory.startsWith(resolve(repositoryRoot, 'packages')) &&
      (forbiddenGenericPackages.has(basename(workspace.directory)) ||
        forbiddenGenericPackages.has(shortName))
    ) {
      violations.push(
        `${toRepositoryPath(workspace.manifestPath)}: generic aggregator package ${workspace.name} is forbidden.`,
      );
    }

    const documentedTargets = allowedRuntimeDependencies[workspace.name];
    if (!documentedTargets) {
      violations.push(
        `${toRepositoryPath(workspace.manifestPath)}: add an explicit dependency policy for ${workspace.name}.`,
      );
    }
    const allowedTargets = documentedTargets ?? new Set<string>();

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
        const testOnlyDependency = dependency === '@sobama/testing' && field === 'devDependencies';
        if (!allowedTargets.has(dependency) && !testOnlyDependency) {
          violations.push(
            `${toRepositoryPath(workspace.manifestPath)}: ${workspace.name} may not depend on ${dependency} in ${field}.`,
          );
        }
      }
    }
  }

  for (const field of dependencyFields) {
    for (const [dependency, specifier] of Object.entries(rootManifest[field] ?? {})) {
      if (workspacesByName.has(dependency) && !specifier.startsWith('workspace:')) {
        violations.push(`package.json: ${field}.${dependency} must use the workspace: protocol.`);
      }
    }
  }

  return violations;
}

async function repositoryViolations(): Promise<string[]> {
  const workspaces = await readWorkspaces();
  const rootManifest = await readJson(resolve(repositoryRoot, 'package.json'));
  const violations = manifestViolations(workspaces, rootManifest);

  for (const workspace of workspaces) {
    for (const file of await findSourceFiles(workspace.directory)) {
      violations.push(
        ...importViolations(file, await readFile(file, 'utf8'), workspace, workspaces),
      );
    }
  }

  return violations;
}

describe('architecture boundaries', () => {
  it('keeps the repository inside the documented workspace and import boundaries', async () => {
    const violations = await repositoryViolations();
    expect(violations, violations.join('\n')).toEqual([]);
  });

  it('reports server imports in browser code with an actionable source path', async () => {
    const workspaces = await readWorkspaces();
    const web = workspaces.find((workspace) => workspace.name === '@sobama/web');
    expect(web).toBeDefined();
    const file = resolve(web?.directory ?? '', 'src/example.ts');

    expect(importViolations(file, "import '@sobama/config';", web!, workspaces)).toContain(
      'apps/web/src/example.ts: browser code may not import server runtime or persistence module @sobama/config.',
    );
  });

  it('reports framework imports in domain code', async () => {
    const workspaces = await readWorkspaces();
    const api = workspaces.find((workspace) => workspace.name === '@sobama/api');
    expect(api).toBeDefined();
    const file = resolve(api?.directory ?? '', 'src/identity/domain/member.ts');

    expect(importViolations(file, "import '@nestjs/common';", api!, workspaces)).toContain(
      'apps/api/src/identity/domain/member.ts: domain code must remain framework-free and may not import @nestjs/common.',
    );
  });

  it('reports internal package imports', async () => {
    const workspaces = await readWorkspaces();
    const api = workspaces.find((workspace) => workspace.name === '@sobama/api');
    expect(api).toBeDefined();
    const file = resolve(api?.directory ?? '', 'src/example.ts');

    expect(importViolations(file, "import '@sobama/config/internal';", api!, workspaces)).toContain(
      "apps/api/src/example.ts: @sobama/config/internal is internal; import the package's public facade instead.",
    );
  });

  it('reports relative imports across workspace boundaries', async () => {
    const workspaces = await readWorkspaces();
    const web = workspaces.find((workspace) => workspace.name === '@sobama/web');
    expect(web).toBeDefined();
    const file = resolve(web?.directory ?? '', 'src/example.ts');

    expect(importViolations(file, "import '../../api/src/main.js';", web!, workspaces)).toContain(
      'apps/web/src/example.ts: relative import ../../api/src/main.js crosses into @sobama/api; use its public package export.',
    );
  });

  it('reports workspace dependencies outside the documented matrix', async () => {
    const workspaces = await readWorkspaces();
    const web = workspaces.find((workspace) => workspace.name === '@sobama/web');
    expect(web).toBeDefined();
    const webWithServerDependency: Workspace = {
      ...web!,
      manifest: {
        ...web!.manifest,
        dependencies: {
          ...web!.manifest.dependencies,
          '@sobama/config': 'workspace:*',
        },
      },
    };
    const violations = manifestViolations(
      workspaces.map((workspace) =>
        workspace.name === webWithServerDependency.name ? webWithServerDependency : workspace,
      ),
      await readJson(resolve(repositoryRoot, 'package.json')),
    );

    expect(violations).toContain(
      'apps/web/package.json: @sobama/web may not depend on @sobama/config in dependencies.',
    );
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
    const violations = manifestViolations(
      [...workspaces.filter((workspace) => workspace.name !== '@sobama/shared'), shared],
      await readJson(resolve(repositoryRoot, 'package.json')),
    );

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
