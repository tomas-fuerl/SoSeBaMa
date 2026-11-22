#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

/**
 * @typedef {'unknown' | 'low' | 'medium' | 'high' | 'critical'} Severity
 * @typedef {{
 *   advisoryId: string,
 *   ecosystem: string,
 *   packageName: string,
 *   manifestPath: string,
 *   severity: Severity,
 *   scope: string,
 *   classification: string,
 *   installedVersions: string[],
 *   fixedVersions: string[],
 *   sources: string[],
 *   references: string[],
 * }} Finding
 * @typedef {{
 *   reachability: string,
 *   activeExploitation: string,
 *   patchStatus: string,
 *   nextReviewAt: Date | undefined,
 *   reviewedAt: Date | undefined,
 *   quarantineEndsAt: Date | undefined,
 *   usableFixAt: Date | undefined,
 *   fixQualification: string | undefined,
 *   deferralReason: string | undefined,
 * }} Assessment
 * @typedef {{ status: string, deferred: boolean, deadline?: Date }} Classification
 * @typedef {{
 *   version: number,
 *   key: string,
 *   sources: string[],
 *   firstSeen: string,
 *   lastSeen: string,
 * }} FindingMetadata
 * @typedef {string | { name?: string }} IssueLabel
 * @typedef {{
 *   number: number,
 *   state: string,
 *   body?: string,
 *   labels?: IssueLabel[],
 *   title?: string,
 * }} TrackedIssue
 * @typedef {{ type: 'create', title: string, body: string, labels: string[] }} CreateAction
 * @typedef {{
 *   type: 'update' | 'reopen',
 *   number: number,
 *   title: string,
 *   body: string,
 *   labels: string[],
 * }} UpdateAction
 * @typedef {{ type: 'close', number: number }} CloseAction
 * @typedef {CreateAction | UpdateAction | CloseAction} SynchronizationAction
 * @typedef {{ now?: Date | string | number, scanUrl?: string }} SynchronizationOptions
 * @typedef {{ method?: string, body?: Record<string, unknown> }} GitHubRequestOptions
 * @typedef {{
 *   apply: boolean,
 *   dependabot: boolean,
 *   pnpmAudit: string[],
 *   trivy: [path: string, manifest: string, source: string, imageId?: string][],
 *   repository?: string,
 *   scanUrl?: string,
 *   help?: boolean,
 * }} CliOptions
 */

const AUTO_START = '<!-- security-debt:auto:start -->';
const AUTO_END = '<!-- security-debt:auto:end -->';
const KEY_PREFIX = 'security-debt-key:v1:';
const MANAGED_LABELS = new Set([
  'security',
  'security-deferred',
  'fix-unavailable',
  'fix-quarantined',
  'fix-ready',
  'severity:critical',
  'severity:high',
  'severity:medium',
  'severity:low',
  'severity:unknown',
]);
const SEVERITY_ORDER = new Map([
  ['low', 0],
  ['medium', 1],
  ['high', 2],
  ['critical', 3],
  ['unknown', 4],
]);
const TRIVY_IMAGE_MANIFESTS = new Map([
  ['trivy-image-backend', 'containers/backend.Dockerfile'],
  ['trivy-image-web', 'containers/web.Dockerfile'],
  ['trivy-image-browser', 'containers/browser.Dockerfile'],
]);

export class SecurityDebtReportError extends Error {
  /** @param {string} message */
  constructor(message) {
    super(message);
    this.name = 'SecurityDebtReportError';
  }
}

/** @param {unknown} value @returns {value is Record<string, unknown>} */
function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** @param {unknown} value @param {string} field @returns {string} */
function requiredString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new SecurityDebtReportError(`${field} must be a non-empty string.`);
  }
  const trimmed = value.trim();
  if (/\p{Cc}/u.test(trimmed)) {
    throw new SecurityDebtReportError(`${field} must not contain control characters.`);
  }
  return trimmed;
}

/** @param {unknown} value @returns {string | undefined} */
function optionalString(value) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

/** @param {unknown} value @returns {string} */
function normaliseManifest(value) {
  const manifest = requiredString(value, 'manifestPath')
    .replaceAll('\\', '/')
    .replace(/^\.\//u, '');
  if (manifest.startsWith('/') || manifest.split('/').includes('..')) {
    throw new SecurityDebtReportError('manifestPath must be repository-relative.');
  }
  return manifest;
}

/** @param {unknown} value @returns {Severity} */
function normaliseSeverity(value) {
  const reported = requiredString(value, 'severity').toLowerCase();
  const severity = reported === 'moderate' ? 'medium' : reported === 'info' ? 'low' : reported;
  if (!SEVERITY_ORDER.has(severity)) {
    throw new SecurityDebtReportError(`Unsupported severity: ${severity}.`);
  }
  return /** @type {Severity} */ (severity);
}

/** @param {unknown[]} values @returns {string[]} */
function uniqueStrings(values) {
  for (const value of values) {
    if (typeof value === 'string' && /\p{Cc}/u.test(value)) {
      throw new SecurityDebtReportError('Scanner text must not contain control characters.');
    }
  }
  return [
    ...new Set(
      values.flatMap((value) =>
        typeof value === 'string' && value.trim() !== '' ? [value.trim()] : [],
      ),
    ),
  ].toSorted();
}

/** @param {Severity} left @param {Severity} right @returns {Severity} */
function highestSeverity(left, right) {
  return (SEVERITY_ORDER.get(left) ?? -1) >= (SEVERITY_ORDER.get(right) ?? -1) ? left : right;
}

/** @param {unknown} input @returns {Finding} */
export function canonicalFinding(input) {
  if (!isRecord(input)) {
    throw new SecurityDebtReportError('Finding must be an object.');
  }
  const advisoryId = requiredString(input.advisoryId, 'advisoryId').toUpperCase();
  const ecosystem = requiredString(input.ecosystem, 'ecosystem').toLowerCase();
  const packageName = requiredString(input.packageName, 'packageName').toLowerCase();
  const manifestPath = normaliseManifest(input.manifestPath);
  const severity = normaliseSeverity(input.severity);
  const scope = optionalString(input.scope)?.toLowerCase() ?? 'unknown';
  const classification = optionalString(input.classification)?.toLowerCase() ?? 'general';
  const sources = uniqueStrings(Array.isArray(input.sources) ? input.sources : []);
  if (sources.length === 0) {
    throw new SecurityDebtReportError('Finding must name at least one scanner source.');
  }
  return {
    advisoryId,
    ecosystem,
    packageName,
    manifestPath,
    severity,
    scope,
    classification,
    installedVersions: uniqueStrings(
      Array.isArray(input.installedVersions) ? input.installedVersions : [],
    ),
    fixedVersions: uniqueStrings(Array.isArray(input.fixedVersions) ? input.fixedVersions : []),
    sources,
    references: uniqueStrings(Array.isArray(input.references) ? input.references : []),
  };
}

/** @param {unknown} input @returns {string} */
export function securityDebtKey(input) {
  const finding = canonicalFinding(input);
  const identity = [
    finding.advisoryId,
    finding.ecosystem,
    finding.packageName,
    finding.manifestPath,
  ].join('\u0000');
  return createHash('sha256').update(identity).digest('hex');
}

/** @param {unknown} inputs @returns {{ key: string, finding: Finding }[]} */
export function deduplicateFindings(inputs) {
  if (!Array.isArray(inputs)) {
    throw new SecurityDebtReportError('Findings must be an array.');
  }
  /** @type {Map<string, Finding>} */
  const findings = new Map();
  for (const input of inputs) {
    const finding = canonicalFinding(input);
    const key = securityDebtKey(finding);
    const previous = findings.get(key);
    if (!previous) {
      findings.set(key, finding);
      continue;
    }
    findings.set(key, {
      ...previous,
      severity: highestSeverity(previous.severity, finding.severity),
      scope:
        previous.scope === 'unknown'
          ? finding.scope
          : finding.scope === 'unknown' || previous.scope === finding.scope
            ? previous.scope
            : 'mixed',
      classification:
        previous.classification === 'malware' || finding.classification === 'malware'
          ? 'malware'
          : previous.classification,
      installedVersions: uniqueStrings([
        ...previous.installedVersions,
        ...finding.installedVersions,
      ]),
      fixedVersions: uniqueStrings([...previous.fixedVersions, ...finding.fixedVersions]),
      sources: uniqueStrings([...previous.sources, ...finding.sources]),
      references: uniqueStrings([...previous.references, ...finding.references]),
    });
  }
  return [...findings.entries()].map(([key, finding]) => ({ key, finding }));
}

/** @param {Record<string, unknown>} via @returns {string} */
function advisoryFromVia(via) {
  const haystack = [via.url, via.title, via.name]
    .filter((value) => typeof value === 'string')
    .join(' ');
  const identifier = /(?:GHSA-[\w-]+|CVE-\d{4}-\d+)/iu.exec(haystack)?.[0];
  if (identifier) return identifier;
  if (typeof via.source === 'number' || typeof via.source === 'string') return `NPM-${via.source}`;
  throw new SecurityDebtReportError('pnpm audit advisory has no stable identifier.');
}

/** @param {unknown} report @param {string} [manifestPath] @returns {Finding[]} */
export function parsePnpmAuditReport(report, manifestPath = 'pnpm-lock.yaml') {
  if (!isRecord(report)) {
    throw new SecurityDebtReportError('pnpm audit report must be an object.');
  }
  if (isRecord(report.advisories)) {
    return parsePnpmAdvisories(report.advisories, manifestPath);
  }
  if (!isRecord(report.vulnerabilities)) {
    throw new SecurityDebtReportError('pnpm audit report must contain an advisories object.');
  }
  return parseNpmStyleVulnerabilities(report.vulnerabilities, manifestPath);
}

/** @param {unknown} report @returns {Finding[]} */
export function parseCompletePnpmAuditReport(report) {
  const metadata = isRecord(report) && isRecord(report.metadata) ? report.metadata : undefined;
  const dependencies = metadata?.dependencies;
  const total =
    metadata?.totalDependencies ?? (isRecord(dependencies) ? dependencies.total : undefined);
  const counts = metadata?.vulnerabilities;
  if (
    !isRecord(report) ||
    report.error ||
    typeof total !== 'number' ||
    !Number.isInteger(total) ||
    total <= 0 ||
    !isRecord(counts)
  ) {
    throw new SecurityDebtReportError('pnpm audit report lacks a successful scan summary.');
  }
  const severityCounts = ['info', 'low', 'moderate', 'high', 'critical'].map(
    (severity) => counts[severity],
  );
  if (
    !severityCounts.every(
      (count) => typeof count === 'number' && Number.isInteger(count) && count >= 0,
    )
  ) {
    throw new SecurityDebtReportError('pnpm audit report has an incomplete severity summary.');
  }
  const findings = parsePnpmAuditReport(report);
  if (findings.length === 0 && severityCounts.some((count) => count !== 0)) {
    throw new SecurityDebtReportError('pnpm audit findings are missing from a nonempty summary.');
  }
  return findings;
}

/**
 * pnpm 11 emits one normalized advisory per numeric registry advisory ID.
 * The fallback identifier remains stable when a registry does not provide a
 * GHSA URL.
 *
 * @param {Record<string, unknown>} advisories
 * @param {string} manifestPath
 * @returns {Finding[]}
 */
function parsePnpmAdvisories(advisories, manifestPath) {
  /** @type {Finding[]} */
  const findings = [];
  for (const [registryId, advisory] of Object.entries(advisories)) {
    if (!isRecord(advisory)) {
      throw new SecurityDebtReportError(`Malformed pnpm audit advisory ${registryId}.`);
    }
    const ghsaId = optionalString(advisory.github_advisory_id);
    findings.push(
      canonicalFinding({
        advisoryId:
          ghsaId ??
          advisoryFromVia({
            url: advisory.url,
            title: advisory.title,
            source: registryId,
          }),
        ecosystem: 'npm',
        packageName: advisory.module_name,
        manifestPath,
        severity: advisory.severity,
        scope: 'unknown',
        classification: 'general',
        installedVersions: [optionalString(advisory.vulnerable_versions)].filter(Boolean),
        fixedVersions: [optionalString(advisory.patched_versions)].filter(Boolean),
        sources: ['pnpm-audit'],
        references: [optionalString(advisory.url)].filter(Boolean),
      }),
    );
  }
  return findings;
}

/**
 * Accept the npm-compatible shape as a defensive fallback for registries and
 * pnpm versions that proxy that representation.
 *
 * @param {Record<string, unknown>} vulnerabilities
 * @param {string} manifestPath
 * @returns {Finding[]}
 */
function parseNpmStyleVulnerabilities(vulnerabilities, manifestPath) {
  /** @type {Finding[]} */
  const findings = [];
  for (const [packageName, vulnerability] of Object.entries(vulnerabilities)) {
    if (!isRecord(vulnerability) || !Array.isArray(vulnerability.via)) {
      throw new SecurityDebtReportError(`Malformed pnpm audit entry for ${packageName}.`);
    }
    const advisories = vulnerability.via.filter(isRecord);
    for (const advisory of advisories) {
      const fixedVersion = isRecord(vulnerability.fixAvailable)
        ? optionalString(vulnerability.fixAvailable.version)
        : undefined;
      findings.push(
        canonicalFinding({
          advisoryId: advisoryFromVia(advisory),
          ecosystem: 'npm',
          packageName,
          manifestPath,
          severity: advisory.severity ?? vulnerability.severity,
          scope: 'unknown',
          classification: 'general',
          installedVersions: [
            optionalString(advisory.range) ?? optionalString(vulnerability.range),
          ].filter(Boolean),
          fixedVersions: fixedVersion ? [fixedVersion] : [],
          sources: ['pnpm-audit'],
          references: [optionalString(advisory.url)].filter(Boolean),
        }),
      );
    }
  }
  return findings;
}

/**
 * @param {unknown} report
 * @param {string} manifestPath
 * @param {string} source
 * @returns {Finding[]}
 */
export function parseTrivyReport(report, manifestPath, source) {
  if (!isRecord(report) || !Array.isArray(report.Results)) {
    throw new SecurityDebtReportError('Trivy report must contain a Results array.');
  }
  /** @type {Finding[]} */
  const findings = [];
  for (const result of report.Results) {
    if (!isRecord(result)) throw new SecurityDebtReportError('Malformed Trivy result.');
    const vulnerabilities = result.Vulnerabilities ?? [];
    if (!Array.isArray(vulnerabilities)) {
      throw new SecurityDebtReportError('Trivy Vulnerabilities must be an array.');
    }
    for (const vulnerability of vulnerabilities) {
      if (!isRecord(vulnerability))
        throw new SecurityDebtReportError('Malformed Trivy vulnerability.');
      const references = Array.isArray(vulnerability.References) ? vulnerability.References : [];
      findings.push(
        canonicalFinding({
          advisoryId: preferredTrivyAdvisoryId(vulnerability, references),
          ecosystem: trivyEcosystem(result),
          packageName: vulnerability.PkgName,
          manifestPath,
          severity: vulnerability.Severity,
          scope: source.startsWith('trivy-image') ? 'build-or-container' : 'unknown',
          classification: 'general',
          installedVersions: [optionalString(vulnerability.InstalledVersion)].filter(Boolean),
          fixedVersions: [optionalString(vulnerability.FixedVersion)].filter(Boolean),
          sources: [source],
          references: [optionalString(vulnerability.PrimaryURL), ...references].filter(Boolean),
        }),
      );
    }
  }
  return findings;
}

/**
 * @param {unknown} report
 * @param {string} manifest
 * @param {string} source
 * @param {string} [imageId]
 * @returns {Finding[]}
 */
export function parseCompleteTrivyReport(report, manifest, source, imageId) {
  if (!isRecord(report) || report.SchemaVersion !== 2 || !Array.isArray(report.Results)) {
    throw new SecurityDebtReportError(`Invalid Trivy report for ${source}.`);
  }
  const filesystem = source === 'trivy-fs';
  const expectedManifest = filesystem ? 'pnpm-lock.yaml' : TRIVY_IMAGE_MANIFESTS.get(source);
  if (
    manifest !== expectedManifest ||
    (filesystem ? imageId !== undefined : !/^sha256:[a-f\d]{64}$/u.test(imageId ?? '')) ||
    report.ArtifactName !== (filesystem ? expectedManifest : imageId) ||
    report.ArtifactType !== (filesystem ? 'filesystem' : 'container_image')
  ) {
    throw new SecurityDebtReportError(`Unexpected Trivy artifact for ${source}.`);
  }
  const inventories = report.Results.filter(
    (result) => isRecord(result) && Array.isArray(result.Packages) && result.Packages.length > 0,
  );
  const expectedInventory = filesystem
    ? inventories.some(
        (result) =>
          result.Class === 'lang-pkgs' && result.Type === 'pnpm' && result.Target === manifest,
      )
    : inventories.some(
        (result) =>
          result.Class === 'os-pkgs' &&
          typeof result.Target === 'string' &&
          result.Target.startsWith(`${imageId} (`),
      );
  const missingBackendPackages =
    source === 'trivy-image-backend' &&
    !inventories.some((result) => result.Class === 'lang-pkgs' && result.Type === 'node-pkg');
  if (
    !expectedInventory ||
    missingBackendPackages ||
    inventories.length !== report.Results.length
  ) {
    throw new SecurityDebtReportError(`Incomplete Trivy package coverage for ${source}.`);
  }
  return parseTrivyReport(report, manifest, source);
}

/**
 * Trivy often reports a CVE as VulnerabilityID while its reference list also
 * contains the GHSA used by pnpm and Dependabot. Prefer that alias so all
 * three sources converge on one identity when the report provides it.
 *
 * @param {Record<string, unknown>} vulnerability
 * @param {unknown[]} references
 * @returns {string}
 */
function preferredTrivyAdvisoryId(vulnerability, references) {
  const haystack = [vulnerability.PrimaryURL, ...references]
    .filter((value) => typeof value === 'string')
    .join(' ');
  return (
    /GHSA-[\w-]+/iu.exec(haystack)?.[0] ??
    requiredString(vulnerability.VulnerabilityID, 'VulnerabilityID')
  );
}

/** @param {Record<string, unknown>} result @returns {string} */
function trivyEcosystem(result) {
  const type = optionalString(result.Type)?.toLowerCase();
  if (type && ['node-pkg', 'npm', 'pnpm', 'yarn'].includes(type)) return 'npm';
  return type ?? optionalString(result.Class)?.toLowerCase() ?? 'trivy';
}

/** @param {unknown} alerts @returns {Finding[]} */
export function parseDependabotAlerts(alerts) {
  if (!Array.isArray(alerts)) {
    throw new SecurityDebtReportError('Dependabot alerts must be an array.');
  }
  /** @type {Finding[]} */
  const findings = [];
  for (const alert of alerts) {
    if (!isRecord(alert) || !isRecord(alert.dependency) || !isRecord(alert.security_advisory)) {
      throw new SecurityDebtReportError('Malformed Dependabot alert.');
    }
    if (typeof alert.state !== 'string') {
      throw new SecurityDebtReportError('Dependabot alert state is missing.');
    }
    if (!['open', 'auto_dismissed'].includes(alert.state)) continue;
    const dependencyPackage = alert.dependency.package;
    if (!isRecord(dependencyPackage))
      throw new SecurityDebtReportError('Dependabot package is missing.');
    const advisory = alert.security_advisory;
    const vulnerability = isRecord(alert.security_vulnerability)
      ? alert.security_vulnerability
      : undefined;
    const firstPatched = isRecord(vulnerability?.first_patched_version)
      ? optionalString(vulnerability.first_patched_version.identifier)
      : undefined;
    findings.push(
      canonicalFinding({
        advisoryId: advisory.ghsa_id ?? advisory.cve_id,
        ecosystem: dependencyPackage.ecosystem,
        packageName: dependencyPackage.name,
        manifestPath: alert.dependency.manifest_path,
        severity: vulnerability?.severity ?? advisory.severity,
        scope: alert.dependency.scope ?? 'unknown',
        classification: advisory.classification ?? 'general',
        installedVersions: [optionalString(alert.dependency.version_requirement)].filter(Boolean),
        fixedVersions: firstPatched ? [firstPatched] : [],
        sources: ['dependabot'],
        references: [optionalString(alert.html_url)].filter(Boolean),
      }),
    );
  }
  return findings;
}

/** @param {unknown} body @param {string} label @returns {string | undefined} */
function fieldValue(body, label) {
  if (typeof body !== 'string') return undefined;
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  return optionalString(
    new RegExp(`^### ${escaped}\\s*\\n+([^#][\\s\\S]*?)(?=\\n### |\\n## |$)`, 'mu').exec(body)?.[1],
  );
}

/** @param {unknown} value @returns {Date | undefined} */
function timestamp(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/u.test(
      value,
    ) ||
    Number.isNaN(Date.parse(value))
  ) {
    return undefined;
  }
  const day = value.slice(0, 10);
  if (new Date(day).toISOString().slice(0, 10) !== day) return undefined;
  return new Date(value);
}

/** @param {unknown} body @returns {Assessment} */
export function parseAssessment(body) {
  return {
    reachability: fieldValue(body, 'Erreichbarkeit oder Exposition') ?? 'Unbekannt',
    activeExploitation: fieldValue(body, 'Aktive Ausnutzung') ?? 'Unbekannt',
    patchStatus: fieldValue(body, 'Patchstatus') ?? 'Unbekannt',
    nextReviewAt: timestamp(fieldValue(body, 'Nächster Prüfzeitpunkt')),
    reviewedAt: timestamp(fieldValue(body, 'Letzte Risikoprüfung')),
    quarantineEndsAt: timestamp(fieldValue(body, 'Ende der Veröffentlichungsquarantäne')),
    usableFixAt: timestamp(fieldValue(body, 'Verwendbarer Fix seit')),
    fixQualification: fieldValue(body, 'Nachweis zur Fixqualifikation'),
    deferralReason: fieldValue(body, 'Grund der Zurückstellung und Schutzmaßnahmen'),
  };
}

/** @param {Date} date @param {number} days @returns {Date} */
function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/** @param {Date} date @param {number} days @returns {Date} */
function addBusinessDays(date, days) {
  const result = new Date(date);
  let remaining = days;
  while (remaining > 0) {
    result.setUTCDate(result.getUTCDate() + 1);
    if (![0, 6].includes(result.getUTCDay())) remaining -= 1;
  }
  return result;
}

/** @param {unknown} severity @param {Date | string | number} usableFixAt @returns {Date} */
export function remediationDeadline(severity, usableFixAt) {
  const normalised = normaliseSeverity(severity);
  const start = usableFixAt instanceof Date ? usableFixAt : new Date(usableFixAt);
  if (Number.isNaN(start.getTime())) throw new SecurityDebtReportError('usableFixAt is invalid.');
  if (normalised === 'critical') return new Date(start);
  if (normalised === 'high') return addBusinessDays(start, 2);
  if (normalised === 'medium') return addDays(start, 7);
  return addDays(start, 30);
}

/**
 * @param {unknown} findingInput
 * @param {Partial<Assessment> | undefined} assessmentInput
 * @param {Date | string | number} [nowInput]
 * @param {Date} [firstSeen]
 * @returns {Classification}
 */
export function classifyFinding(findingInput, assessmentInput, nowInput = new Date(), firstSeen) {
  const finding = canonicalFinding(findingInput);
  const assessment = assessmentInput ?? {};
  const now = nowInput instanceof Date ? nowInput : new Date(nowInput);
  if (Number.isNaN(now.getTime())) throw new SecurityDebtReportError('now is invalid.');
  const excluded =
    finding.severity === 'unknown' ||
    finding.severity === 'critical' ||
    finding.classification === 'malware' ||
    assessment.activeExploitation === 'Ja' ||
    (finding.severity === 'high' && assessment.reachability === 'Nachweislich erreichbar');
  if (excluded) return { status: 'owner-decision-required', deferred: false };

  if (
    assessment.patchStatus === 'Fix tatsächlich verwendbar' &&
    finding.fixedVersions.length > 0 &&
    assessment.usableFixAt &&
    assessment.usableFixAt <= now &&
    /^https:\/\/\S+$/u.test(assessment.fixQualification ?? '')
  ) {
    return {
      status: 'fix-ready',
      deferred: false,
      deadline: remediationDeadline(finding.severity, assessment.usableFixAt),
    };
  }

  let status = 'needs-assessment';
  if (assessment.patchStatus === 'Kein Fix veröffentlicht' && finding.fixedVersions.length === 0) {
    status = 'fix-unavailable';
  } else if (
    assessment.patchStatus === 'Fix veröffentlicht, Veröffentlichungsquarantäne aktiv' &&
    finding.fixedVersions.length > 0
  ) {
    status = 'fix-quarantined';
  }

  const riskAssessed =
    assessment.activeExploitation === 'Nein' &&
    assessment.reachability === 'Nicht nachgewiesen oder wirksam begrenzt';
  const reason = optionalString(assessment.deferralReason);
  const hasReason = Boolean(reason && !['Noch zu bewerten.', '_No response_'].includes(reason));
  const reviewFrom = assessment.reviewedAt ?? firstSeen ?? now;
  const nextReview = assessment.nextReviewAt;
  const reviewInTime =
    nextReview &&
    nextReview > now &&
    reviewFrom <= now &&
    (!firstSeen || reviewFrom >= firstSeen) &&
    (status === 'fix-quarantined'
      ? nextReview.getTime() === assessment.quarantineEndsAt?.getTime()
      : nextReview <= remediationDeadline(finding.severity, reviewFrom));
  return {
    status,
    deferred: Boolean(
      ['fix-unavailable', 'fix-quarantined'].includes(status) &&
      ['runtime', 'development', 'build-or-container'].includes(finding.scope) &&
      riskAssessed &&
      hasReason &&
      reviewInTime,
    ),
  };
}

/** @param {unknown} body @returns {Record<string, unknown> | undefined} */
function metadataFromBody(body) {
  if (typeof body !== 'string') return undefined;
  const encoded = /<!-- security-debt-metadata: (\{.*\}) -->/u.exec(body)?.[1];
  if (!encoded) return undefined;
  try {
    const parsed = JSON.parse(encoded);
    return isRecord(parsed) ? parsed : undefined;
  } catch {
    throw new SecurityDebtReportError('Existing issue has malformed security-debt metadata.');
  }
}

/** @param {unknown} body @returns {string | undefined} */
function keyFromBody(body) {
  if (typeof body !== 'string') return undefined;
  return new RegExp(`<!-- ${KEY_PREFIX}([a-f\\d]{64}) -->`, 'u').exec(body)?.[1];
}

/** @param {unknown} body @returns {Finding | undefined} */
function identityFromIssueForm(body) {
  const advisoryId = fieldValue(body, 'Advisory oder CVE');
  const ecosystem = fieldValue(body, 'Ökosystem');
  const packageName = fieldValue(body, 'Paket');
  const manifestPath = fieldValue(body, 'Relevantes Manifest');
  const severity = fieldValue(body, 'Severity');
  if (![advisoryId, ecosystem, packageName, manifestPath, severity].every(Boolean))
    return undefined;
  return canonicalFinding({
    advisoryId,
    ecosystem,
    packageName,
    manifestPath,
    severity,
    sources: ['manual'],
  });
}

/** @param {string[]} values @param {string} [fallback] @returns {string} */
function displayList(values, fallback = 'nicht gemeldet') {
  return values.length > 0 ? values.join(', ') : fallback;
}

/**
 * @param {string} key
 * @param {Finding} finding
 * @param {FindingMetadata} metadata
 * @param {string | undefined} scanUrl
 * @param {Classification} classification
 * @returns {string}
 */
function automaticBlock(key, finding, metadata, scanUrl, classification) {
  const deadline = classification.deadline?.toISOString() ?? 'noch nicht gestartet';
  const references = uniqueStrings([...finding.references, ...(scanUrl ? [scanUrl] : [])]);
  const data = JSON.stringify(metadata);
  return `${AUTO_START}
<!-- ${KEY_PREFIX}${key} -->
<!-- security-debt-metadata: ${data} -->
## Automatischer Scannerstand

- Advisory/CVE: \`${finding.advisoryId}\`
- Ökosystem: \`${finding.ecosystem}\`
- Paket: \`${finding.packageName}\`
- Manifest: \`${finding.manifestPath}\`
- Betroffene Version oder Range: ${displayList(finding.installedVersions)}
- Veröffentlichte Fixversion: ${displayList(finding.fixedVersions, 'keine')}
- Severity: \`${finding.severity}\`
- Scope: \`${finding.scope}\`
- Scannerquellen: ${finding.sources.join(', ')}
- Erster Fund: ${metadata.firstSeen}
- Letzter Fund: ${metadata.lastSeen}
- Automatischer Zustand: \`${classification.status}\`
- Befristet nicht blockierend: ${classification.deferred ? 'ja' : 'nein'}
- Umsetzungsfrist nach verwendbarem Fix: ${deadline}
- Nachweise: ${displayList(references, 'noch offen')}

Der automatische Zustand ist keine Risikoakzeptanz. Unvollständige manuelle
Risikoeinordnung bleibt fail-closed.
${AUTO_END}`;
}

/** @returns {string} */
function manualSection() {
  return `## Manuelle Risikoeinordnung

### Erreichbarkeit oder Exposition

Unbekannt

### Aktive Ausnutzung

Unbekannt

### Patchstatus

Unbekannt

### Nächster Prüfzeitpunkt

Unbekannt

### Letzte Risikoprüfung

Unbekannt

### Ende der Veröffentlichungsquarantäne

Unbekannt

### Verwendbarer Fix seit

Unbekannt

### Nachweis zur Fixqualifikation

Unbekannt

### Grund der Zurückstellung und Schutzmaßnahmen

Noch zu bewerten.

### Links zu Scan, PR und Ownerentscheidung

- Scan: siehe automatischer Scannerstand
- PR: noch offen
- Ownerentscheidung: nicht erforderlich oder noch offen
`;
}

/** @param {unknown} body @param {string} block @returns {string} */
function replaceAutomaticBlock(body, block) {
  if (typeof body !== 'string') {
    return `${block}\n\n${manualSection().trim()}\n`;
  }
  if (!body.includes(AUTO_START)) {
    return `${block}\n\n${body.trim() || manualSection().trim()}\n`;
  }
  const start = body.indexOf(AUTO_START);
  const end = body.indexOf(AUTO_END, start);
  if (end < 0)
    throw new SecurityDebtReportError('Existing issue has an incomplete automatic block.');
  return `${body.slice(0, start)}${block}${body.slice(end + AUTO_END.length)}`;
}

/**
 * @param {string[]} existingLabels
 * @param {Finding} finding
 * @param {Classification} classification
 * @returns {string[]}
 */
function desiredLabels(existingLabels, finding, classification) {
  const kept = existingLabels.filter((label) => !MANAGED_LABELS.has(label));
  const managed = ['security', `severity:${finding.severity}`];
  if (['fix-unavailable', 'fix-quarantined', 'fix-ready'].includes(classification.status)) {
    managed.push(classification.status);
  }
  if (classification.deferred) managed.push('security-deferred');
  return uniqueStrings([...kept, ...managed]);
}

/** @param {TrackedIssue} issue @returns {string | undefined} */
function issueKey(issue) {
  const direct = keyFromBody(issue.body);
  if (direct) return direct;
  const identity = identityFromIssueForm(issue.body);
  return identity ? securityDebtKey(identity) : undefined;
}

/**
 * @param {unknown} findingsInput
 * @param {unknown} issuesInput
 * @param {Iterable<string>} checkedSourcesInput
 * @param {SynchronizationOptions} [options]
 * @returns {SynchronizationAction[]}
 */
export function planSynchronization(findingsInput, issuesInput, checkedSourcesInput, options = {}) {
  if (!Array.isArray(issuesInput)) throw new SecurityDebtReportError('Issues must be an array.');
  const now = options.now instanceof Date ? options.now : new Date(options.now ?? Date.now());
  if (Number.isNaN(now.getTime())) throw new SecurityDebtReportError('now is invalid.');
  const scanUrl = optionalString(options.scanUrl);
  const checkedSources = new Set(checkedSourcesInput);
  const deduplicated = deduplicateFindings(findingsInput);
  /** @type {Map<string, TrackedIssue>} */
  const existing = new Map();

  for (const issueInput of issuesInput) {
    if (!isRecord(issueInput)) throw new SecurityDebtReportError('Malformed issue.');
    const issue = /** @type {TrackedIssue} */ (issueInput);
    const key = issueKey(issue);
    if (!key) continue;
    if (existing.has(key))
      throw new SecurityDebtReportError(`Duplicate Security-Debt issues for key ${key}.`);
    existing.set(key, issue);
  }

  /** @type {SynchronizationAction[]} */
  const actions = [];
  const activeKeys = new Set();
  for (const { key, finding } of deduplicated) {
    activeKeys.add(key);
    const issue = existing.get(key);
    const oldMetadata = metadataFromBody(issue?.body);
    const metadata = {
      version: 1,
      key,
      sources: uniqueStrings([
        ...(Array.isArray(oldMetadata?.sources) ? oldMetadata.sources : []),
        ...finding.sources,
      ]),
      firstSeen: optionalString(oldMetadata?.firstSeen) ?? now.toISOString(),
      lastSeen: now.toISOString(),
    };
    const assessment = parseAssessment(issue?.body ?? '');
    const firstSeen = timestamp(metadata.firstSeen);
    const classification = classifyFinding(finding, assessment, now, firstSeen);
    classification.deferred &&= Boolean(
      issue?.state === 'open' &&
      firstSeen &&
      metadata.sources.every((source) => checkedSources.has(source)),
    );
    const block = automaticBlock(key, finding, metadata, scanUrl, classification);
    const body = replaceAutomaticBlock(issue?.body, block);
    const existingLabels = Array.isArray(issue?.labels)
      ? issue.labels
          .map((label) => (typeof label === 'string' ? label : label.name))
          .filter((label) => typeof label === 'string')
      : [];
    const labels = desiredLabels(existingLabels, finding, classification);
    const title = `security: [${finding.advisoryId}] ${finding.packageName} in ${finding.manifestPath}`;
    actions.push(
      issue
        ? {
            type: issue.state === 'closed' ? 'reopen' : 'update',
            number: issue.number,
            title,
            body,
            labels,
          }
        : { type: 'create', title, body, labels },
    );
  }

  for (const [key, issue] of existing) {
    if (activeKeys.has(key) || issue.state === 'closed') continue;
    const metadata = metadataFromBody(issue.body);
    const sources = Array.isArray(metadata?.sources) ? metadata.sources : [];
    if (sources.length > 0 && sources.every((source) => checkedSources.has(source))) {
      actions.push({ type: 'close', number: issue.number });
    }
  }
  return actions;
}

/**
 * @param {string} path
 * @param {string} token
 * @param {GitHubRequestOptions} [options]
 * @returns {Promise<unknown>}
 */
async function githubRequest(path, token, options = {}) {
  /** @type {RequestInit} */
  const request = {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'SoSeBaMa-security-debt-sync',
    },
  };
  if (options.body) request.body = JSON.stringify(options.body);
  const response = await fetch(`https://api.github.com${path}`, request);
  if (!response.ok) {
    throw new Error(
      `GitHub API ${options.method ?? 'GET'} ${path} failed with ${response.status}.`,
    );
  }
  if (response.status === 204) return undefined;
  return response.json();
}

/** @param {string} path @param {string} token @returns {Promise<unknown[]>} */
async function listAll(path, token) {
  /** @type {unknown[]} */
  const items = [];
  for (let page = 1; ; page += 1) {
    const separator = path.includes('?') ? '&' : '?';
    const batch = await githubRequest(`${path}${separator}per_page=100&page=${page}`, token);
    if (!Array.isArray(batch)) throw new Error(`GitHub API ${path} did not return a list.`);
    items.push(...batch);
    if (batch.length < 100) return items;
  }
}

/**
 * @param {string} repository
 * @param {string} token
 * @param {SynchronizationAction[]} actions
 */
async function applyActions(repository, token, actions) {
  for (const action of actions) {
    if (action.type === 'create') {
      const created = await githubRequest(`/repos/${repository}/issues`, token, {
        method: 'POST',
        body: { title: action.title, body: action.body, labels: action.labels },
      });
      if (!isRecord(created) || typeof created.number !== 'number') {
        throw new Error('GitHub did not return the created issue number.');
      }
      console.log(`created #${created.number}`);
      continue;
    }
    const body =
      action.type === 'close'
        ? { state: 'closed', state_reason: 'completed' }
        : {
            title: action.title,
            body: action.body,
            labels: action.labels,
            ...(action.type === 'reopen' ? { state: 'open' } : {}),
          };
    await githubRequest(`/repos/${repository}/issues/${action.number}`, token, {
      method: 'PATCH',
      body,
    });
    const verb =
      action.type === 'reopen' ? 'reopened' : action.type === 'update' ? 'updated' : 'closed';
    console.log(`${verb} #${action.number}`);
  }
}

/** @returns {string} */
function usage() {
  return `Synchronize deduplicated Security-Debt issues from scanner JSON.

Usage:
  node tools/sync-security-debt.mjs [--apply] [--dependabot]
    [--pnpm-audit=PATH]
    [--trivy=PATH::MANIFEST::SOURCE[::IMAGE_ID]]
    [--repository=OWNER/REPOSITORY] [--scan-url=URL]

Default mode is a read-only dry-run. --apply requires GITHUB_TOKEN.

Exit codes:
  0  reports valid and synchronization planned or applied
  1  scanner, validation, tracking, or GitHub API failure
  2  invalid command line`;
}

/** @param {string[]} arguments_ @returns {CliOptions} */
function parseArguments(arguments_) {
  /** @type {CliOptions} */
  const options = { apply: false, dependabot: false, pnpmAudit: [], trivy: [] };
  for (const argument of arguments_) {
    if (argument === '--apply') options.apply = true;
    else if (argument === '--dependabot') options.dependabot = true;
    else if (argument.startsWith('--pnpm-audit=')) options.pnpmAudit.push(argument.slice(13));
    else if (argument.startsWith('--trivy=')) {
      const parts = argument.slice(8).split('::');
      if (![3, 4].includes(parts.length) || parts.some((part) => part === ''))
        throw new SecurityDebtReportError('Invalid --trivy argument.');
      options.trivy.push(/** @type {[string, string, string, string?]} */ (parts));
    } else if (argument.startsWith('--repository=')) options.repository = argument.slice(13);
    else if (argument.startsWith('--scan-url=')) options.scanUrl = argument.slice(11);
    else if (argument === '--help' || argument === '-h') options.help = true;
    else throw new SecurityDebtReportError(`Unknown argument: ${argument}`);
  }
  return options;
}

/** @param {string} path @returns {Promise<unknown>} */
async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new SecurityDebtReportError(`Cannot read valid JSON from ${path}: ${detail}`);
  }
}

/** @returns {Promise<number>} */
async function runCli() {
  /** @type {CliOptions} */
  let options;
  try {
    options = parseArguments(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    console.error(usage());
    return 2;
  }
  if (options.help) {
    console.log(usage());
    return 0;
  }
  const repository = options.repository ?? process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (!repository || !/^[\w.-]+\/[\w.-]+$/u.test(repository)) {
    console.error('A valid --repository or GITHUB_REPOSITORY is required.');
    return 2;
  }
  if (options.apply && !token) {
    console.error('--apply requires GITHUB_TOKEN.');
    return 2;
  }
  if (
    options.apply &&
    (process.env.GITHUB_ACTIONS !== 'true' ||
      process.env.GITHUB_REPOSITORY !== repository ||
      process.env.GITHUB_REF !== 'refs/heads/main' ||
      process.env.GITHUB_WORKFLOW_REF !==
        `${repository}/.github/workflows/security-debt.yml@refs/heads/main`)
  ) {
    console.error('--apply requires the trusted main-branch Security-debt workflow.');
    return 2;
  }

  try {
    /** @type {Finding[]} */
    const findings = [];
    const checkedSources = new Set();
    for (const path of options.pnpmAudit) {
      if (checkedSources.has('pnpm-audit'))
        throw new SecurityDebtReportError('Duplicate scanner source: pnpm-audit.');
      findings.push(...parseCompletePnpmAuditReport(await readJson(path)));
      checkedSources.add('pnpm-audit');
    }
    for (const [path, manifest, source, imageId] of options.trivy) {
      if (checkedSources.has(source))
        throw new SecurityDebtReportError(`Duplicate scanner source: ${source}.`);
      findings.push(...parseCompleteTrivyReport(await readJson(path), manifest, source, imageId));
      checkedSources.add(source);
    }
    if (options.dependabot) {
      if (!token) throw new Error('--dependabot requires GITHUB_TOKEN for read access.');
      const alerts = [
        ...(await listAll(`/repos/${repository}/dependabot/alerts?state=open`, token)),
        ...(await listAll(`/repos/${repository}/dependabot/alerts?state=auto_dismissed`, token)),
      ];
      findings.push(...parseDependabotAlerts(alerts));
      checkedSources.add('dependabot');
    }
    if (checkedSources.size === 0)
      throw new SecurityDebtReportError('At least one scanner source is required.');

    const issues = token
      ? await listAll(`/repos/${repository}/issues?state=all&labels=security`, token)
      : [];
    const synchronizationOptions = options.scanUrl ? { scanUrl: options.scanUrl } : {};
    const actions = planSynchronization(findings, issues, checkedSources, synchronizationOptions);
    if (options.apply) {
      if (!token) throw new Error('--apply requires GITHUB_TOKEN.');
      await applyActions(repository, token, actions);
    } else {
      const summaries = actions.map((action) =>
        Object.fromEntries(Object.entries(action).filter(([key]) => key !== 'body')),
      );
      console.log(JSON.stringify(summaries, null, 2));
    }
    return 0;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await runCli();
}
