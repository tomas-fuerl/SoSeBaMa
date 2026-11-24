import { setTimeout as delay } from 'node:timers/promises';
import { number, oid, repository } from './policy.mjs';

const root = `/repos/${repository}`;
const wipNotice = '\n\nWIP-Zuordnung: von Codex über den GitHub-Schreibdienst erstellt.';
const commitMutation = `mutation Commit($input: CreateCommitOnBranchInput!) {
  createCommitOnBranch(input: $input) { commit { oid } }
}`;

const permission = {
  'issue.create': 'issues',
  'issue.update': 'issues',
  'issue.comment': 'issues',
  'branch.create': 'contents',
  'branch.commit': 'contents',
  'draft.create': 'pull_requests',
};

export function github(config, signAppJwt, fetcher = fetch) {
  async function call(path, { method = 'GET', token, payload, status = 200 } = {}) {
    const response = await fetcher(`https://api.github.com${path}`, {
      method,
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
      headers: {
        accept: 'application/vnd.github+json',
        'x-github-api-version': '2022-11-28',
        'cache-control': 'no-cache',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(payload ? { 'content-type': 'application/json' } : {}),
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });
    if (response.status !== status) {
      await response.body?.cancel();
      throw new Error('GitHub request failed');
    }
    return status === 204 ? undefined : response.json();
  }

  function id(value, key) {
    if (!number(value)) throw new Error('Unknown GitHub outcome');
    return { [key]: value };
  }

  const get = (path) => call(root + path);
  const post = (path, payload, token) =>
    call(root + path, { method: 'POST', token, payload, status: 201 });

  return {
    async evidence() {
      const [repo, main, original, decisionIssue] = await Promise.all([
        get(''),
        get('/git/ref/heads/main'),
        get(`/issues/comments/${config.approvalComment}`),
        get(`/issues/${config.approvalIssue}`),
      ]);
      return { repo, head: main.object?.sha, original, decisionIssue };
    },
    async targetAllowed(request) {
      if (request.issue) {
        const issue = await get(`/issues/${request.issue}`);
        return (
          issue.number === request.issue &&
          !issue.pull_request &&
          issue.locked === false &&
          issue.state === 'open' &&
          (request.op !== 'issue.update' || issue.user?.id === config.appActorId)
        );
      }
      if (request.op !== 'draft.create') return true;
      // Only three assigned slots exist. Fetch the whole set or deny.
      const pulls = await get('/pulls?state=open&per_page=100');
      if (
        !Array.isArray(pulls) ||
        pulls.length >= 100 ||
        pulls.some((pr) => !number(pr.number) || !number(pr.user?.id) || pr.state !== 'open')
      )
        return false;
      return (
        pulls.filter(
          (pr) =>
            pr.user.id === config.appActorId ||
            !config.unassignedPrs.some(
              ({ number, updatedAt }) => number === pr.number && updatedAt === pr.updated_at,
            ),
        ).length < 3
      );
    },
    async mint(request, stillAllowed) {
      const timeout = new AbortController();
      let jwt;
      try {
        jwt = await Promise.race([
          signAppJwt(),
          delay(10000, undefined, { signal: timeout.signal, ref: false }),
        ]);
      } finally {
        timeout.abort();
      }
      if (
        typeof jwt !== 'string' ||
        !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(jwt)
      ) {
        throw new Error('Invalid signer result');
      }
      const current = await stillAllowed();
      if (!current?.()) return undefined;
      const result = await call(`/app/installations/${config.installationId}/access_tokens`, {
        method: 'POST',
        token: jwt,
        payload: {
          repository_ids: [config.repositoryId],
          permissions: { [permission[request.op]]: 'write' },
        },
        status: 201,
      });
      if (typeof result.token !== 'string' || !/^[A-Za-z0-9_.-]+$/.test(result.token)) {
        throw new Error('Unknown issuance outcome');
      }
      return result.token;
    },
    revoke(token) {
      return call('/installation/token', { method: 'DELETE', token, status: 204 });
    },
    async write(request, token) {
      const { op, issue, branch, title, body, head, files } = request;
      if (op === 'issue.create')
        return id((await post('/issues', { title, body }, token)).number, 'number');
      if (op === 'issue.update') {
        const result = await call(root + `/issues/${issue}`, {
          method: 'PATCH',
          token,
          payload: { title, body },
        });
        return id(result.number, 'number');
      }
      if (op === 'issue.comment')
        return id((await post(`/issues/${issue}/comments`, { body }, token)).id, 'id');
      if (op === 'branch.create') {
        const ref = `refs/heads/${branch}`;
        const result = await post('/git/refs', { ref, sha: config.main }, token);
        if (result.ref !== ref || result.object?.sha !== config.main)
          throw new Error('Unknown ref outcome');
        return { oid: config.main };
      }
      if (op === 'draft.create') {
        const result = await post(
          '/pulls',
          { head: branch, base: 'main', title, body: body + wipNotice, draft: true },
          token,
        );
        if (result.draft !== true) throw new Error('Unknown draft outcome');
        return id(result.number, 'number');
      }
      if (op !== 'branch.commit') throw new Error('Unsupported operation');

      const result = await call('/graphql', {
        method: 'POST',
        token,
        payload: {
          query: commitMutation,
          variables: {
            input: {
              branch: { repositoryNameWithOwner: repository, branchName: branch },
              expectedHeadOid: head,
              message: { headline: title },
              fileChanges: {
                additions: files.filter(({ contents }) => contents !== null),
                deletions: files
                  .filter(({ contents }) => contents === null)
                  .map(({ path }) => ({ path })),
              },
            },
          },
        },
      });
      const commit = result.data?.createCommitOnBranch?.commit?.oid;
      if (result.errors || !oid(commit)) throw new Error('Unknown commit outcome');
      return { oid: commit };
    },
  };
}
