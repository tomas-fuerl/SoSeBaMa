import { createHash } from 'node:crypto';

export const repository = 'tomas-fuerl/SoSeBaMa';
export const oid = (value) => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
export const sha256 = (value) => createHash('sha256').update(value).digest('hex');
export const number = (value) => Number.isSafeInteger(value) && value > 0;
const branch = (value) =>
  typeof value === 'string' &&
  /^ap-(?:0[0-9]|1[01])\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) &&
  value.length <= 80;
const path = (value) =>
  typeof value === 'string' &&
  value.length <= 240 &&
  value
    .split('/')
    .every(
      (part) =>
        /^(?:\.[a-z0-9_-]|[a-z0-9_-])[a-z0-9._-]*$/i.test(part) &&
        !part.endsWith('.') &&
        !/^\.git/i.test(part),
    );
const body = (value) => typeof value === 'string' && value.length <= 16000 && !value.includes('\0');
const title = (value) =>
  body(value) && value.length > 0 && value.length <= 200 && !/[\r\n]/.test(value);
export const exact = (obj, keys) =>
  obj !== null &&
  typeof obj === 'object' &&
  !Array.isArray(obj) &&
  Object.keys(obj).length === keys.length &&
  keys.every((key) => Object.hasOwn(obj, key));

const requests = {
  'issue.create': { title, body },
  'issue.update': { issue: number, title, body },
  'issue.comment': { issue: number, body },
  'branch.create': { branch },
  'branch.commit': { branch, head: oid, title, files: filesValid },
  'draft.create': { branch, title, body },
};

function filesValid(files) {
  return (
    Array.isArray(files) &&
    files.length > 0 &&
    files.length <= 50 &&
    files.every(
      (file) =>
        exact(file, ['path', 'contents']) &&
        path(file.path) &&
        (file.contents === null ||
          (typeof file.contents === 'string' &&
            file.contents.length <= 700000 &&
            Buffer.from(file.contents, 'base64').toString('base64') === file.contents)),
    ) &&
    new Set(files.map((file) => file.path.toLowerCase())).size === files.length
  );
}

export function validRequest(request) {
  if (!request || typeof request.op !== 'string' || !Object.hasOwn(requests, request.op))
    return false;
  const schema = requests[request.op];
  return (
    exact(request, ['op', ...Object.keys(schema)]) &&
    Object.entries(schema).every(([key, validate]) => validate(request[key]))
  );
}

const scopes = {
  'issue.create': { digest: (value) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value) },
  'issue.update': { issue: number },
  'issue.comment': { issue: number },
  'branch.create': { branch },
  'branch.commit': {
    branch,
    paths: (values) => Array.isArray(values) && values.length > 0 && values.every(path),
  },
  'draft.create': { branch },
};

function instant(value) {
  if (typeof value !== 'string') return NaN;
  const fields = /^(\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d)(Z|([+-])(\d\d):(\d\d))$/.exec(value);
  if (!fields) return NaN;
  const [, local, zone, sign, hours, minutes] = fields;
  if (zone === '-00:00' || Number(hours) > 23 || Number(minutes) > 59) return NaN;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return NaN;
  const offset =
    zone === 'Z' ? 0 : (Number(hours) * 60 + Number(minutes)) * (sign === '-' ? -1 : 1);
  return new Date(time + offset * 60000).toISOString().slice(0, 19) === local ? time : NaN;
}

export function authorized({ original, decisionIssue, repo, head }, config, request, now) {
  if (
    repo?.id !== config.repositoryId ||
    repo.full_name !== repository ||
    repo.default_branch !== 'main' ||
    head !== config.main ||
    decisionIssue?.number !== config.approvalIssue ||
    decisionIssue.state !== 'open' ||
    decisionIssue.user?.id !== config.ownerId ||
    decisionIssue.user.type !== 'User' ||
    decisionIssue.performed_via_github_app !== null ||
    decisionIssue.updated_at !== config.approvalIssueUpdatedAt ||
    typeof decisionIssue.body !== 'string' ||
    sha256(decisionIssue.body) !== config.approvalIssueDigest ||
    decisionIssue.pull_request ||
    request.issue === config.approvalIssue ||
    original?.id !== config.approvalComment ||
    original.user?.id !== config.ownerId ||
    original.updated_at !== config.approvalUpdatedAt ||
    original.user.type !== 'User' ||
    original.performed_via_github_app !== null ||
    original.issue_url !==
      `https://api.github.com/repos/${repository}/issues/${config.approvalIssue}` ||
    typeof original.body !== 'string' ||
    sha256(original.body) !== config.approvalDigest
  )
    return false;

  let grant;
  try {
    grant = JSON.parse(original.body);
  } catch {
    return false;
  }
  if (
    !exact(grant, [
      'version',
      'decision',
      'repository',
      'policyHead',
      'start',
      'review',
      'expires',
      'scope',
    ]) ||
    grant.version !== 1 ||
    grant.decision !== 'activate' ||
    grant.repository !== repository ||
    grant.policyHead !== head ||
    !Array.isArray(grant.scope) ||
    !grant.scope.length
  )
    return false;
  const [start, review, expires] = [grant.start, grant.review, grant.expires].map(instant);
  if (!(start <= now && now < review && review <= expires)) return false;

  return (
    grant.scope.every((rule) => {
      if (!rule || typeof rule.op !== 'string' || !Object.hasOwn(scopes, rule.op)) return false;
      const schema = scopes[rule.op];
      return (
        exact(rule, ['op', ...Object.keys(schema)]) &&
        Object.entries(schema).every(([key, validate]) => validate(rule[key]))
      );
    }) &&
    grant.scope.some((rule) => {
      if (rule.op !== request.op) return false;
      if (rule.digest) return rule.digest === sha256(JSON.stringify([request.title, request.body]));
      if (rule.issue) return rule.issue === request.issue;
      return (
        rule.branch === request.branch &&
        (!rule.paths || request.files.every((file) => rule.paths.includes(file.path)))
      );
    })
  );
}

export function validResponse(response) {
  if (!response || typeof response.status !== 'string') return false;
  if (
    ['locked', 'denied', 'unconfirmed', 'busy', 'unavailable', 'duplicate'].includes(
      response.status,
    )
  ) {
    return exact(response, ['status']);
  }
  if (!['ok', 'stopped'].includes(response.status) || !exact(response, ['status', 'result']))
    return false;
  const { result } = response;
  return (
    (exact(result, ['oid']) && oid(result.oid)) ||
    (exact(result, ['number']) && number(result.number)) ||
    (exact(result, ['id']) && number(result.id))
  );
}
