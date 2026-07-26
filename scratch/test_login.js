const https = require('https');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Accept': 'application/json',
      }
    };

    const req = https.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  console.log('--- Step 1: Registering Demo User ---');
  try {
    const reg = await post('https://social-media-nlp.vercel.app/auth/register', {
      username: 'alice@example.com',
      email: 'alice@example.com',
      password: 'password'
    });
    console.log('Register Response Code:', reg.status);
    console.log('Register Response Body:', reg.body);
  } catch (err) {
    console.log('Register Error:', err.message);
  }

  console.log('\n--- Step 2: Logging In Demo User ---');
  try {
    const login = await post('https://social-media-nlp.vercel.app/auth/login', {
      username: 'alice@example.com',
      password: 'password'
    });
    console.log('Login Response Code:', login.status);
    console.log('Login Response Body:', login.body);
  } catch (err) {
    console.log('Login Error:', err.message);
  }
})();
