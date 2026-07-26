const https = require('https');

function request(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json',
        ...options.headers,
      }
    };

    let payload = null;
    if (data) {
      payload = JSON.stringify(data);
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = https.request(reqOptions, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  console.log('=============== TESTING ALL API ENDPOINTS ===============\n');

  // Step 1: Login
  console.log('1. Testing POST /auth/login...');
  const loginRes = await request('https://social-media-nlp.vercel.app/auth/login', { method: 'POST' }, {
    username: 'alice@example.com',
    password: 'password'
  });
  console.log('   Status:', loginRes.status);
  let token = '';
  try {
    const parsed = JSON.parse(loginRes.body);
    token = parsed.accessToken;
    console.log('   Token acquired:', token ? token.slice(0, 20) + '...' : 'NONE');
  } catch (e) {
    console.log('   Body:', loginRes.body);
  }

  const authHeader = { Authorization: `Bearer ${token}` };

  // Endpoints to test
  const endpoints = [
    { name: 'GET /health', url: 'https://social-media-nlp-be.vercel.app/health', public: true },
    { name: 'GET /auth/profile', url: 'https://social-media-nlp.vercel.app/auth/profile' },
    { name: 'GET /users', url: 'https://social-media-nlp.vercel.app/users' },
    { name: 'GET /users/followers', url: 'https://social-media-nlp.vercel.app/users/followers' },
    { name: 'GET /users/following', url: 'https://social-media-nlp.vercel.app/users/following' },
    { name: 'GET /users/suggestions', url: 'https://social-media-nlp.vercel.app/users/suggestions' },
    { name: 'GET /posts', url: 'https://social-media-nlp.vercel.app/posts' },
    { name: 'GET /comment', url: 'https://social-media-nlp.vercel.app/comment' },
    { name: 'GET /bookmark', url: 'https://social-media-nlp.vercel.app/bookmark' },
    { name: 'GET /groups', url: 'https://social-media-nlp.vercel.app/groups' },
    { name: 'GET /events', url: 'https://social-media-nlp.vercel.app/events' },
    { name: 'GET /notification', url: 'https://social-media-nlp.vercel.app/notification' },
  ];

  console.log('\n2. Testing Protected Endpoints with Bearer Token:');
  for (const ep of endpoints) {
    try {
      const res = await request(ep.url, { headers: ep.public ? {} : authHeader });
      console.log(`   ${ep.name} -> Status: ${res.status}`);
      if (res.status !== 200) {
        console.log(`      Body snippet: ${res.body.slice(0, 150)}`);
      }
    } catch (err) {
      console.log(`   ${ep.name} -> Error: ${err.message}`);
    }
  }

  console.log('\n3. Testing Protected Endpoints WITHOUT Bearer Token (Expect 401 Missing Bearer Token):');
  const unauthTest = await request('https://social-media-nlp.vercel.app/posts', { headers: {} });
  console.log(`   GET /posts (No Token) -> Status: ${unauthTest.status}`);
  console.log(`   Body: ${unauthTest.body}`);

  console.log('\n=========================================================');
})();
