/* Headless UI verification for https://social-media-nlp.vercel.app
 * Personas: bob (USER) for feed flows, alice (ADMIN) for dashboard.
 */
import { chromium } from 'playwright';

const BASE = process.env.VERIFY_FE_URL || 'https://social-media-nlp.vercel.app';
const results = [];
const record = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' - ' + detail : ''}`);
};

const browser = await chromium.launch({ headless: true, args: ['--disable-dev-shm-usage'] });

async function newPage() {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  p.on('pageerror', (e) => console.log('page error:', String(e).slice(0, 100)));
  return { ctx, p };
}

async function login(p, username) {
  await p.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForSelector('input#username', { timeout: 30000 });
  await p.fill('input#username', username);
  await p.fill('input#password', 'password');
  await Promise.all([
    p.waitForURL((u) => !u.toString().includes('/login'), { timeout: 30000 }),
    p.getByRole('button', { name: /login/i }).first().click(),
  ]);
  return p.url();
}

// ---------- USER persona: bob ----------
{
  const { ctx, p } = await newPage();
  const failedCalls = [];
  p.on('response', (r) => {
    if (r.status() >= 400 && /\.(js|css)$/.test(r.url()) === false && !r.url().includes('/assets/')) {
      failedCalls.push(`${r.status()} ${r.url().replace(BASE, '').slice(0, 80)}`);
    }
  });

  try {
    const url = await login(p, 'bob@example.com');
    record('bob login reaches user home', url.includes('social-media-nlp.vercel.app') && !url.includes('/dashboard'), url);
  } catch (e) {
    record('bob login reaches user home', false, e.message.slice(0, 100));
  }

  try {
    await p.waitForTimeout(3000);
    const bodyText = await p.textContent('body');
    record('home feed renders', (bodyText || '').length > 300, `len=${(bodyText || '').length}`);
    const sents = await p.locator('.sentiment-good, .sentiment-moderate, .sentiment-bad').count();
    record('sentiment indicators visible', sents > 0, `count=${sents}`);
  } catch (e) {
    record('home feed renders', false, e.message.slice(0, 80));
  }

  try {
    const composer = p.locator('textarea').first();
    await composer.waitFor({ timeout: 15000 });
    await composer.fill('Feeling wonderful about the new redesign, love the warm colors today!');
    const postBtn = p.getByRole('button', { name: /post/i }).first();
    await postBtn.click();
    await p.waitForTimeout(4000);
    const body = await p.textContent('body');
    const landed = (body || '').includes('Feeling wonderful');
    record('create post via UI', landed, landed ? 'post visible in feed' : 'post text not found after submit');
  } catch (e) {
    record('create post via UI', false, e.message.slice(0, 120));
  }

  record('no failed api calls (user)', failedCalls.length === 0, [...new Set(failedCalls)].slice(0, 5).join(' | '));

  // profile page
  try {
    await p.goto(`${BASE}/profile`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await p.waitForTimeout(2000);
    const txt = await p.textContent('body');
    record('profile page renders', (txt || '').toLowerCase().includes('bio') || (txt || '').length > 200, `len=${(txt || '').length}`);
  } catch (e) {
    record('profile page renders', false, e.message.slice(0, 80));
  }

  // groups + events pages
  for (const route of ['/groups', '/events']) {
    try {
      await p.goto(`${BASE}${route}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await p.waitForTimeout(2500);
      const txt = await p.textContent('body');
      record(`${route} renders`, !p.url().includes('/login') && (txt || '').length > 100, p.url());
    } catch (e) {
      record(`${route} renders`, false, e.message.slice(0, 80));
    }
  }

  // mobile 375 sanity
  try {
    await p.setViewportSize({ width: 375, height: 812 });
    await p.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(2000);
    const box = await p.locator('body').boundingBox();
    record('mobile 375px layout', !!box && box.width <= 376, `width=${box?.width}`);
  } catch (e) {
    record('mobile 375px layout', false, e.message.slice(0, 80));
  }

  await ctx.close();
}

// ---------- ADMIN persona: alice ----------
{
  const { ctx, p } = await newPage();

  try {
    const url = await login(p, 'alice@example.com');
    record('alice login reaches /dashboard', url.includes('/dashboard'), url);
  } catch (e) {
    record('alice login reaches /dashboard', false, e.message.slice(0, 100));
  }

  try {
    await p.waitForTimeout(3000);
    const txt = await p.textContent('body');
    record('admin dashboard renders', (txt || '').length > 200, `len=${(txt || '').length}`);
  } catch (e) {
    record('admin dashboard renders', false, e.message.slice(0, 80));
  }

  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n=== UI: ${results.length - failed.length}/${results.length} passed ===`);
process.exit(failed.length ? 1 : 0);
