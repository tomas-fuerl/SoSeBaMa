import { authorized, sha256, validRequest } from './policy.mjs';

export function controller(config, remote, state, now = Date.now, armed = false) {
  let active;
  let token;
  let revocation;
  let locked = !armed || state.blocked();

  async function check(request) {
    if (locked || !(await remote.targetAllowed(request))) return undefined;
    const evidence = await remote.evidence();
    const current = () => !locked && authorized(evidence, config, request, now());
    return current() ? current : undefined;
  }

  function revoke() {
    if (token && !revocation) revocation = remote.revoke(token);
    return revocation;
  }

  async function run(request) {
    let intent = false;
    let settled = true;
    const deduplicationKey = ['issue.create', 'issue.comment'].includes(request.op)
      ? sha256(JSON.stringify([request.op, request.issue, request.title, request.body]))
      : undefined;

    async function execute() {
      if (!(await check(request))) return { status: 'denied' };
      if (deduplicationKey && state.seen(deduplicationKey)) return { status: 'duplicate' };
      token = await remote.mint(request, async () => {
        const current = await check(request);
        if (!current?.()) return undefined;
        intent = true;
        settled = false;
        state.begin();
        return current;
      });
      if (token === undefined) {
        // The transport did not dispatch issuance.
        settled = true;
        return { status: 'denied' };
      }
      if (!intent || !token) throw new Error('Unknown issuance outcome');
      settled = true;
      const current = await check(request);
      if (!current?.()) return { status: 'denied' };
      if (deduplicationKey) state.reserve(deduplicationKey);
      if (!current()) {
        if (deduplicationKey) state.release(deduplicationKey);
        return { status: 'denied' };
      }
      settled = false;
      const result = await remote.write(request, token);
      settled = true;
      return { status: 'ok', result };
    }

    let outcome;
    try {
      outcome = await execute();
    } catch {
      outcome = { status: 'unavailable' };
    }

    try {
      await revoke();
      token = undefined;
      if (intent && settled) state.finish();
      if (!settled) locked = true;
    } catch {
      // Retain an unreclaimed token for an explicit owner retry.
      locked = true;
    } finally {
      revocation = undefined;
    }
    return locked && (!settled || token || state.pending()) ? { status: 'unconfirmed' } : outcome;
  }

  return {
    async submit(request) {
      if (locked) return { status: 'denied' };
      if (active) return { status: 'busy' };
      if (!validRequest(request)) return { status: 'denied' };
      active = run(request);
      try {
        const outcome = await active;
        return locked && outcome.status === 'ok' ? { ...outcome, status: 'stopped' } : outcome;
      } catch {
        return { status: locked ? 'unconfirmed' : 'unavailable' };
      } finally {
        active = undefined;
      }
    },
    async stop() {
      locked = true;
      try {
        state.lock();
      } catch {
        await Promise.allSettled([revoke(), active]);
        return { status: 'unconfirmed' };
      }
      // Start revocation immediately, even while GitHub is processing a mutation.
      const job = active;
      const revoking = revoke();
      await Promise.allSettled([revoking, job]);
      if (!job && revoking) {
        token = await revoking.then(
          () => undefined,
          () => token,
        );
        if (revocation === revoking) revocation = undefined;
      }
      return { status: state.pending() ? 'unconfirmed' : 'locked' };
    },
  };
}
