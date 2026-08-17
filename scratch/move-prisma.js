// Move prisma client to root node_modules, then remove BE node_modules so the
// Vercel bundle resolves every package from a single root copy.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const beNM = path.join(root, 'BE-Social-Media', 'node_modules');
const srcPrisma = path.join(beNM, '.prisma');
const destPrisma = path.join(root, 'node_modules', '.prisma');

if (fs.existsSync(srcPrisma)) {
  fs.cpSync(srcPrisma, destPrisma, { recursive: true, force: true });
  console.log('Moved .prisma client -> root node_modules');
} else {
  console.log('No BE .prisma found - skipping');
}

fs.rmSync(beNM, { recursive: true, force: true });
console.log('Removed BE-Social-Media/node_modules');
