import assert from 'node:assert/strict';
import { closeSync, mkdtempSync, openSync, rmSync, writeFileSync } from 'node:fs';
import { createConnection } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { controller } from './controller.mjs';
import { github } from './github.mjs';
import { repository, sha256, validResponse } from './policy.mjs';
import { aclAllowsTrust, diskState } from './server.mjs';

const time = Date.parse('2030-02-10T00:00:00Z');
const head = 'b'.repeat(40);
const request = {
  op: 'branch.commit',
  branch: 'ap-01/example',
  head,
  title: 'Change example',
  files: [{ path: 'src/file.ts', contents: 'YQ==' }],
};

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), 'writer-test-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const state = diskState(directory);
  const config = {
    main: 'a'.repeat(40),
    repositoryId: 100,
    ownerId: 200,
    appActorId: 201,
    approvalIssue: 300,
    approvalComment: 400,
    installationId: 500,
    unassignedPrs: [],
    approvalUpdatedAt: '2030-02-09T00:00:00Z',
    approvalIssueUpdatedAt: '2030-02-09T00:00:00Z',
    approvalIssueDigest: sha256('Synthetic owner conditions'),
  };
  const grant = {
    version: 1,
    decision: 'activate',
    repository,
    policyHead: config.main,
    start: '2030-02-10T01:00:00+01:00',
    review: '2030-02-11T01:00:00+01:00',
    expires: '2030-02-12T00:00:00Z',
    scope: [{ op: 'branch.commit', branch: request.branch, paths: ['src/file.ts'] }],
  };
  const original = {
    id: config.approvalComment,
    user: { id: config.ownerId, type: 'User' },
    updated_at: config.approvalUpdatedAt,
    performed_via_github_app: null,
    issue_url: `https://api.github.com/repos/${repository}/issues/${config.approvalIssue}`,
  };
  function pin() {
    original.body = JSON.stringify(grant);
    config.approvalDigest = sha256(original.body);
  }
  pin();
  const evidence = {
    original,
    decisionIssue: {
      number: config.approvalIssue,
      state: 'open',
      user: { id: config.ownerId, type: 'User' },
      performed_via_github_app: null,
      updated_at: config.approvalIssueUpdatedAt,
      body: 'Synthetic owner conditions',
    },
    repo: { id: config.repositoryId, full_name: repository, default_branch: 'main' },
    head: config.main,
  };
  const live = new Set();
  const calls = [];
  const remote = {
    evidence: async () => evidence,
    targetAllowed: async () => true,
    async mint(_request, check) {
      const current = await check();
      if (!current?.()) return undefined;
      calls.push('mint');
      live.add('synthetic');
      return 'synthetic';
    },
    async write(_request, token) {
      assert.ok(live.has(token));
      calls.push('write');
      return { oid: head };
    },
    async revoke(token) {
      assert.ok(live.delete(token));
      calls.push('revoke');
    },
  };
  return {
    directory,
    config,
    evidence,
    grant,
    pin,
    original,
    calls,
    state,
    live,
    remote,
    make: () => controller(config, remote, state, () => time, true),
  };
}

test('valid owner approval creates a commit and revokes its credential before responding', async (t) => {
  const f = fixture(t);
  assert.deepEqual(await f.make().submit(request), { status: 'ok', result: { oid: head } });
  assert.deepEqual(f.calls, ['mint', 'write', 'revoke']);
  assert.equal(f.state.pending(), false);
  assert.equal(f.live.size, 0);
});

test('accepts no ACL or the standard macOS deny-delete entry only', () => {
  assert.equal(aclAllowsTrust('entry\n'), true);
  assert.equal(aclAllowsTrust('entry\n 0: group:everyone deny delete\n'), true);
  assert.equal(aclAllowsTrust('entry\n 0: group:everyone allow read\n'), false);
});

const denials = [
  [
    'changed owner issue body',
    (f) => {
      f.evidence.decisionIssue.body += '\n';
    },
  ],
  [
    'changed owner issue revision',
    (f) => {
      f.evidence.decisionIssue.updated_at = '2030-02-10T00:00:00Z';
    },
  ],
  [
    'different owner issue author',
    (f) => {
      f.evidence.decisionIssue.user.id++;
    },
  ],
  [
    'different actor',
    (f) => {
      f.original.user.id = 999;
    },
  ],
  [
    'app-mediated comment',
    (f) => {
      f.original.performed_via_github_app = {};
    },
  ],
  [
    'edited approval',
    (f) => {
      f.original.updated_at = '2030-02-10T00:00:00Z';
    },
  ],
  [
    'modified body',
    (f) => {
      f.original.body += '\n';
    },
  ],
  [
    'different issue',
    (f) => {
      f.original.issue_url += '0';
    },
  ],
  [
    'different repository ID',
    (f) => {
      f.evidence.repo.id++;
    },
  ],
  [
    'new main',
    (f) => {
      f.evidence.head = head;
    },
  ],
  [
    'closed approval issue',
    (f) => {
      f.evidence.decisionIssue.state = 'closed';
    },
  ],
  [
    'revoked decision',
    (f) => {
      f.grant.decision = 'revoke';
      f.pin();
    },
  ],
  [
    'not started',
    (f) => {
      f.grant.start = '2030-02-10T01:00:01+01:00';
      f.pin();
    },
  ],
  [
    'review due',
    (f) => {
      f.grant.review = '2030-02-10T00:00:00Z';
      f.pin();
    },
  ],
  [
    'expired',
    (f) => {
      f.grant.review = f.grant.expires = '2030-02-10T00:00:00Z';
      f.pin();
    },
  ],
  [
    'missing timezone',
    (f) => {
      f.grant.start = '2030-02-09T01:00:00';
      f.pin();
    },
  ],
  [
    'nonexistent date',
    (f) => {
      f.grant.start = '2029-02-30T01:00:00Z';
      f.pin();
    },
  ],
  [
    'outside path scope',
    (f) => {
      f.grant.scope[0].paths = ['src/another.ts'];
      f.pin();
    },
  ],
  [
    'outside branch scope',
    (f) => {
      f.grant.scope[0].branch = 'ap-01/another';
      f.pin();
    },
  ],
  [
    'missing evidence',
    (f) => {
      f.evidence.original = undefined;
    },
  ],
];
for (const [name, modify] of denials) {
  test(`denies ${name} before issuance`, async (t) => {
    const f = fixture(t);
    modify(f);
    assert.equal((await f.make().submit(request)).status, 'denied');
    assert.deepEqual(f.calls, []);
  });
}

test('denies direct main, tags, merge, proxy, force and protected paths', async (t) => {
  const f = fixture(t);
  for (const input of [
    { ...request, branch: 'main' },
    { ...request, branch: 'refs/tags/v1' },
    { ...request, force: true },
    { op: 'merge' },
    { op: 'proxy', url: '/installation/token' },
    { op: 'stop' },
    { op: 'credentials' },
    { ...request, branch: 'ap-01/../main' },
    ...['.github/workflows/test.yml', '.Git/config', '../key', 'src\\file'].map((path) => ({
      ...request,
      files: [{ path, contents: 'YQ==' }],
    })),
  ]) {
    assert.equal((await f.make().submit(input)).status, 'denied');
  }
  assert.deepEqual(f.calls, []);
});

test('GitHub outage denies issuance and a proof revoked after mint prevents mutation', async (t) => {
  const f = fixture(t);
  const evidence = f.remote.evidence;
  f.remote.evidence = async () => {
    throw new Error('offline');
  };
  assert.equal((await f.make().submit(request)).status, 'unavailable');
  assert.deepEqual(f.calls, []);
  f.remote.evidence = async () => {
    if (f.live.size) f.evidence.decisionIssue.state = 'closed';
    return evidence();
  };
  assert.equal((await f.make().submit(request)).status, 'denied');
  assert.deepEqual(f.calls, ['mint', 'revoke']);
});

test('local stop during issuance drains the mint, revokes the token and persists the stop', async (t) => {
  const f = fixture(t);
  const reached = Promise.withResolvers();
  const resume = Promise.withResolvers();
  const mint = f.remote.mint;
  f.remote.mint = async (...args) => {
    const token = await mint(...args);
    reached.resolve();
    await resume.promise;
    return token;
  };
  const service = f.make();
  const running = service.submit(request);
  await reached.promise;
  assert.equal((await service.submit(request)).status, 'busy');
  const stopped = service.stop();
  resume.resolve();
  assert.equal((await running).status, 'denied');
  assert.equal((await stopped).status, 'locked');
  assert.deepEqual(f.calls, ['mint', 'revoke']);
  assert.equal((await f.make().submit(request)).status, 'denied');
});

test('stopping an in-flight mutation immediately invalidates the previously issued credential', async (t) => {
  const f = fixture(t);
  const reached = Promise.withResolvers();
  const resume = Promise.withResolvers();
  const write = f.remote.write;
  f.remote.write = async (...args) => {
    reached.resolve();
    await resume.promise;
    return write(...args);
  };
  const service = f.make();
  const running = service.submit(request);
  await reached.promise;
  const stopped = service.stop();
  assert.equal(f.live.has('synthetic'), false);
  resume.resolve();
  assert.equal((await running).status, 'unconfirmed');
  assert.equal((await stopped).status, 'unconfirmed');
  assert.equal(f.state.pending(), true);
  assert.equal((await f.make().submit(request)).status, 'denied');
});

test('failed revocation and ambiguous mint keep restart locked', async (t) => {
  const f = fixture(t);
  const revoke = f.remote.revoke;
  f.remote.revoke = async () => {
    throw new Error('offline');
  };
  const service = f.make();
  assert.equal((await service.submit(request)).status, 'unconfirmed');
  assert.equal(f.state.pending(), true);
  assert.equal((await service.stop()).status, 'unconfirmed');
  assert.equal(f.live.size, 1);
  f.remote.revoke = revoke;
  assert.equal((await service.stop()).status, 'unconfirmed');
  assert.equal(f.live.size, 0);
  assert.equal((await f.make().submit(request)).status, 'denied');

  const unknown = fixture(t);
  unknown.remote.mint = async (_request, check) => {
    assert.ok(await check());
    throw new Error('token response lost');
  };
  assert.equal((await unknown.make().submit(request)).status, 'unconfirmed');
  assert.equal(unknown.state.pending(), true);
  assert.equal((await unknown.make().submit(request)).status, 'denied');
});

test('fixed transport uses narrowly scoped credentials and an atomic branch-head comparison', async (t) => {
  const f = fixture(t);
  const calls = [];
  const remote = github(
    f.config,
    async () => 'synthetic.app.jwt',
    async (url, options) => {
      calls.push({ url, ...options });
      if (options.method === 'DELETE') return new Response(null, { status: 204 });
      if (url.endsWith('/graphql'))
        return Response.json({ data: { createCommitOnBranch: { commit: { oid: head } } } });
      return Response.json({ token: 'synthetic.token' }, { status: 201 });
    },
  );
  assert.equal(await remote.mint(request, async () => undefined), undefined);
  assert.equal(calls.length, 0);
  const token = await remote.mint(request, async () => () => true);
  assert.deepEqual(JSON.parse(calls[0].body), {
    repository_ids: [100],
    permissions: { contents: 'write' },
  });
  assert.deepEqual(await remote.write(request, token), { oid: head });
  const sent = JSON.parse(calls[1].body);
  assert.equal(calls[1].url, 'https://api.github.com/graphql');
  assert.equal(sent.variables.input.expectedHeadOid, head);
  assert.deepEqual(sent.variables.input.branch, {
    repositoryNameWithOwner: repository,
    branchName: request.branch,
  });
  await remote.revoke(token);
  assert.equal(calls[2].url, 'https://api.github.com/installation/token');
  assert.ok(calls.every((call) => call.redirect === 'error'));
});

test('draft WIP counts app and unknown PRs and excludes only owner-reviewed external PRs', async (t) => {
  const { config } = fixture(t);
  const updatedAt = '2030-02-09T00:00:00Z';
  config.unassignedPrs = [1, 2].map((number) => ({ number, updatedAt }));
  const pulls = [1, 2, 3, 4].map((number) => ({
    number,
    state: 'open',
    updated_at: updatedAt,
    user: { id: number === 1 ? config.appActorId : 999 },
  }));
  const remote = github(config, undefined, async () => Response.json(pulls));
  const draft = { op: 'draft.create', branch: request.branch, title: 'Draft', body: '' };
  assert.equal(await remote.targetAllowed(draft), false);
  pulls.pop();
  assert.equal(await remote.targetAllowed(draft), true);
  pulls[1].updated_at = '2030-02-10T00:00:00Z';
  assert.equal(await remote.targetAllowed(draft), false);
});

test('reserves an authorized issue payload once, even across restart', async (t) => {
  const f = fixture(t);
  const issue = { op: 'issue.create', title: 'Synthetic issue', body: 'Synthetic scope' };
  f.grant.scope = [{ op: issue.op, digest: sha256(JSON.stringify([issue.title, issue.body])) }];
  f.pin();
  assert.equal((await f.make().submit({ ...issue, body: 'Other scope' })).status, 'denied');
  assert.equal((await f.make().submit(issue)).status, 'ok');
  assert.equal((await f.make().submit(issue)).status, 'duplicate');
  assert.deepEqual(f.calls, ['mint', 'write', 'revoke']);
});

test('draft, issue and branch mutations use only their fixed payloads', async (t) => {
  const { config } = fixture(t);
  const calls = [];
  const remote = github(config, undefined, async (url, options) => {
    calls.push([url, options.method, JSON.parse(options.body)]);
    if (url.endsWith('/git/refs')) {
      return Response.json(
        { ref: 'refs/heads/ap-01/example', object: { sha: config.main } },
        { status: 201 },
      );
    }
    if (options.method === 'PATCH') return Response.json({ number: 11 });
    return Response.json({ number: 11, id: 99, draft: true }, { status: 201 });
  });
  const branch = request.branch;
  const title = 'Synthetic';
  const body = 'Synthetic';
  for (const input of [
    { op: 'branch.create', branch },
    { op: 'draft.create', branch, title, body },
    { op: 'issue.create', title, body },
    { op: 'issue.update', issue: 11, title, body },
    { op: 'issue.comment', issue: 11, body },
  ])
    await remote.write(input, 'synthetic');
  const root = `https://api.github.com/repos/${repository}`;
  assert.deepEqual(calls, [
    [root + '/git/refs', 'POST', { ref: 'refs/heads/ap-01/example', sha: config.main }],
    [
      root + '/pulls',
      'POST',
      {
        head: branch,
        base: 'main',
        title,
        body: body + '\n\nWIP-Zuordnung: von Codex über den GitHub-Schreibdienst erstellt.',
        draft: true,
      },
    ],
    [root + '/issues', 'POST', { title, body }],
    [root + '/issues/11', 'PATCH', { title, body }],
    [root + '/issues/11/comments', 'POST', { body }],
  ]);
});

test('refuses issue updates on owner issues and issue comments on PRs', async (t) => {
  const { config } = fixture(t);
  const issue = { number: 11, state: 'open', locked: false, user: { id: config.ownerId } };
  const remote = github(config, undefined, async () => Response.json(issue));
  assert.equal(await remote.targetAllowed({ op: 'issue.update', issue: 11 }), false);
  assert.equal(await remote.targetAllowed({ op: 'issue.comment', issue: 11 }), true);
  issue.pull_request = {};
  assert.equal(await remote.targetAllowed({ op: 'issue.comment', issue: 11 }), false);
});

const isolation = process.env.SOSEMABA_WRITER_TST_ISOLATION;
test(
  'separate Codex account cannot open synthetic owner files or control socket',
  { skip: !isolation, timeout: 5000 },
  async () => {
    const fixture = JSON.parse(isolation);
    assert.equal(process.getuid(), fixture.codexUid);
    assert.notEqual(fixture.codexUid, fixture.ownerUid);
    assert.ok(fixture.files.length >= 5);
    for (const path of fixture.files) {
      assert.throws(() => closeSync(openSync(path, 'r')), { code: 'EACCES' });
    }
    function send(path, op) {
      return new Promise((resolve, reject) => {
        const socket = createConnection(path, () => socket.end(JSON.stringify({ op })));
        const chunks = [];
        socket.on('data', (chunk) => chunks.push(chunk));
        socket.on('error', reject);
        socket.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString())));
      });
    }
    await assert.rejects(send(fixture.ownerSocket, 'stop'), { code: 'EACCES' });
    for (const op of ['stop', 'credentials', 'sign', 'proxy']) {
      assert.deepEqual(await send(fixture.writeSocket, op), { status: 'denied' });
    }
  },
);

test('owner stop before issuance dispatch prevents mint and clears the intent', async (t) => {
  const f = fixture(t);
  const atDispatch = Promise.withResolvers();
  const resume = Promise.withResolvers();
  f.remote.mint = async (_request, check) => {
    const current = await check();
    atDispatch.resolve();
    await resume.promise;
    if (!current?.()) return undefined;
    assert.fail('mint dispatched after stop');
  };
  const service = f.make();
  const running = service.submit(request);
  await atDispatch.promise;
  const stopped = service.stop();
  resume.resolve();
  assert.equal((await running).status, 'denied');
  assert.equal((await stopped).status, 'locked');
  assert.equal(f.state.pending(), false);
});

test('expiry during local receipt preparation prevents mutation', async (t) => {
  const f = fixture(t);
  let currentTime = time;
  const issue = { op: 'issue.create', title: 'Synthetic issue', body: 'Synthetic scope' };
  f.grant.scope = [{ op: issue.op, digest: sha256(JSON.stringify([issue.title, issue.body])) }];
  f.pin();
  const reserve = f.state.reserve;
  f.state.reserve = (key) => {
    reserve(key);
    currentTime = Date.parse(f.grant.review);
  };
  const service = controller(f.config, f.remote, f.state, () => currentTime, true);
  assert.equal((await service.submit(issue)).status, 'denied');
  assert.deepEqual(f.calls, ['mint', 'revoke']);
  currentTime = time;
  f.state.reserve = reserve;
  assert.equal((await service.submit(issue)).status, 'ok');
});

test('activation marker is single-use, bound to the configuration and subordinate to the lock', async (t) => {
  const f = fixture(t);
  const marker = join(f.directory, 'armed');
  const digest = sha256('synthetic configuration');
  const mark = (value) => writeFileSync(marker, value, { mode: 0o600, flag: 'wx' });
  const start = () =>
    controller(f.config, f.remote, f.state, () => time, f.state.consumeArm(digest));
  assert.equal((await start().submit(request)).status, 'denied');
  mark(sha256('different configuration'));
  assert.equal((await start().submit(request)).status, 'denied');
  mark(digest);
  assert.equal((await start().submit(request)).status, 'ok');
  assert.equal((await start().submit(request)).status, 'denied');
  f.state.lock();
  mark(digest);
  assert.equal((await start().submit(request)).status, 'denied');
  assert.equal(f.state.consumeArm(digest), false);
});

test('client accepts only bounded identifiers and known statuses without extra fields', () => {
  assert.equal(validResponse({ status: 'locked' }), true);
  assert.equal(validResponse({ status: 'ok', result: { oid: head } }), true);
  assert.equal(validResponse({ status: 'denied', extra: 'synthetic' }), false);
  assert.equal(validResponse({ status: 'ok', result: { oid: 'synthetic' } }), false);
  assert.equal(validResponse({ status: 'ok', result: { id: 1, extra: 'synthetic' } }), false);
});
