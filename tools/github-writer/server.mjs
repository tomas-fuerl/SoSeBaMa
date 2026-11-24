import { execFileSync } from 'node:child_process';
import {
  constants,
  chmodSync,
  closeSync,
  fsyncSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
  unlinkSync,
} from 'node:fs';
import { createServer } from 'node:net';
import { dirname, isAbsolute, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const uid = process.getuid();
const maxBytes = 1024 * 1024;

export function aclAllowsTrust(output) {
  const [, ...entries] = output.trimEnd().split('\n');
  return entries.every((entry) => /^ +\d+: group:everyone deny delete$/.test(entry));
}

function checkAcl(path) {
  const output = execFileSync('/bin/ls', ['-lde', path], {
    encoding: 'utf8',
    env: { LC_ALL: 'C' },
    timeout: 2000,
    stdio: ['ignore', 'pipe', 'ignore'],
  });
  if (!aclAllowsTrust(output)) throw new Error('Unexpected extended ACL');
}

function trusted(path, directory, mode) {
  if (
    !isAbsolute(path) ||
    [...path].some(
      (character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
    ) ||
    realpathSync(path) !== path
  )
    throw new Error('Use a canonical absolute path');
  for (let parent = dirname(path); ; parent = dirname(parent)) {
    const item = lstatSync(parent);
    if (!item.isDirectory() || ![0, uid].includes(item.uid) || item.mode & 0o022) {
      throw new Error('Untrusted path ancestor');
    }
    checkAcl(parent);
    if (parent === '/') break;
  }
  const item = lstatSync(path);
  if (
    item.uid !== uid ||
    (item.mode & 0o777) !== mode ||
    !(directory ? item.isDirectory() : item.isFile() && item.nlink === 1)
  ) {
    throw new Error('Unexpected ownership, permissions or file type');
  }
  checkAcl(path);
  return path;
}

export function diskState(directory) {
  const arm = join(directory, 'armed');
  const lock = join(directory, 'locked');
  const intent = join(directory, 'pending');
  function exists(path) {
    try {
      lstatSync(path);
      return true;
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      return false;
    }
  }
  function sync(path, flags) {
    const descriptor = openSync(path, flags, 0o600);
    try {
      fsyncSync(descriptor);
    } finally {
      closeSync(descriptor);
    }
  }
  function create(path) {
    sync(path, constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY);
    sync(directory, constants.O_RDONLY);
  }
  return {
    blocked: () => exists(lock) || exists(intent),
    consumeArm(digest) {
      if (!exists(arm)) return false;
      const marker = lstatSync(arm);
      if (
        !marker.isFile() ||
        marker.uid !== uid ||
        marker.nlink !== 1 ||
        (marker.mode & 0o777) !== 0o600
      ) {
        throw new Error('Invalid local activation marker');
      }
      const matches = readFileSync(arm, 'utf8').trim() === digest;
      unlinkSync(arm);
      sync(directory, constants.O_RDONLY);
      return matches && !exists(lock) && !exists(intent);
    },
    pending: () => exists(intent),
    seen: (key) => exists(join(directory, `request-${key}`)),
    reserve: (key) => create(join(directory, `request-${key}`)),
    release(key) {
      unlinkSync(join(directory, `request-${key}`));
      sync(directory, constants.O_RDONLY);
    },
    begin: () => create(intent),
    finish() {
      unlinkSync(intent);
      sync(directory, constants.O_RDONLY);
    },
    lock() {
      if (!exists(lock)) create(lock);
      else sync(directory, constants.O_RDONLY);
    },
  };
}

function listen(path, handler, limit) {
  const server = createServer({ allowHalfOpen: true }, (socket) => {
    let size = 0;
    const chunks = [];
    const deadline = setTimeout(() => socket.destroy(), 5000);
    socket.on('error', () => socket.destroy());
    socket.on('close', () => clearTimeout(deadline));
    socket.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) socket.destroy();
      else chunks.push(chunk);
    });
    socket.on('end', async () => {
      clearTimeout(deadline);
      let result = { status: 'denied' };
      try {
        const raw = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
        result = await handler(JSON.parse(raw));
      } catch {
        // Request bodies, GitHub errors and signer output stay out of logs.
      }
      socket.end(JSON.stringify(result) + '\n');
    });
  });
  server.maxConnections = 8;
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen({ path, backlog: 8 }, () => resolve(server));
  });
}

async function main() {
  const [configPath, ...extra] = process.argv.slice(2);
  if (configPath === '--help' && !extra.length) {
    console.log('Usage: node server.mjs <absolute owner-only configuration.json>');
    return;
  }
  if (
    !configPath ||
    extra.length ||
    uid === 0 ||
    process.platform !== 'darwin' ||
    process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0'
  ) {
    throw new Error('Invalid startup environment');
  }
  for (const module of ['server', 'controller', 'github', 'policy']) {
    trusted(fileURLToPath(new URL(`./${module}.mjs`, import.meta.url)), false, 0o600);
  }
  const [{ controller }, { github }, { exact, number, oid, sha256, validRequest }] =
    await Promise.all([import('./controller.mjs'), import('./github.mjs'), import('./policy.mjs')]);
  const configBytes = readFileSync(trusted(configPath, false, 0o600));
  const config = JSON.parse(configBytes.toString('utf8'));
  const timestamp = (value) =>
    typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(value);
  const ids = [
    'repositoryId',
    'ownerId',
    'approvalIssue',
    'approvalComment',
    'installationId',
    'appActorId',
  ];
  const paths = ['stateDir', 'clientDir', 'signerModule'];
  if (
    !exact(config, [
      ...ids,
      ...paths,
      'main',
      'approvalDigest',
      'approvalUpdatedAt',
      'approvalIssueDigest',
      'approvalIssueUpdatedAt',
      'unassignedPrs',
    ]) ||
    !ids.every((key) => number(config[key])) ||
    config.ownerId === config.appActorId ||
    !oid(config.main) ||
    ![config.approvalDigest, config.approvalIssueDigest].every(
      (digest) => typeof digest === 'string' && /^[a-f0-9]{64}$/.test(digest),
    ) ||
    ![config.approvalUpdatedAt, config.approvalIssueUpdatedAt].every(timestamp) ||
    !Array.isArray(config.unassignedPrs) ||
    !config.unassignedPrs.every(
      (item) =>
        exact(item, ['number', 'updatedAt']) && number(item.number) && timestamp(item.updatedAt),
    )
  ) {
    throw new Error('Invalid owner configuration');
  }
  for (const key of paths) if (typeof config[key] !== 'string') throw new Error('Invalid path');
  trusted(config.stateDir, true, 0o700);
  trusted(config.clientDir, true, 0o710);
  trusted(config.signerModule, false, 0o600);
  if (lstatSync(config.clientDir).gid !== process.getegid())
    throw new Error('Unexpected client group');

  // Unix socket creation uses the process group. Start with no group access.
  process.umask(0o077);
  const state = diskState(config.stateDir);
  async function signAppJwt() {
    const { signAppJwt: sign } = await import(pathToFileURL(config.signerModule).href);
    if (typeof sign !== 'function') throw new Error('Missing broker signer');
    return sign();
  }
  let service;
  function audit(op, result) {
    console.info(JSON.stringify({ at: new Date().toISOString(), op, status: result.status }));
    return result;
  }
  const owner = await listen(
    join(config.stateDir, 'owner.sock'),
    async (req) =>
      service && exact(req, ['op']) && req.op === 'stop'
        ? audit('stop', await service.stop())
        : { status: 'denied' },
    128,
  );
  try {
    const armed = state.consumeArm(sha256(configBytes));
    service = controller(config, github(config, signAppJwt), state, Date.now, armed);
    const path = join(config.clientDir, 'write.sock');
    const client = await listen(
      path,
      async (req) =>
        validRequest(req) ? audit(req.op, await service.submit(req)) : { status: 'denied' },
      maxBytes,
    );
    try {
      chmodSync(path, 0o660);
    } catch (error) {
      client.close();
      throw error;
    }
  } catch (error) {
    owner.close();
    throw error;
  }
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch(() => {
    console.error(
      'Writer startup rejected. Check owner configuration, paths, permissions and socket state.',
    );
    process.exitCode = 1;
  });
}
