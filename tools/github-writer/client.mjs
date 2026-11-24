import { createConnection } from 'node:net';
import { validResponse } from './policy.mjs';

const [path, ...extra] = process.argv.slice(2);
if (path === '--help' && !extra.length) {
  console.log('Usage: node client.mjs <absolute socket path> < request.json');
} else if (!path?.startsWith('/') || extra.length) {
  console.error('Provide one absolute socket path. See --help.');
  process.exitCode = 1;
} else {
  const socket = createConnection(path);
  const deadline = setTimeout(() => socket.destroy(new Error('Timeout')), 90000);
  socket.on('error', () => {
    console.error('Writer unreachable or outcome unknown. Check GitHub before retrying.');
    process.exitCode = 1;
  });
  socket.on('close', () => clearTimeout(deadline));
  const chunks = [];
  let size = 0;
  socket.on('data', (chunk) => {
    size += chunk.length;
    if (size > 512) socket.destroy(new Error('Oversized response'));
    else chunks.push(chunk);
  });
  socket.on('end', () => {
    try {
      const response = JSON.parse(Buffer.concat(chunks).toString());
      if (!validResponse(response)) throw new Error('Unexpected response');
      console.log(JSON.stringify(response));
      if (!['ok', 'locked'].includes(response.status)) process.exitCode = 1;
    } catch {
      console.error('Writer response unavailable. Check GitHub before retrying.');
      process.exitCode = 1;
    }
  });
  process.stdin.pipe(socket);
}
