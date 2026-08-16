import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const repositoryRoot = resolve(fileURLToPath(new URL('../', import.meta.url)));

const dockerfiles = ['containers/backend.Dockerfile', 'containers/web.Dockerfile'] as const;

const policySettings = [
  'engineStrict',
  'ignoreScripts',
  'saveExact',
  'strictPeerDependencies',
] as const;

function read(relativePath: string): string {
  return readFileSync(resolve(repositoryRoot, relativePath), 'utf8');
}

/**
 * Paths matching `pathspec` that git currently tracks.
 *
 * An ignore rule alone proves nothing about a file that was committed before
 * the rule existed — git keeps tracking it. Only the index answers that.
 */
function trackedPaths(pathspec: string): string[] {
  const output = execFileSync('git', ['ls-files', '--', pathspec], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  });
  return output.split('\n').filter((line) => line.length > 0);
}

/** Non-empty, non-comment lines of an ignore file. */
function ignorePatterns(relativePath: string): string[] {
  return read(relativePath)
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

const pinnedNodeVersion = read('.node-version').trim();

interface RootManifest {
  devDependencies?: Record<string, string>;
  engines?: Record<string, string>;
  packageManager?: string;
}

function readRootManifest(): RootManifest {
  return JSON.parse(read('package.json')) as RootManifest;
}

/** `24.18.1` and `24.13.3` share the major `24`. */
function major(version: string): string {
  return version.split('.')[0] ?? version;
}

/** Every place that activates pnpm through corepack. */
const corepackSources = [
  'containers/backend.Dockerfile',
  'containers/web.Dockerfile',
  '.github/workflows/quality.yml',
] as const;

/**
 * Guards the installation policy and the pinned Node version.
 *
 * These assertions read files only and need no Docker daemon, so they run in
 * `pnpm check` and in the `repository` CI job rather than only in the container
 * job. A drift is therefore visible before an image is ever built.
 *
 * They close two regressions found on 2026-08-16:
 *
 * 1. The whole installation policy lived in `.npmrc`, where pnpm 11 ignores it.
 *    pnpm reads only auth and registry settings from that file. Measured: a
 *    lifecycle script still executed with `ignore-scripts=true` set, and an
 *    `engines.node` mismatch produced `[WARN] Unsupported engine` and exit
 *    code 0. `.npmrc` is now gitignored, as the vendor requires for an auth
 *    file, so the policy has exactly one home.
 * 2. A base image bump to a different Node patch level passed every check for
 *    the same reason, leaving the container on a Node version that no other
 *    file in the repository declared.
 */
describe('installation policy', () => {
  it('declares every policy value where pnpm actually reads it', () => {
    const workspace = read('pnpm-workspace.yaml');
    for (const setting of policySettings) {
      expect(workspace, setting).toMatch(new RegExp(`^${setting}: true$`, 'mu'));
    }
  });

  it('keeps .npmrc out of version control and out of the build context', () => {
    // Under pnpm 11 `.npmrc` is an auth and registry file; the vendor requires
    // it to be gitignored. A policy line placed there would be inert anyway,
    // so the invariant worth enforcing is that credentials cannot be committed
    // or shipped into a build context by accident.
    //
    // The index is checked as well as the ignore rules: git keeps tracking a
    // file that was committed before its ignore rule existed, so the rules on
    // their own would not carry the claim this test makes.
    expect(trackedPaths('.npmrc'), '.npmrc liegt im Git-Index').toEqual([]);
    expect(ignorePatterns('.gitignore'), '.gitignore').toContain('.npmrc');
    expect(ignorePatterns('.dockerignore'), '.dockerignore').toContain('.npmrc');
  });

  it('carries the policy into both container builds', () => {
    for (const dockerfile of dockerfiles) {
      const lines = read(dockerfile).split('\n');
      const copyIndex = lines.findIndex(
        (line) => line.startsWith('COPY ') && line.split(/\s+/u).includes('pnpm-workspace.yaml'),
      );
      const installIndex = lines.findIndex((line) => /^RUN\s+pnpm install\b/u.test(line));

      expect(installIndex, `${dockerfile}: kein 'RUN pnpm install' gefunden`).toBeGreaterThan(-1);
      expect(copyIndex, `${dockerfile}: 'pnpm-workspace.yaml' wird nicht kopiert`).toBeGreaterThan(
        -1,
      );
      expect(
        copyIndex,
        `${dockerfile}: 'pnpm-workspace.yaml' wird erst nach der Installation kopiert`,
      ).toBeLessThan(installIndex);
    }
  });
});

/**
 * Every place that has to run the identical Node build.
 *
 * `engineStrict` does not produce this equality. It hardens `engines.node`
 * against the *running* interpreter at install time and cannot see
 * `.node-version` or a Dockerfile at all. Keeping the declarations in sync is
 * what these assertions do, and only together do the two mechanisms make the
 * pin real.
 */
describe('pinned Node version', () => {
  it('names one concrete version rather than a range', () => {
    expect(pinnedNodeVersion).toMatch(/^\d+\.\d+\.\d+$/u);
  });

  it('requires that exact version through an exact engines entry', () => {
    // A range would let `engineStrict` accept a drifting patch level and would
    // silently defeat the stage assertion below.
    expect(readRootManifest().engines?.node).toBe(pinnedNodeVersion);
  });

  it('builds every Node stage on exactly that version', () => {
    for (const dockerfile of dockerfiles) {
      const tags = [...read(dockerfile).matchAll(/^FROM\s+node:([^\s@]+)/gmu)]
        .map((match) => match[1])
        .filter((tag): tag is string => tag !== undefined);

      expect(tags.length, `${dockerfile}: keine Node-Basisstufe gefunden`).toBeGreaterThan(0);
      for (const tag of tags) {
        // `24.18.1-bookworm-slim` traegt die Version vor der Variante.
        expect(tag.split('-')[0], `${dockerfile}: ${tag}`).toBe(pinnedNodeVersion);
      }
    }
  });

  it('types the runtime against the same Node major', () => {
    // `@types/node` follows Node's major line only. Its minor and patch levels
    // are DefinitelyTyped's own and never match the runtime, so demanding full
    // equality here would be wrong and permanently red. The major is the part
    // that decides which APIs are declared, and `.github/dependabot.yml` keeps
    // it in line by ignoring major updates for this package.
    const declared = readRootManifest().devDependencies?.['@types/node'];
    expect(declared, '@types/node fehlt in den devDependencies').toBeDefined();
    expect(major(declared ?? ''), `@types/node ${declared ?? ''}`).toBe(major(pinnedNodeVersion));
  });
});

/**
 * The pnpm half of the same problem.
 *
 * Unlike the Node side, `engines.pnpm` needs no `engineStrict`: pnpm rejects an
 * unsatisfiable pnpm range on its own. Measured — with the switch removed, an
 * unsatisfiable `engines.pnpm` still aborts while an unsatisfiable
 * `engines.node` only warns. The abort text is `bad pnpm and/or Node.js
 * version` either way and does not reveal which rule fired.
 *
 * What neither mechanism sees is the version corepack actually activates, and
 * that is what the assertions below cover.
 */
describe('pinned pnpm version', () => {
  const manifest = readRootManifest();
  const pinnedPnpmVersion = manifest.packageManager?.replace(/^pnpm@/u, '') ?? '';

  it('names one concrete version in packageManager', () => {
    expect(pinnedPnpmVersion).toMatch(/^\d+\.\d+\.\d+$/u);
  });

  it('requires that exact version through an exact engines entry', () => {
    expect(manifest.engines?.pnpm).toBe(pinnedPnpmVersion);
  });

  it('activates exactly that version wherever corepack prepares pnpm', () => {
    for (const source of corepackSources) {
      const versions = [...read(source).matchAll(/corepack prepare pnpm@(\S+)\s/gu)]
        .map((match) => match[1])
        .filter((version): version is string => version !== undefined);

      expect(versions.length, `${source}: kein 'corepack prepare pnpm@'`).toBeGreaterThan(0);
      for (const version of versions) {
        expect(version, source).toBe(pinnedPnpmVersion);
      }
    }
  });
});
