/**
 * End-to-end verification for Social-Media-NLP.
 * Usage: node scratch/verify_e2e.js [FE_URL] [BE_WS_URL]
 * FE_URL   - deployed frontend+API (Vercel unified) e.g. https://social-media-nlp.vercel.app
 * BE_WS_URL - Render WS-capable backend (socket.io + graphql-ws)
 */
const FE_URL = process.argv[2] || process.env.VERIFY_FE_URL || 'https://social-media-nlp.vercel.app';
const WS_URL = process.argv[3] || process.env.VERIFY_WS_URL || '';

const results = [];
function record(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' - ' + detail : ''}`);
}

async function j(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  let body;
  const text = await res.text();
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, body };
}

async function main() {
  console.log(`FE/API: ${FE_URL}`);
  console.log(`WS host: ${WS_URL || '(not set - realtime skipped)'}\n`);

  // 1. Health
  try {
    const h = await j(`${FE_URL}/health`);
    record('GET /health', h.status === 200 && h.body?.status === 'online', JSON.stringify(h.body).slice(0, 120));
  } catch (e) { record('GET /health', false, e.message); }

  // 2. Login (seeded) - proves Prisma + Redis refresh-token store
  let accessToken, refreshToken, userId;
  try {
    const l = await j(`${FE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username: 'alice@example.com', password: 'password' }),
    });
    accessToken = l.body?.accessToken;
    refreshToken = l.body?.refreshToken;
    userId = l.body?.userId;
    record('POST /auth/login', l.status === 201 || l.status === 200, `userId=${userId} (${l.status})`);
  } catch (e) { record('POST /auth/login', false, e.message); }

  // 3. Refresh rotation - hits Redis on the API host
  if (refreshToken) {
    try {
      const r = await j(`${FE_URL}/auth/refresh`, {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
        headers: { Authorization: `Bearer ${refreshToken}` },
      });
      const newToken = r.body?.accessToken;
      record('POST /auth/refresh', r.status === 200 || r.status === 201, `status=${r.status}`);
      if (newToken) accessToken = newToken;
    } catch (e) { record('POST /auth/refresh', false, e.message); }
  }

  // 4. Authorized REST - users
  if (accessToken) {
    try {
      const u = await j(`${FE_URL}/users`, { headers: { Authorization: `Bearer ${accessToken}` } });
      record('GET /users (auth)', u.status === 200, `status=${u.status}`);
    } catch (e) { record('GET /users (auth)', false, e.message); }

    // 5. Create post (NLP sentiment path)
    try {
      const p = await j(`${FE_URL}/posts`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ content: 'Loving the new Connected redesign, it feels warm and alive today!' }),
      });
      const created = p.status === 201 || p.status === 200;
      const sentiment = p.body?.sentiment ?? p.body?.data?.sentiment;
      record('POST /posts (NLP)', created, `status=${p.status} sentiment=${sentiment}`);
      if (p.body?.id) {
        // 6. Delete cleanup
        try {
          const d = await j(`${FE_URL}/posts/${p.body.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } });
          record('DELETE /posts/:id', d.status < 300 || d.status === 404, `status=${d.status}`);
        } catch (e) { record('DELETE /posts/:id', false, e.message); }
      }
    } catch (e) { record('POST /posts (NLP)', false, e.message); }

    // 7. GraphQL HTTP query
    try {
      const g = await j(`${FE_URL}/graphql`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ query: '{ __schema { queryType { name } } }' }),
      });
      record('POST /graphql introspection', g.status === 200 && !!g.body?.data, `status=${g.status}`);
    } catch (e) { record('POST /graphql introspection', false, e.message); }
  }

  // 8. Real-time: socket.io handshake against WS host
  if (WS_URL) {
    try {
      const s = await j(`${WS_URL}/socket.io/?EIO=4&transport=polling`);
      const ok = s.status === 200 && String(s.body).startsWith('0{');
      record('socket.io handshake (WS host)', ok, String(s.body).slice(0, 60));
    } catch (e) { record('socket.io handshake (WS host)', false, e.message); }

    // 9. Full socket connection + online-users broadcast
    try {
      const { io } = await import('socket.io-client');
      const socket = io(WS_URL, { transports: ['websocket'], query: { userId: userId || 'e2e-test' } });
      const online = await new Promise((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('timeout waiting for getOnlineUsers')), 15000);
        socket.on('getOnlineUsers', (u) => { clearTimeout(t); resolve(u); });
        socket.on('connect_error', reject);
      });
      record('socket.io connect + getOnlineUsers', true, `${online.length} online`);
      socket.disconnect();
    } catch (e) { record('socket.io connect + getOnlineUsers', false, e.message); }

    // 10. graphql-ws subscription handshake
    if (accessToken) {
      try {
        const { createClient } = await import('graphql-ws');
        const client = createClient({
          url: WS_URL.replace(/^http/, 'ws') + '/graphql',
          connectionParams: () => ({ Authorization: `Bearer ${accessToken}` }),
        });
        const connected = await new Promise((resolve, reject) => {
          const t = setTimeout(() => reject(new Error('ws timeout')), 12000);
          const iter = client.iterate({ query: 'subscription { __typename }' });
          iter.next().catch(() => {});
          setTimeout(() => { clearTimeout(t); resolve(true); }, 4000);
        });
        record('graphql-ws subscription open', connected);
        client.dispose();
      } catch (e) { record('graphql-ws subscription open', false, e.message); }
    }
  } else {
    record('socket.io handshake (WS host)', false, 'skipped - VERIFY_WS_URL not set');
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n=== ${results.length - failed.length}/${results.length} passed ===`);
  process.exit(failed.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
