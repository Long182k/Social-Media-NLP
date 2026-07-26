const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
const argon2 = require('argon2');

const DATABASE_URL =
  'postgresql://neondb_owner:npg_knzcaILw5O9A@ep-super-bird-az3gx34q-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function seed() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  console.log('✅ Connected to Neon PostgreSQL database');

  try {
    const hashedPassword = await argon2.hash('password');

    // ─────────────────────────────────────────────────────
    // 1. USERS (105)
    // ─────────────────────────────────────────────────────
    console.log('\n1. Seeding 105 Users...');
    const userIds = [];
    for (let i = 1; i <= 105; i++) {
      const id = i === 1 ? 'demo-alice-id-12345' : `user-seed-id-${i}`;
      const email = i === 1 ? 'alice@example.com' : `user${i}@example.com`;
      const userName = i === 1 ? 'alice@example.com' : `user${i}@example.com`;
      const nickName = i === 1 ? 'Alice Johnson' : `User ${i}`;
      const avatarUrl = `https://picsum.photos/seed/user${i}/200/200`;
      const coverPageUrl = `https://picsum.photos/seed/cover${i}/800/300`;
      const bio = `Fullstack AI Engineer & NLP Explorer #${i}`;
      const dob = '1995-05-15';

      await client.query(
        `INSERT INTO users (id, "userName", "nickName", email, "hashedPassword", role, "avatarUrl", "coverPageUrl", bio, "dateOfBirth", "isActive", "createdAt")
         VALUES ($1,$2,$3,$4,$5,'USER',$6,$7,$8,$9,true,NOW())
         ON CONFLICT (email) DO UPDATE SET "hashedPassword"=$5`,
        [id, userName, nickName, email, hashedPassword, avatarUrl, coverPageUrl, bio, dob]
      );
      userIds.push(id);
    }
    console.log(`   ✅ Seeded ${userIds.length} Users`);

    // ─────────────────────────────────────────────────────
    // 2. FOLLOWS (100)
    // ─────────────────────────────────────────────────────
    console.log('\n2. Seeding 100 Follows...');
    for (let i = 0; i < 100; i++) {
      const followerId = userIds[i % userIds.length];
      const followingId = userIds[(i + 3) % userIds.length];
      if (followerId !== followingId) {
        await client.query(
          `INSERT INTO follows (id, "followerId", "followingId") VALUES ($1,$2,$3)
           ON CONFLICT ("followerId","followingId") DO NOTHING`,
          [uuidv4(), followerId, followingId]
        );
      }
    }
    console.log('   ✅ Seeded 100 Follows');

    // ─────────────────────────────────────────────────────
    // 3. GROUPS (30)
    // ─────────────────────────────────────────────────────
    console.log('\n3. Seeding 30 Groups...');
    const groupIds = [];
    const groupNames = ['AI & ML Enthusiasts','NLP Research Lab','React Developers','Fullstack Engineers','DevOps Masters','Startup Founders','Open Source Contributors','UI/UX Designers','Blockchain Dev','Cloud Architects'];
    for (let i = 1; i <= 30; i++) {
      const gid = `group-seed-id-${i}`;
      const creatorId = userIds[(i - 1) % userIds.length];
      await client.query(
        `INSERT INTO groups (id, name, description, "creatorId", "createdAt")
         VALUES ($1,$2,$3,$4,NOW())
         ON CONFLICT (id) DO NOTHING`,
        [gid, `${groupNames[i % groupNames.length]} #${i}`, `Community group #${i} for tech enthusiasts.`, creatorId]
      );
      groupIds.push(gid);
      // Add creator as admin member
      await client.query(
        `INSERT INTO group_members (id, "groupId", "userId", role, status, "joinedAt")
         VALUES ($1,$2,$3,'ADMIN','JOINED',NOW())
         ON CONFLICT ("userId","groupId") DO NOTHING`,
        [uuidv4(), gid, creatorId]
      );
    }
    console.log('   ✅ Seeded 30 Groups');

    // ─────────────────────────────────────────────────────
    // 4. POSTS (100)
    // ─────────────────────────────────────────────────────
    console.log('\n4. Seeding 100 Posts...');
    const postContents = [
      'Exploring deep learning and NLP architectures for modern social apps! 🚀',
      'Next.js 15 App Router and React Server Components are game changers.',
      'Just deployed microservices backend to Vercel with zero downtime! ✨',
      'What is your favorite CSS framework in 2026? Tailwind, Vanilla, or Styled?',
      'Building responsive web designs with smooth animations and sleek dark mode.',
      'GraphQL vs REST APIs: Which one do you prefer for enterprise microservices?',
      'Understanding TypeScript generics and advanced utility types in production.',
      'Optimizing database indexes in PostgreSQL for millions of records.',
      'How to build real-time chat applications with WebSockets and Redis.',
      'AI pair programming: The future of software engineering is here! 🤖',
    ];
    const postIds = [];
    for (let i = 1; i <= 100; i++) {
      const pid = `post-seed-id-${i}`;
      const userId = userIds[(i - 1) % userIds.length];
      const sentiment = i % 2 === 0 ? 'POSITIVE' : 'NEUTRAL';
      const content = `${postContents[(i - 1) % postContents.length]} (Post #${i})`;
      const createdAt = new Date(Date.now() - i * 3600000).toISOString();
      await client.query(
        `INSERT INTO posts (id, content, "userId", sentiment, "createdAt")
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (id) DO NOTHING`,
        [pid, content, userId, sentiment, createdAt]
      );
      postIds.push(pid);
    }
    console.log('   ✅ Seeded 100 Posts');

    // ─────────────────────────────────────────────────────
    // 5. COMMENTS (100)
    // ─────────────────────────────────────────────────────
    console.log('\n5. Seeding 100 Comments...');
    const commentTexts = [
      'Great insight! Totally agree with this.',
      'This is so helpful, thanks for sharing!',
      'Really impressive work here 🔥',
      'Could not have said it better myself.',
      'Fascinating perspective on this topic.',
    ];
    for (let i = 0; i < 100; i++) {
      await client.query(
        `INSERT INTO comments (id, content, "userId", "postId", sentiment, "createdAt")
         VALUES ($1,$2,$3,$4,'POSITIVE',NOW())
         ON CONFLICT (id) DO NOTHING`,
        [uuidv4(), commentTexts[i % commentTexts.length], userIds[(i + 1) % userIds.length], postIds[i % postIds.length]]
      );
    }
    console.log('   ✅ Seeded 100 Comments');

    // ─────────────────────────────────────────────────────
    // 6. LIKES (100)
    // ─────────────────────────────────────────────────────
    console.log('\n6. Seeding 100 Likes...');
    for (let i = 0; i < 100; i++) {
      const userId = userIds[(i + 5) % userIds.length];
      const postId = postIds[i % postIds.length];
      await client.query(
        `INSERT INTO likes (id, "userId", "postId", "createdAt")
         VALUES ($1,$2,$3,NOW())
         ON CONFLICT ("userId","postId") DO NOTHING`,
        [uuidv4(), userId, postId]
      );
    }
    console.log('   ✅ Seeded 100 Likes');

    // ─────────────────────────────────────────────────────
    // 7. BOOKMARKS (100)
    // ─────────────────────────────────────────────────────
    console.log('\n7. Seeding 100 Bookmarks...');
    for (let i = 0; i < 100; i++) {
      const userId = userIds[(i + 7) % userIds.length];
      const postId = postIds[i % postIds.length];
      await client.query(
        `INSERT INTO bookmarks (id, "userId", "postId", "createdAt")
         VALUES ($1,$2,$3,NOW())
         ON CONFLICT ("userId","postId") DO NOTHING`,
        [uuidv4(), userId, postId]
      );
    }
    console.log('   ✅ Seeded 100 Bookmarks');

    // ─────────────────────────────────────────────────────
    // 8. EVENTS (100)
    // ─────────────────────────────────────────────────────
    console.log('\n8. Seeding 100 Events...');
    const eventCategories = ['TECHNOLOGY','EDUCATION','BUSINESS','MUSIC','OTHER','SPORTS','FOOD','ART','HEALTH'];
    const eventIds = [];
    for (let i = 1; i <= 100; i++) {
      const eid = `event-seed-id-${i}`;
      const creatorId = userIds[(i - 1) % userIds.length];
      const category = eventCategories[(i - 1) % eventCategories.length];
      const eventDate = new Date(Date.now() + (i + 1) * 86400000).toISOString();
      await client.query(
        `INSERT INTO events (id, name, description, "eventDate", address, category, "eventAvatar", "creatorId", "createdAt")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          eid,
          `Global Tech Conference & Summit #${i}`,
          `Join industry keynotes, live code demos, and developer workshops at Summit #${i}.`,
          eventDate,
          `Tech Convention Center, Hall ${(i % 10) + 1}`,
          category,
          `https://picsum.photos/seed/event${i}/400/200`,
          creatorId,
        ]
      );
      eventIds.push(eid);
      // Add creator as ADMIN attendee
      await client.query(
        `INSERT INTO event_attendees (id, "eventId", "userId", role, status, "createdAt")
         VALUES ($1,$2,$3,'ADMIN','ENROLL',NOW())
         ON CONFLICT ("userId","eventId") DO NOTHING`,
        [uuidv4(), eid, creatorId]
      );
      // Add second attendee
      const attendeeId = userIds[i % userIds.length];
      if (attendeeId !== creatorId) {
        await client.query(
          `INSERT INTO event_attendees (id, "eventId", "userId", role, status, "createdAt")
           VALUES ($1,$2,$3,'ATTENDEE','ENROLL',NOW())
           ON CONFLICT ("userId","eventId") DO NOTHING`,
          [uuidv4(), eid, attendeeId]
        );
      }
    }
    console.log('   ✅ Seeded 100 Events & Attendees');

    // ─────────────────────────────────────────────────────
    // 9. NOTIFICATIONS (110)
    // ─────────────────────────────────────────────────────
    console.log('\n9. Seeding 110 Notifications...');
    const notifTypes = ['LIKE','COMMENT','FOLLOW','BOOKMARK'];
    for (let i = 0; i < 110; i++) {
      const senderId = userIds[i % userIds.length];
      const receiverId = userIds[(i + 4) % userIds.length];
      if (senderId !== receiverId) {
        const type = notifTypes[i % notifTypes.length];
        await client.query(
          `INSERT INTO "Notification" (id, content, type, "senderId", "receiverId", "isRead", "createdAt", "updatedAt")
           VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())`,
          [uuidv4(), `User interacted with your content (${type.toLowerCase()}).`, type, senderId, receiverId, i % 2 === 0]
        );
      }
    }
    console.log('   ✅ Seeded 110 Notifications');

    // ─────────────────────────────────────────────────────
    // 10. CHAT ROOMS + MESSAGES (100 rooms, 200 messages)
    // ─────────────────────────────────────────────────────
    console.log('\n10. Seeding 100 Chat Rooms & 200 Messages...');
    for (let i = 1; i <= 100; i++) {
      const roomId = `chat-room-seed-${i}`;
      const senderId = userIds[(i - 1) % userIds.length];
      const receiverId = userIds[i % userIds.length];

      await client.query(
        `INSERT INTO "ChatRoom" (id, name, type, "creatorId", "createdAt", "updatedAt")
         VALUES ($1,$2,'DIRECT',$3,NOW(),NOW())
         ON CONFLICT (id) DO NOTHING`,
        [roomId, `ChatRoom_${i}`, senderId]
      );
      // Participants
      await client.query(
        `INSERT INTO "ChatParticipant" (id, "userId", "chatRoomId", "joinedAt")
         VALUES ($1,$2,$3,NOW())
         ON CONFLICT ("userId","chatRoomId") DO NOTHING`,
        [uuidv4(), senderId, roomId]
      );
      await client.query(
        `INSERT INTO "ChatParticipant" (id, "userId", "chatRoomId", "joinedAt")
         VALUES ($1,$2,$3,NOW())
         ON CONFLICT ("userId","chatRoomId") DO NOTHING`,
        [uuidv4(), receiverId, roomId]
      );
      // Messages
      await client.query(
        `INSERT INTO "ChatMessage" (id, content, type, "senderId", "receiverId", "chatRoomId", "createdAt", "updatedAt")
         VALUES ($1,$2,'DIRECT',$3,$4,$5,NOW(),NOW())
         ON CONFLICT (id) DO NOTHING`,
        [uuidv4(), `Hello! Welcome to chat room #${i} 👋`, senderId, receiverId, roomId]
      );
      await client.query(
        `INSERT INTO "ChatMessage" (id, content, type, "senderId", "receiverId", "chatRoomId", "createdAt", "updatedAt")
         VALUES ($1,$2,'DIRECT',$3,$4,$5,NOW(),NOW())
         ON CONFLICT (id) DO NOTHING`,
        [uuidv4(), `Hi there! Great to connect in room #${i} 🎉`, receiverId, senderId, roomId]
      );
    }
    console.log('   ✅ Seeded 100 Chat Rooms & 200 Messages');

    // ─────────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────────
    const counts = await Promise.all([
      client.query('SELECT COUNT(*) FROM users'),
      client.query('SELECT COUNT(*) FROM posts'),
      client.query('SELECT COUNT(*) FROM bookmarks'),
      client.query('SELECT COUNT(*) FROM events'),
      client.query('SELECT COUNT(*) FROM "ChatMessage"'),
      client.query('SELECT COUNT(*) FROM "Notification"'),
    ]);

    console.log('\n🎉 =================== SEED COMPLETE ===================');
    console.log(`   Users:         ${counts[0].rows[0].count}`);
    console.log(`   Posts:         ${counts[1].rows[0].count}`);
    console.log(`   Bookmarks:     ${counts[2].rows[0].count}`);
    console.log(`   Events:        ${counts[3].rows[0].count}`);
    console.log(`   Chat Messages: ${counts[4].rows[0].count}`);
    console.log(`   Notifications: ${counts[5].rows[0].count}`);
    console.log('=======================================================');
  } catch (err) {
    console.error('\n❌ Seed error:', err.message);
    console.error(err);
  } finally {
    await client.end();
  }
}

seed();
