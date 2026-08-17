// Poll Render candidates until one responds with 200 on /health
const https = require('https');

const hosts = process.argv.slice(2);

function check(host) {
  return new Promise((resolve) => {
    const req = https.get(`https://${host}/health`, { timeout: 15000 }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ host, status: res.statusCode, body: body.slice(0, 120) }));
    });
    req.on('error', () => resolve({ host, error: true }));
    req.on('timeout', () => { req.destroy(); resolve({ host, error: true }); });
  });
}

async function main() {
  for (let i = 0; i < 120; i++) {
    for (const host of hosts) {
      const r = await check(host);
      if (!r.error && r.status === 200) {
        console.log(`FOUND https://${host} -> ${r.body}`);
        process.exit(0);
      }
    }
    if (i % 10 === 0) console.log('still polling...');
    await new Promise((r) => setTimeout(r, 30000));
  }
  console.log('TIMEOUT - none of the Render URLs responded');
  process.exit(1);
}

main();
