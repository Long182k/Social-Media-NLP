async function verifyUnified() {
  const url = 'https://social-media-oxtfctfl9-long182ks-projects.vercel.app';
  console.log('Testing deployment URL:', url);

  const feRes = await fetch(url + '/');
  const feHtml = await feRes.text();
  console.log('[FE] GET / Status:', feRes.status, '| HTML Length:', feHtml.length);
  console.log('[FE] HTML snippet:', feHtml.substring(0, 150));

  const beRes = await fetch(url + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'alice@example.com', password: 'password' }),
  });
  console.log('[BE] POST /auth/login Status:', beRes.status, '| User UUID:', (await beRes.json()).userId);
}

verifyUnified().catch(e => console.error(e));
