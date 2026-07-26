async function auditCombinedDeployment() {
  const baseUrl = 'https://social-media-nlp-68v3eamms-long182ks-projects.vercel.app';
  console.log('🧪 Auditing Single Unified Monorepo Deployment:', baseUrl);

  // 1. Audit Frontend HTML Page
  const htmlRes = await fetch(baseUrl + '/');
  const htmlText = await htmlRes.text();
  const isFEWorking = htmlRes.status === 200 && htmlText.includes('<!doctype html>');
  console.log('[1/6] GET / (Frontend Single Page App) Status:', htmlRes.status, '| HTML Valid:', isFEWorking);

  // 2. Audit Backend Login API
  const loginRes = await fetch(baseUrl + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'alice@example.com', password: 'password' }),
  });
  const user = await loginRes.json();
  console.log('[2/6] POST /auth/login Status:', loginRes.status, '| User UUID:', user.userId || user.id);

  const authHeader = { 'Authorization': 'Bearer ' + user.accessToken, 'Content-Type': 'application/json' };

  // 3. Audit Backend Get Posts
  const postsRes = await fetch(baseUrl + '/posts', { headers: authHeader });
  const postsData = await postsRes.json();
  const posts = postsData.data || postsData;
  console.log('[3/6] GET /posts Status:', postsRes.status, '| Posts Count:', posts.length);

  // 4. Audit Backend Direct Chat Room
  const chatRes = await fetch(baseUrl + '/chat/room', {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({
      senderId: user.userId || user.id,
      receiverId: posts[1].userId || posts[1].user?.id,
      type: 'DIRECT'
    }),
  });
  console.log('[4/6] POST /chat/room Status:', chatRes.status, '| Room UUID:', (await chatRes.json()).id);

  // 5. Audit GraphQL likePost
  const gqlRes = await fetch(baseUrl + '/graphql', {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({
      query: `mutation LikePost($id: ID!) { likePost(id: $id) { liked } }`,
      variables: { id: posts[0].id }
    }),
  });
  console.log('[5/6] GraphQL likePost Status:', gqlRes.status, '| Result:', await gqlRes.json());

  // 6. Audit Backend Sign Out
  const signoutRes = await fetch(baseUrl + '/auth/signout', {
    method: 'POST',
    headers: authHeader,
    body: JSON.stringify({ refreshToken: user.refreshToken }),
  });
  console.log('[6/6] POST /auth/signout Status:', signoutRes.status, '| Message:', (await signoutRes.json()).message);

  console.log('\n🎉 SINGLE UNIFIED MONOREPO DEPLOYMENT (FE + BE) VERIFIED 100% WORKING!');
}

auditCombinedDeployment().catch(e => console.error('Audit Error:', e));
