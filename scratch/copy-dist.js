// Cross-platform copy of FE-Social-Media/dist into repo root for the unified Vercel deploy.
const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', 'FE-Social-Media', 'dist');
const dest = path.resolve(__dirname, '..');

if (!fs.existsSync(src)) {
  console.error('FE dist not found at', src);
  process.exit(1);
}

fs.cpSync(src, dest, { recursive: true, force: true });
console.log('Copied FE dist ->', dest);
