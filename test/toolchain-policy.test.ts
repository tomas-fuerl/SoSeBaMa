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

/** The same settings under the kebab-case names that pnpm 11 no longer reads. */
const inertNpmrcKeys = [
  'engine-strict',
  'ignore-scripts',
  'save-exact',
  'strict-peer-dependencies',
] as const;

function read(relativePath: string): string {
  return readFileSync(resolve(repositoryRoot, relativePath), 'utf8');
}

const pinnedNodeVersion = read('.node-version').trim();

interface RootManifest {
  engines?: Record<string, string>;
}

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
 *    `engines` mismatch produced `[WARN] Unsupported engine` and exit code 0.
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

  it('keeps the silently ignored kebab-case keys out of .npmrc', () => {
    // A policy line in `.npmrc` suggests a safeguard that does not exist. The
    // file stays reserved for auth and registry settings.
    const npmrc = read('.npmrc');
    for (const key of inertNpmrcKeys) {
      expect(npmrc, key).not.toMatch(new RegExp(`^\\s*${key}\\s*=`, 'mu'));
    }
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

describe('pinned Node version', () => {
  it('names one concrete version rather than a range', () => {
    expect(pinnedNodeVersion).toMatch(/^\d+\.\d+\.\d+$/u);
  });

  it('requires that exact version through an exact engines entry', () => {
    // A range would let `engineStrict` accept a drifting patch level and would
    // silently defeat the stage assertion below.
    const manifest = JSON.parse(read('package.json')) as RootManifest;
    expect(manifest.engines?.node).toBe(pinnedNodeVersion);
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
});
