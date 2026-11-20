import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  canonicalFinding,
  classifyFinding,
  deduplicateFindings,
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
        },
        now,
      ),
    ).toEqual({ status: 'fix-quarantined', deferred: true });

    const usableFixAt = new Date('2026-11-13T10:00:00Z');
    expect(
      classifyFinding(
        published,
        { ...safeAssessment, patchStatus: 'Fix tatsächlich verwendbar', usableFixAt },
        now,
      ),
    ).toEqual({
      status: 'fix-ready',
      deferred: false,
      deadline: new Date('2026-11-17T10:00:00Z'),
    });
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
    const issue = { ...createdIssue(), state: 'closed' };
    expect(
      planSynchronization([finding()], [issue], new Set(['dependabot']), { now })[0],
    ).toMatchObject({ type: 'reopen', number: 7 });
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
    expect(workflow).toContain('security-events: read');
    expect(workflow).not.toContain('secrets.');
    for (const use of workflow.matchAll(/^\s+uses:\s+(\S+)$/gmu)) {
      expect(use[1]).toMatch(/@[a-f\d]{40}$/u);
    }
  });
});
