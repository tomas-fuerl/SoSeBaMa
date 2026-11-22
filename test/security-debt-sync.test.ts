import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  applyActions,
  canonicalFinding,
  classifyFinding,
  createGitHubClient,
  deduplicateFindings,
  parseCompletePnpmAuditReport,
  parseCompleteTrivyReport,
  parseDependabotAlerts,
  parsePnpmAuditReport,
  parseTrivyReport,
  planSynchronization,
  remediationDeadline,
  runReport,
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
    expect(workflow).toContain('SECURITY_DEBT_APPLY: ${{ vars.SECURITY_DEBT_APPLY }}');
    expect(workflow.match(/\[\[ "\$SECURITY_DEBT_APPLY" == 'true' \]\]/gu)).toHaveLength(2);
    expect(workflow).toContain('cancel-in-progress: false');
    expect(workflow).toContain('needs: dependencies');
    expect(workflow.match(/timeout-minutes: 4$/gmu)).toHaveLength(2);
    expect(workflow.match(/^\s+issues: write$/gmu)).toHaveLength(2);
    expect(
      workflow.match(
        /github.ref == 'refs\/heads\/main'\s*&&\s*github.event.repository.default_branch == 'main'/gu,
      ),
    ).toHaveLength(2);
    expect(workflow.match(/ref: \$\{\{ github.sha \}\}/gu)).toHaveLength(2);
    const [workflowHeader, dependencyJob, imageJob] = workflow.split(
      /^ {2}(?=dependencies:|images:)/mu,
    );
    expect(workflowHeader).toContain('\npermissions:\n  contents: read\n\njobs:\n');
    expect(dependencyJob).toContain(
      '\n    permissions:\n      contents: read\n      issues: write\n      vulnerability-alerts: read\n    steps:\n',
    );
    expect(imageJob).toContain(
      '\n    permissions:\n      contents: read\n      issues: write\n    env:\n',
    );
    expect(workflow.match(/^\s+vulnerability-alerts: read$/gmu)).toHaveLength(1);
    expect(workflow).not.toMatch(
      /security-events:|permissions:\s*(?:read-all|write-all)|\bsecrets\s*(?:\.|\[)/u,
    );
    expect(workflow.match(/^\s+[A-Z_]*TOKEN: .+$/gmu)?.map((line) => line.trim())).toEqual([
      'GITHUB_TOKEN: ${{ github.token }}',
      'GITHUB_TOKEN: ${{ github.token }}',
    ]);
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
          GITHUB_WORKFLOW_REF:
            'example/repository/.github/workflows/security-debt.yml@refs/heads/feature',
          SECURITY_DEBT_APPLY: 'true',
        },
      },
    );
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('trusted main-branch');
  });
});

const repository = 'example/repository';
type Plan = ReturnType<typeof planSynchronization>;
type Issue = { number: number; state: string; title: string; body: string; labels: string[] };

function plans(count: number, issues: Issue[] = [], runAt = now) {
  const findings = Array.from({ length: count }, (_, n) =>
    finding({ packageName: `fixture-${n}` }),
  );
  return planSynchronization(findings, issues, ['dependabot'], { now: runAt });
}

function simulatedGitHub(limits = { batchSize: 2, maxWrites: 6 }) {
  const issues: Issue[] = [];
  const waits: number[] = [];
  const requests: string[] = [];
  const report = runReport(true);
  let clock = now.getTime();
  let intercept:
    ((method: string, url: URL, request: RequestInit) => Response | undefined) | undefined;
  let lostCreates = 0;
  let lostPatches = 0;
  const api = createGitHubClient('fixture-token', report, limits, {
    now: () => clock,
    sleep: async (delay) => {
      waits.push(delay);
      clock += delay;
    },
    fetcher: async (resource, raw) => {
      const url = new URL(String(resource));
      const request = raw ?? {};
      const method = request.method ?? 'GET';
      requests.push(method);
      const override = intercept?.(method, url, request);
      if (override) return override;
      const number = Number(url.pathname.split('/').at(-1));
      if (method === 'GET') {
        if (number) return Response.json(issues.find((issue) => issue.number === number));
        const page = Number(url.searchParams.get('page') ?? 1);
        return Response.json(issues.slice((page - 1) * 100, page * 100));
      }
      const body = JSON.parse(String(request.body));
      if (method === 'POST') {
        const issue = { number: issues.length + 1, state: 'open', ...body };
        issues.push(issue);
        if (lostCreates > 0) {
          lostCreates -= 1;
          throw new Error('private network error');
        }
        return Response.json(issue, { status: 201 });
      }
      const issue = issues.find((item) => item.number === number);
      if (!issue) return Response.json({}, { status: 404 });
      Object.assign(issue, body);
      if (lostPatches > 0) {
        lostPatches -= 1;
        return Response.json({}, { status: 503 });
      }
      return Response.json(issue);
    },
  });
  return {
    api,
    issues,
    report,
    requests,
    waits,
    apply: (plan: Plan, snapshot = structuredClone(issues)) =>
      applyActions(repository, api, plan, snapshot, report, limits),
    intercept: (handler: NonNullable<typeof intercept>) => {
      intercept = handler;
    },
    loseCreate: () => {
      lostCreates += 1;
    },
    losePatch: () => {
      lostPatches += 1;
    },
  };
}

describe('bounded GitHub writes', () => {
  it('processes multiple batches serially and leaves no pending actions on completion', async () => {
    const github = simulatedGitHub();
    const report = await github.apply(plans(5));
    expect(report).toMatchObject({
      status: 'complete',
      batches: 3,
      planned: 5,
      writeAttempts: 5,
      succeeded: { create: 5 },
      pending: { create: 0 },
    });
    expect(github.requests).toEqual(['GET', 'POST', 'POST', 'GET', 'POST', 'POST', 'GET', 'POST']);
    expect(github.waits).toEqual([1000, 1000, 1000, 1000]);
  });

  it('reports the unprocessed actions and their first key when the write limit is reached', async () => {
    const github = simulatedGitHub({ batchSize: 2, maxWrites: 2 });
    const report = await github.apply(plans(5));
    expect(report).toMatchObject({
      status: 'partial',
      reason: 'write-limit',
      planned: 5,
      succeeded: { create: 2 },
      pending: { create: 3 },
      stoppedAction: { type: 'create', key: expect.stringMatching(/^[a-f\d]{64}$/u) },
    });
    expect(github.issues).toHaveLength(2);
    const resumed = simulatedGitHub();
    resumed.issues.push(...github.issues);
    const freshPlan = plans(5, resumed.issues, new Date(now.getTime() + 86_400_000));
    expect(freshPlan.map(({ type }) => type)).toEqual(['create', 'create', 'create']);
    expect((await resumed.apply(freshPlan)).status).toBe('complete');
    expect(resumed.issues).toHaveLength(5);
  });

  it('reports progress by batch for a first-run backlog above one thousand findings', async () => {
    const limits = { batchSize: 10, maxWrites: 40 };
    const github = simulatedGitHub(limits);
    const progress: string[] = [];
    const report = await applyActions(
      repository,
      github.api,
      plans(1277),
      [],
      github.report,
      limits,
      (message) => progress.push(message),
    );
    expect(progress).toHaveLength(4);
    expect(JSON.parse(progress.at(-1) ?? '{}')).toMatchObject({
      event: 'batch-finished',
      batches: 4,
      succeeded: { create: 40 },
      pending: { create: 1237 },
    });
    expect(report).toMatchObject({ status: 'partial', reason: 'write-limit', writeAttempts: 40 });
  });

  it('respects HTTP 429 Retry-After and counts retry writes in the budget', async () => {
    const github = simulatedGitHub();
    let rejected = false;
    github.intercept((method) => {
      if (method !== 'POST' || rejected) return;
      rejected = true;
      return Response.json({}, { status: 429, headers: { 'Retry-After': '7' } });
    });
    expect(await github.apply(plans(1))).toMatchObject({
      status: 'complete',
      writeAttempts: 2,
      retries: 1,
      retryReasons: { 'secondary-rate-limit': 1 },
    });
    expect(github.waits).toEqual([7000]);
  });

  it('backs off for secondary limits and stops if the next wait exceeds the job budget', async () => {
    const github = simulatedGitHub();
    github.intercept(() =>
      Response.json({ message: 'You have exceeded a secondary rate limit' }, { status: 403 }),
    );
    await expect(github.api.request('/fixture')).rejects.toThrow(
      'time-budget:secondary-rate-limit',
    );
    expect(github.waits).toEqual([60_000]);
    expect(github.report.retries).toBe(1);
  });

  it('honors primary reset time and gives up after two retries for temporary read errors', async () => {
    const primary = simulatedGitHub();
    let calls = 0;
    primary.intercept(() => {
      if (calls++ > 0) return;
      return Response.json(
        {},
        {
          status: 403,
          headers: {
            'x-ratelimit-remaining': '0',
            'x-ratelimit-reset': String(now.getTime() / 1000 + 8),
            'Retry-After': '3',
          },
        },
      );
    });
    await expect(primary.api.request('/fixture')).resolves.toEqual([]);
    expect(primary.waits).toEqual([9000]);
    expect(primary.report.retryReasons).toEqual({ 'primary-rate-limit': 1 });
    const server = simulatedGitHub();
    server.intercept(() => Response.json({}, { status: 503 }));
    await expect(server.api.request('/fixture')).rejects.toThrow('retry-budget:http-503');
    expect(server.waits).toEqual([1000, 2000]);
  });

  it.each([401, 403])('does not retry HTTP %s permission errors', async (status) => {
    const github = simulatedGitHub();
    github.intercept((method) =>
      method === 'POST' ? Response.json({ message: 'sensitive response' }, { status }) : undefined,
    );
    const report = await github.apply(plans(1));
    expect(report).toMatchObject({
      status: 'failed',
      reason: `http-${status}`,
      retries: 0,
      pending: { create: 1 },
    });
    expect(JSON.stringify(report)).not.toContain('sensitive response');
  });

  it('retains confirmed progress and stops on a rejected write', async () => {
    const github = simulatedGitHub();
    github.intercept((method) =>
      method === 'POST' && github.issues.length === 1
        ? Response.json({}, { status: 403 })
        : undefined,
    );
    expect(await github.apply(plans(4))).toMatchObject({
      status: 'partial',
      reason: 'http-403',
      succeeded: { create: 1 },
      pending: { create: 3 },
    });
  });

  it('reconciles a Create with a lost response without issuing another POST', async () => {
    const github = simulatedGitHub();
    github.loseCreate();
    expect(await github.apply(plans(1))).toMatchObject({
      status: 'complete',
      reconciled: 1,
      succeeded: { create: 1 },
      writeAttempts: 1,
    });
    expect(github.requests).toEqual(['GET', 'POST', 'GET']);
    expect(plans(1, github.issues)).toEqual([]);
  });

  it('stops on an unconfirmed Create and checks for a late Issue before any new POST', async () => {
    const github = simulatedGitHub();
    const [action] = plans(1);
    if (action?.type !== 'create') throw new Error('Expected a create action.');
    github.intercept((method) =>
      method === 'POST' ? Response.json({}, { status: 502 }) : undefined,
    );
    expect(await github.apply([action])).toMatchObject({
      status: 'failed',
      reason: 'unconfirmed:ambiguous-http-502',
      pending: { create: 1 },
    });
    expect(github.requests).toEqual(['GET', 'POST', 'GET']);
    const resumed = simulatedGitHub();
    resumed.issues.push({ number: 8, state: 'closed', ...action });
    expect(await resumed.apply([action])).toMatchObject({
      status: 'failed',
      reason: 'tracking-changed-before-create',
      writeAttempts: 0,
    });
    expect(plans(1, resumed.issues)[0]?.type).toBe('reopen');
  });

  it('finds a matching issue on a later page before attempting to create', async () => {
    const github = simulatedGitHub();
    const [action] = plans(1);
    if (action?.type !== 'create') throw new Error('Expected a create action.');
    for (let n = 0; n < 100; n += 1) {
      github.issues.push({
        number: n + 1,
        state: 'open',
        title: 'Other issue',
        body: '',
        labels: [],
      });
    }
    github.issues.push({ number: 101, state: 'open', ...action, labels: [] });
    expect(await github.apply([action])).toMatchObject({
      reason: 'tracking-changed-before-create',
      writeAttempts: 0,
    });
    expect(github.requests).toEqual(['GET', 'GET']);
  });

  it('records a reopen and a scanner-confirmed close independently', async () => {
    const github = simulatedGitHub();
    const [first, second] = plans(2);
    if (first?.type !== 'create' || second?.type !== 'create')
      throw new Error('Expected create actions.');
    github.issues.push(
      { number: 1, state: 'closed', ...first },
      { number: 2, state: 'open', ...second },
    );
    const plan = plans(1, github.issues);
    expect(await github.apply(plan)).toMatchObject({
      status: 'complete',
      succeeded: { reopen: 1, close: 1 },
      pending: { reopen: 0, close: 0 },
    });
    expect(github.issues.map(({ state }) => state)).toEqual(['open', 'closed']);
  });

  it('reconciles an ambiguous update, keeps manual notes and avoids a repeat update', async () => {
    const github = simulatedGitHub();
    const [create] = plans(1);
    if (create?.type !== 'create') throw new Error('Expected a create action.');
    github.issues.push({
      number: 7,
      state: 'open',
      ...create,
      title: 'Previous title',
      body: create.body + '\nManual notes.',
    });
    github.losePatch();
    const plan = plans(1, github.issues);
    expect(await github.apply(plan)).toMatchObject({
      status: 'complete',
      reconciled: 1,
      succeeded: { update: 1 },
      writeAttempts: 1,
    });
    expect(github.issues).toHaveLength(1);
    expect(github.issues[0]?.body).toContain('Manual notes.');
    expect(plans(1, github.issues, new Date(now.getTime() + 86_400_000))).toEqual([]);
  });

  it('leaves a concurrent human edit intact and records the remaining update', async () => {
    const github = simulatedGitHub();
    const [create] = plans(1);
    if (create?.type !== 'create') throw new Error('Expected a create action.');
    github.issues.push({ number: 3, state: 'open', ...create, title: 'Previous title' });
    const baseline = structuredClone(github.issues);
    const plan = plans(1, baseline);
    github.issues[0]!.body += '\nManual review added after planning.';
    expect(await github.apply(plan, baseline)).toMatchObject({
      status: 'failed',
      reason: 'tracking-changed-before-update',
      writeAttempts: 0,
      pending: { update: 1 },
    });
    expect(github.issues[0]?.body).toContain('Manual review added after planning.');
  });
});

describe('workflow CLI summary and write gate', () => {
  function cli(report: unknown, apply: boolean, enabled = false) {
    const directory = mkdtempSync(join(tmpdir(), 'security-debt-test-'));
    const file = join(directory, 'audit.json');
    const simulatedFetch = `globalThis.fetch = async (_, request) => {
      if (request.method !== "GET") console.error("UNEXPECTED_WRITE");
      return Response.json([]);
    }`;
    const preload = 'data:text/javascript,' + encodeURIComponent(simulatedFetch);
    try {
      writeFileSync(file, JSON.stringify(report));
      return spawnSync(
        process.execPath,
        [
          '--import',
          preload,
          resolve(repositoryRoot, 'tools/sync-security-debt.mjs'),
          `--pnpm-audit=${file}`,
          ...(apply ? ['--apply'] : []),
        ],
        {
          encoding: 'utf8',
          env: {
            GITHUB_TOKEN: 'fixture-token',
            GITHUB_ACTIONS: 'true',
            GITHUB_REPOSITORY: repository,
            GITHUB_REF: 'refs/heads/main',
            GITHUB_WORKFLOW_REF: `${repository}/.github/workflows/security-debt.yml@refs/heads/main`,
            SECURITY_DEBT_APPLY: enabled ? 'true' : 'false',
          },
        },
      );
    } finally {
      rmSync(directory, { recursive: true });
    }
  }

  it('keeps the dry-run JSON on stdout and never writes even with the apply variable present', () => {
    const result = cli(
      {
        advisories: {
          1: {
            github_advisory_id: 'GHSA-aaaa-bbbb-cccc',
            module_name: 'demo',
            vulnerable_versions: '<1.0.0',
            severity: 'high',
          },
        },
        metadata: {
          totalDependencies: 1,
          vulnerabilities: { info: 0, low: 0, moderate: 0, high: 1, critical: 0 },
        },
      },
      false,
      true,
    );
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject([{ type: 'create' }]);
    expect(JSON.parse(result.stderr)).toMatchObject({
      mode: 'dry-run',
      status: 'complete',
      pending: { create: 1 },
      writeAttempts: 0,
    });
  });

  it('refuses apply without explicit opt-in even on the trusted ref', () => {
    expect(cli({}, true).status).toBe(2);
  });

  it('marks failed scanner validation and leaves GitHub untouched', () => {
    const result = cli({ advisories: {} }, true, true);
    expect(result.status).toBe(1);
    expect(result.stdout).toBe('');
    expect(result.stderr).not.toContain('UNEXPECTED_WRITE');
    expect(JSON.parse(result.stderr.trimEnd().split('\n').at(-1) ?? '{}')).toMatchObject({
      status: 'failed',
      reason: 'invalid-scan-or-plan',
      planned: null,
      writeAttempts: 0,
    });
  });
});
