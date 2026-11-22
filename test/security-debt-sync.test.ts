import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  canonicalFinding,
  classifyFinding,
  deduplicateFindings,
  parseCompletePnpmAuditReport,
  parseCompleteTrivyReport,
  parseDependabotAlerts,
  parsePnpmAuditReport,
  parseTrivyReport,
  planSynchronization,
  remediationDeadline,
  SecurityDebtReportError,
  securityDebtKey,
} from '../tools/sync-security-debt.mjs';

const now = new Date('2026-11-11T10:00:00Z');
const repositoryRoot = resolve(fileURLToPath(new URL('../', import.meta.url)));

function finding(overrides: Record<string, unknown> = {}) {
  return {
    advisoryId: 'GHSA-AAAA-BBBB-CCCC',
    ecosystem: 'npm',
    packageName: 'minimatch',
    manifestPath: 'pnpm-lock.yaml',
    severity: 'high',
    scope: 'development',
    classification: 'general',
    installedVersions: ['10.2.6'],
    fixedVersions: [],
    sources: ['dependabot'],
    references: ['https://github.com/advisories/GHSA-AAAA-BBBB-CCCC'],
    ...overrides,
  };
}

function assessedBody(overrides: Record<string, string> = {}) {
  const values = {
    reachability: 'Nicht nachgewiesen oder wirksam begrenzt',
    exploitation: 'Nein',
    patchStatus: 'Kein Fix veröffentlicht',
    nextReview: '2026-11-13T10:00:00Z',
    usableFix: 'Unbekannt',
    ...overrides,
  };
  return `## Manuelle Risikoeinordnung

### Erreichbarkeit oder Exposition

${values.reachability}

### Aktive Ausnutzung

${values.exploitation}

### Patchstatus

${values.patchStatus}

### Nächster Prüfzeitpunkt

${values.nextReview}

### Verwendbarer Fix seit

${values.usableFix}

### Grund der Zurückstellung und Schutzmaßnahmen

Isolierter Entwicklungspfad; keine produktive Exposition.
`;
}

describe('stable identity and deduplication', () => {
  it('normalises case and a leading dot without merging different manifests', () => {
    const key = securityDebtKey(finding());

    expect(
      securityDebtKey(
        finding({
          advisoryId: 'ghsa-aaaa-bbbb-cccc',
          ecosystem: 'NPM',
          packageName: 'Minimatch',
          manifestPath: './pnpm-lock.yaml',
        }),
      ),
    ).toBe(key);
    expect(securityDebtKey(finding({ manifestPath: 'packages/api/package.json' }))).not.toBe(key);
  });

  it('merges scanner evidence and keeps the highest severity', () => {
    const [result] = deduplicateFindings([
      finding({ severity: 'medium', sources: ['pnpm-audit'], fixedVersions: ['11.0.7'] }),
      finding({ severity: 'high', sources: ['dependabot'], fixedVersions: [] }),
    ]);

    expect(result?.finding).toMatchObject({
      severity: 'high',
      fixedVersions: ['11.0.7'],
      sources: ['dependabot', 'pnpm-audit'],
    });
  });

  it('preserves scanner-derived scope when the other source does not report it', () => {
    expect(deduplicateFindings([finding({ scope: 'unknown' }), finding()])[0]?.finding.scope).toBe(
      'development',
    );
    expect(deduplicateFindings([finding(), finding({ scope: 'runtime' })])[0]?.finding.scope).toBe(
      'mixed',
    );
  });

  it('rejects absolute and parent-traversing manifest paths', () => {
    for (const manifestPath of ['/pnpm-lock.yaml', '../pnpm-lock.yaml']) {
      expect(() => canonicalFinding(finding({ manifestPath }))).toThrow(SecurityDebtReportError);
    }
  });

  it('rejects control characters in scanner identity and display data', () => {
    expect(() => canonicalFinding(finding({ packageName: 'minimatch\nforged' }))).toThrow(
      SecurityDebtReportError,
    );
    expect(() => canonicalFinding(finding({ installedVersions: ['10.2.6\nforged'] }))).toThrow(
      SecurityDebtReportError,
    );
  });
});

describe('scanner report parsing', () => {
  it('requires a complete audit summary before accepting a clean report', () => {
    const metadata = {
      totalDependencies: 315,
      vulnerabilities: { info: 0, low: 0, moderate: 0, high: 0, critical: 0 },
    };
    expect(parseCompletePnpmAuditReport({ advisories: {}, metadata })).toEqual([]);
    expect(() => parseCompletePnpmAuditReport({ advisories: {} })).toThrow(/scan summary/u);
    expect(() =>
      parseCompletePnpmAuditReport({
        advisories: {},
        metadata: { ...metadata, vulnerabilities: { ...metadata.vulnerabilities, high: 1 } },
      }),
    ).toThrow(/findings are missing/u);
  });

  it('distinguishes a clean lockfile scan from empty, missing and wrong target inventories', () => {
    const lockfileReport = {
      SchemaVersion: 2,
      ArtifactName: 'pnpm-lock.yaml',
      ArtifactType: 'filesystem',
      Results: [
        {
          Class: 'lang-pkgs',
          Type: 'pnpm',
          Target: 'pnpm-lock.yaml',
          Packages: [{ Name: 'demo' }],
        },
      ],
    };
    const parse = (report: unknown) =>
      parseCompleteTrivyReport(report, 'pnpm-lock.yaml', 'trivy-fs');
    expect(parse(lockfileReport)).toEqual([]);
    expect(() => parse({ ...lockfileReport, Results: [] })).toThrow(/coverage/u);
    expect(() =>
      parse({ ...lockfileReport, Results: [{ ...lockfileReport.Results[0], Packages: [] }] }),
    ).toThrow(/coverage/u);
    expect(() => parse({ ...lockfileReport, ArtifactName: '.' })).toThrow(/artifact/u);
  });

  it('requires the selected image and both backend package inventories', () => {
    const imageId = `sha256:${'a'.repeat(64)}`;
    const inventory = [{ Name: 'demo' }];
    const os = { Class: 'os-pkgs', Target: `${imageId} (debian 12.15)`, Packages: inventory };
    const node = { Class: 'lang-pkgs', Type: 'node-pkg', Target: 'Node.js', Packages: inventory };
    const imageReport = {
      SchemaVersion: 2,
      ArtifactName: imageId,
      ArtifactType: 'container_image',
      Results: [os, node],
    };
    const parse = (report: unknown) =>
      parseCompleteTrivyReport(
        report,
        'containers/backend.Dockerfile',
        'trivy-image-backend',
        imageId,
      );
    expect(parse(imageReport)).toEqual([]);
    expect(() => parse({ ...imageReport, Results: [os] })).toThrow(/coverage/u);
    expect(() => parse({ ...imageReport, Results: [node] })).toThrow(/coverage/u);
    expect(() => parse({ ...imageReport, ArtifactName: `sha256:${'b'.repeat(64)}` })).toThrow(
      /artifact/u,
    );
  });

  it('parses the pnpm 11 advisory format', () => {
    const parsed = parsePnpmAuditReport({
      advisories: {
        '1234': {
          module_name: 'minimatch',
          github_advisory_id: 'GHSA-AAAA-BBBB-CCCC',
          severity: 'high',
          vulnerable_versions: '<11.0.7',
          patched_versions: '>=11.0.7',
          title: 'Example advisory',
          url: 'https://github.com/advisories/GHSA-AAAA-BBBB-CCCC',
        },
      },
      metadata: { vulnerabilities: { high: 1 } },
    });

    expect(parsed).toEqual([
      expect.objectContaining({
        advisoryId: 'GHSA-AAAA-BBBB-CCCC',
        ecosystem: 'npm',
        packageName: 'minimatch',
        installedVersions: ['<11.0.7'],
        fixedVersions: ['>=11.0.7'],
        sources: ['pnpm-audit'],
      }),
    ]);
    expect(parsePnpmAuditReport({ advisories: {}, metadata: {} })).toEqual([]);
  });

  it('parses npm-compatible audit findings and fails closed on malformed reports', () => {
    const parsed = parsePnpmAuditReport({
      vulnerabilities: {
        minimatch: {
          severity: 'high',
          range: '<11.0.7',
          via: [
            {
              title: 'GHSA-AAAA-BBBB-CCCC: example',
              severity: 'high',
              range: '<11.0.7',
              url: 'https://github.com/advisories/GHSA-AAAA-BBBB-CCCC',
            },
          ],
          fixAvailable: { version: '11.0.7' },
        },
      },
    });

    expect(parsed).toEqual([
      expect.objectContaining({
        advisoryId: 'GHSA-AAAA-BBBB-CCCC',
        ecosystem: 'npm',
        packageName: 'minimatch',
        fixedVersions: ['11.0.7'],
        sources: ['pnpm-audit'],
      }),
    ]);
    expect(() => parsePnpmAuditReport({ vulnerabilities: { minimatch: null } })).toThrow(
      SecurityDebtReportError,
    );
    expect(() => parsePnpmAuditReport({})).toThrow(SecurityDebtReportError);
  });

  it('maps Trivy node packages to npm so reports deduplicate', () => {
    const parsed = parseTrivyReport(
      {
        Results: [
          {
            Class: 'lang-pkgs',
            Type: 'node-pkg',
            Vulnerabilities: [
              {
                VulnerabilityID: 'CVE-2026-12345',
                PkgName: 'minimatch',
                InstalledVersion: '10.2.6',
                FixedVersion: '11.0.7',
                Severity: 'HIGH',
                References: ['https://github.com/advisories/GHSA-AAAA-BBBB-CCCC'],
              },
            ],
          },
        ],
      },
      'pnpm-lock.yaml',
      'trivy-fs',
    );

    expect(parsed[0]).toMatchObject({
      advisoryId: 'GHSA-AAAA-BBBB-CCCC',
      ecosystem: 'npm',
      severity: 'high',
      sources: ['trivy-fs'],
    });
    expect(parseTrivyReport({ Results: [] }, 'pnpm-lock.yaml', 'trivy-fs')).toEqual([]);
    expect(() => parseTrivyReport({ Results: [{ Vulnerabilities: {} }] }, 'x', 'trivy-fs')).toThrow(
      SecurityDebtReportError,
    );
  });

  it('normalises pnpm moderate and info levels conservatively', () => {
    expect(canonicalFinding(finding({ severity: 'moderate' })).severity).toBe('medium');
    expect(canonicalFinding(finding({ severity: 'info' })).severity).toBe('low');
  });

  it('keeps open and auto-dismissed Dependabot alerts but ignores resolved alerts', () => {
    const alert = (state: string) => ({
      state,
      dependency: {
        package: { ecosystem: 'npm', name: 'minimatch' },
        manifest_path: 'pnpm-lock.yaml',
        scope: 'development',
        version_requirement: '10.2.6',
      },
      security_advisory: {
        ghsa_id: 'GHSA-AAAA-BBBB-CCCC',
        severity: 'high',
        classification: 'general',
      },
      security_vulnerability: {
        severity: 'high',
        first_patched_version: { identifier: '11.0.7' },
      },
      html_url: 'https://github.com/example/repository/security/dependabot/1',
    });

    expect(parseDependabotAlerts([alert('open'), alert('auto_dismissed')])).toHaveLength(2);
    expect(parseDependabotAlerts([alert('fixed'), alert('dismissed')])).toEqual([]);
    expect(() => parseDependabotAlerts([{}])).toThrow(SecurityDebtReportError);
  });
});

describe('classification and deadlines', () => {
  const safeAssessment = {
    reachability: 'Nicht nachgewiesen oder wirksam begrenzt',
    activeExploitation: 'Nein',
    patchStatus: 'Kein Fix veröffentlicht',
    nextReviewAt: new Date('2026-11-13T10:00:00Z'),
    deferralReason: 'Nur in der isolierten Build-Umgebung erreichbar.',
  };

  it.each([
    ['unknown severity', finding({ severity: 'unknown' }), safeAssessment],
    ['critical', finding({ severity: 'critical' }), safeAssessment],
    ['malware', finding({ classification: 'malware' }), safeAssessment],
    ['active exploitation', finding(), { ...safeAssessment, activeExploitation: 'Ja' }],
    ['reachable high', finding(), { ...safeAssessment, reachability: 'Nachweislich erreichbar' }],
  ])('requires an owner decision for %s', (_case, input, assessment) => {
    expect(classifyFinding(input, assessment, now)).toEqual({
      status: 'owner-decision-required',
      deferred: false,
    });
  });

  it('defers only a fully assessed finding with a future review', () => {
    expect(classifyFinding(finding(), safeAssessment, now)).toEqual({
      status: 'fix-unavailable',
      deferred: true,
    });
    expect(
      classifyFinding(finding(), { ...safeAssessment, nextReviewAt: new Date(now) }, now),
    ).toEqual({ status: 'fix-unavailable', deferred: false });
    expect(classifyFinding(finding(), {}, now)).toEqual({
      status: 'needs-assessment',
      deferred: false,
    });
  });

  it('recognises quarantine and starts deadlines only for a usable fix', () => {
    const published = finding({ fixedVersions: ['11.0.7'] });
    expect(
      classifyFinding(
        published,
        {
          ...safeAssessment,
          patchStatus: 'Fix veröffentlicht, Veröffentlichungsquarantäne aktiv',
          quarantineEndsAt: safeAssessment.nextReviewAt,
        },
        now,
      ),
    ).toEqual({ status: 'fix-quarantined', deferred: true });

    const usableFixAt = new Date('2026-11-13T10:00:00Z');
    expect(
      classifyFinding(
        published,
        {
          ...safeAssessment,
          patchStatus: 'Fix tatsächlich verwendbar',
          usableFixAt,
          fixQualification: 'https://example.org/proof',
        },
        usableFixAt,
      ),
    ).toEqual({
      status: 'fix-ready',
      deferred: false,
      deadline: new Date('2026-11-17T10:00:00Z'),
    });
  });

  it.each([
    ['high', '2026-11-17T10:00:00Z', '2026-11-17T10:00:01Z'],
    ['medium', '2026-11-20T10:00:00Z', '2026-11-20T10:00:01Z'],
    ['low', '2026-12-13T10:00:00Z', '2026-12-13T10:00:01Z'],
  ])(
    'enforces the maximum %s review interval from the last assessment',
    (severity, limit, late) => {
      const reviewedAt = new Date('2026-11-13T10:00:00Z');
      const runAt = new Date('2026-11-14T10:00:00Z');
      const input = finding({ severity });
      expect(
        classifyFinding(
          input,
          { ...safeAssessment, reviewedAt, nextReviewAt: new Date(limit) },
          runAt,
        ).deferred,
      ).toBe(true);
      expect(
        classifyFinding(
          input,
          { ...safeAssessment, reviewedAt, nextReviewAt: new Date(late) },
          runAt,
        ).deferred,
      ).toBe(false);
    },
  );

  it('requires known scope, a matching quarantine date and documented fix qualification', () => {
    expect(classifyFinding(finding({ scope: 'unknown' }), safeAssessment, now).deferred).toBe(
      false,
    );
    expect(classifyFinding(finding({ scope: 'mixed' }), safeAssessment, now).deferred).toBe(false);
    const published = finding({ fixedVersions: ['11.0.7'] });
    expect(
      classifyFinding(
        published,
        {
          ...safeAssessment,
          patchStatus: 'Fix veröffentlicht, Veröffentlichungsquarantäne aktiv',
          quarantineEndsAt: new Date('2026-11-13T11:00:00Z'),
        },
        now,
      ).deferred,
    ).toBe(false);
    expect(
      classifyFinding(
        published,
        {
          ...safeAssessment,
          patchStatus: 'Fix tatsächlich verwendbar',
          usableFixAt: now,
        },
        now,
      ).status,
    ).toBe('needs-assessment');
  });

  it.each([undefined, '   ', 'Noch zu bewerten.', '_No response_'])(
    'keeps a finding blocking when its deferral reason is incomplete (%s)',
    (deferralReason) => {
      expect(classifyFinding(finding(), { ...safeAssessment, deferralReason }, now)).toEqual({
        status: 'fix-unavailable',
        deferred: false,
      });
    },
  );

  it('requires reassessment when a scanner reports a previously unavailable fix', () => {
    const published = finding({ fixedVersions: ['11.0.7'] });
    expect(classifyFinding(published, safeAssessment, now)).toEqual({
      status: 'needs-assessment',
      deferred: false,
    });
  });

  it('calculates severity-specific deadlines', () => {
    const start = new Date('2026-11-13T10:00:00Z');
    expect(remediationDeadline('critical', start)).toEqual(start);
    expect(remediationDeadline('high', start)).toEqual(new Date('2026-11-17T10:00:00Z'));
    expect(remediationDeadline('medium', start)).toEqual(new Date('2026-11-20T10:00:00Z'));
    expect(remediationDeadline('low', start)).toEqual(new Date('2026-12-13T10:00:00Z'));
  });
});

describe('issue synchronization plan', () => {
  function createdIssue(input = finding()) {
    const [create] = planSynchronization([input], [], new Set(input.sources), { now });
    if (!create || create.type !== 'create') throw new Error('Expected a create action.');
    return {
      number: 7,
      state: 'open',
      title: create.title,
      body: create.body,
      labels: create.labels,
    };
  }

  it('updates one stable issue and preserves human-authored text and labels', () => {
    const issue = createdIssue();
    issue.body = issue.body.replace(
      '## Manuelle Risikoeinordnung',
      `${assessedBody()}\n## Notizen`,
    );
    issue.body += '\nBleibt beim nächsten automatischen Lauf erhalten.\n';
    issue.labels.push('help wanted');

    const [action] = planSynchronization(
      [finding({ sources: ['pnpm-audit', 'dependabot'] })],
      [issue],
      new Set(['pnpm-audit', 'dependabot']),
      { now: new Date('2026-11-12T10:00:00Z') },
    );

    expect(action).toMatchObject({ type: 'update', number: 7 });
    if (!action || action.type === 'close') throw new Error('Expected an update action.');
    expect(action.body).toContain('Bleibt beim nächsten automatischen Lauf erhalten.');
    expect(action.labels).toEqual(
      expect.arrayContaining(['help wanted', 'security', 'security-deferred', 'fix-unavailable']),
    );
  });

  it('reopens the same closed issue when a finding returns', () => {
    const issue = createdIssue();
    issue.state = 'closed';
    issue.body = assessedBody() + issue.body;
    expect(
      planSynchronization([finding()], [issue], new Set(['dependabot']), { now })[0],
    ).toMatchObject({
      type: 'reopen',
      number: 7,
      labels: ['fix-unavailable', 'security', 'severity:high'],
    });
  });

  it('removes the deferral label if a previously reporting scanner is missing', () => {
    const issue = createdIssue(finding({ sources: ['dependabot', 'pnpm-audit'] }));
    issue.body = assessedBody() + issue.body;
    issue.labels.push('security-deferred');
    const [action] = planSynchronization([finding()], [issue], ['dependabot'], { now });
    expect(action).toMatchObject({
      type: 'update',
      labels: ['fix-unavailable', 'security', 'severity:high'],
    });
  });

  it('removes deferral labels when the scanner first reports a fix', () => {
    const issue = createdIssue();
    issue.body = assessedBody() + issue.body;
    issue.labels.push('security-deferred', 'fix-unavailable');
    const [action] = planSynchronization(
      [finding({ fixedVersions: ['11.0.7'] })],
      [issue],
      new Set(['dependabot']),
      { now },
    );
    expect(action).toMatchObject({
      type: 'update',
      number: 7,
      labels: ['security', 'severity:high'],
    });
  });

  it('closes only after every source previously reporting the finding was checked', () => {
    const combined = finding({ sources: ['dependabot', 'pnpm-audit'] });
    const issue = createdIssue(combined);

    expect(planSynchronization([], [issue], new Set(['dependabot']), { now })).toEqual([]);
    expect(
      planSynchronization([], [issue], new Set(['dependabot', 'pnpm-audit']), { now }),
    ).toEqual([{ type: 'close', number: 7 }]);
  });

  it('does not auto-close a manual issue without scanner metadata', () => {
    const issue = {
      number: 8,
      state: 'open',
      labels: ['security'],
      body: `### Advisory oder CVE\n\nGHSA-AAAA-BBBB-CCCC\n\n### Ökosystem\n\nnpm\n\n### Paket\n\nminimatch\n\n### Relevantes Manifest\n\npnpm-lock.yaml\n\n### Severity\n\nhigh\n`,
    };
    expect(planSynchronization([], [issue], new Set(['dependabot']), { now })).toEqual([]);
  });

  it('fails closed when duplicate tracked issues exist', () => {
    const issue = createdIssue();
    expect(() =>
      planSynchronization([finding()], [issue, { ...issue, number: 9 }], new Set(['dependabot']), {
        now,
      }),
    ).toThrow(/Duplicate Security-Debt issues/u);
  });
});

describe('workflow trust boundary', () => {
  it('keeps issue writes off pull-request code and gated behind a real dry-run', () => {
    const workflow = readFileSync(
      resolve(repositoryRoot, '.github/workflows/security-debt.yml'),
      'utf8',
    );

    expect(workflow).not.toMatch(/^\s*pull_request(?:_target)?:/mu);
    expect(workflow).toContain("vars.SECURITY_DEBT_APPLY == 'true'");
    expect(workflow.match(/^\s+issues: write$/gmu)).toHaveLength(2);
    expect(
      workflow.match(
        /github.ref == 'refs\/heads\/main' && github.event.repository.default_branch == 'main'/gu,
      ),
    ).toHaveLength(2);
    expect(workflow.match(/ref: \$\{\{ github.sha \}\}/gu)).toHaveLength(2);
    expect(workflow).toContain('security-events: read');
    expect(workflow).not.toContain('secrets.');
    for (const use of workflow.matchAll(/^\s+uses:\s+(\S+)$/gmu)) {
      expect(use[1]).toMatch(/@[a-f\d]{40}$/u);
    }
  });

  it('rejects apply from a non-main ref before opening reports or calling GitHub', () => {
    const result = spawnSync(
      process.execPath,
      [
        resolve(repositoryRoot, 'tools/sync-security-debt.mjs'),
        '--apply',
        '--pnpm-audit=missing-report.json',
      ],
      {
        encoding: 'utf8',
        env: {
          GITHUB_TOKEN: 'test-placeholder',
          GITHUB_ACTIONS: 'true',
          GITHUB_REPOSITORY: 'example/repository',
          GITHUB_REF: 'refs/heads/feature',
        },
      },
    );
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('trusted main-branch');
  });
});
