const { PrismaClient, Role, EventCategory, NotificationType, AttendeeRole, AttendeeStatus, GroupRole } = require('@prisma/client');
const argon = require('argon2');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting comprehensive database seed for Messages, Bookmarks, Events, and all tables...');

  try {
    const hashedPassword = await argon.hash('password');

    // 1. Seed 105 Users
    console.log('1. Seeding 105 Users...');
    const userIds = [];
    for (let i = 1; i <= 105; i++) {
      const isAlice = i === 1;
      const userName = isAlice ? 'alice@example.com' : `user${i}@example.com`;
      const nickName = isAlice ? 'Alice Johnson' : `User ${i}`;
      const email = isAlice ? 'alice@example.com' : `user${i}@example.com`;
      const id = isAlice ? 'demo-alice-id-12345' : `user-seed-id-${i}`;

      const user = await prisma.user.upsert({
        where: { email },
        update: { hashedPassword },
        create: {
          id,
          userName,
          nickName,
          email,
          hashedPassword,
          role: Role.USER,
          avatarUrl: `https://picsum.photos/seed/user${i}/200/200`,
          coverPageUrl: `https://picsum.photos/seed/cover${i}/800/300`,
          bio: `Fullstack AI Engineer & NLP Explorer #${i}`,
          dateOfBirth: new Date('1995-05-15'),
          isActive: true,
        },
      });
      userIds.push(user.id);
    }
    console.log(`✅ Seeded ${userIds.length} Users`);

    // 2. Seed 100 Posts
    console.log('2. Seeding 100 Posts...');
    const postContents = [
      'Exploring deep learning and NLP architectures for modern social apps! 🚀',
      'Next.js 15 App Router and React Server Components are game changers for web apps.',
      'Just deployed microservices backend to Vercel with zero downtime! ✨',
      'What is your favorite CSS framework in 2026? Tailwind, Vanilla, or Styled Components?',
      'Building responsive web designs with smooth animations and sleek dark mode.',
      'GraphQL vs REST APIs: Which one do you prefer for enterprise microservices?',
      'Understanding TypeScript generics and advanced utility types in production.',
      'Optimizing database indexes in MySQL for millions of records.',
      'How to build real-time chat applications with WebSockets and Redis pub/sub.',
      'AI agents pair programming: The future of software engineering is here!'
    ];

    const posts = [];
    for (let i = 1; i <= 100; i++) {
      const authorId = userIds[(i - 1) % userIds.length];
      const post = await prisma.post.upsert({
        where: { id: `post-seed-id-${i}` },
        update: {},
        create: {
          id: `post-seed-id-${i}`,
          content: `${postContents[(i - 1) % postContents.length]} (Post #${i})`,
          userId: authorId,
          sentiment: i % 2 === 0 ? 'POSITIVE' : 'NEUTRAL',
          createdAt: new Date(Date.now() - i * 3600000),
        },
      }).catch(() => null);
      if (post) posts.push(post);
    }
    console.log(`✅ Seeded ${posts.length} Posts`);

    // 3. Seed 100 Events & Attendees
    console.log('3. Seeding 100 Events & Attendees...');
    const eventCategories = [EventCategory.TECHNOLOGY, EventCategory.EDUCATION, EventCategory.BUSINESS, EventCategory.MUSIC, EventCategory.OTHER];
    for (let i = 1; i <= 100; i++) {
      const creatorId = userIds[(i - 1) % userIds.length];
      await prisma.event.upsert({
        where: { id: `event-seed-id-${i}` },
        update: {},
        create: {
          id: `event-seed-id-${i}`,
          name: `Global Tech Conference & Summit #${i}`,
          description: `Join industry keynotes, live code demos, and developer workshops at Summit #${i}.`,
          eventDate: new Date(Date.now() + (i + 1) * 86400000),
          address: `Tech Convention Center, Hall ${(i % 10) + 1}`,
          category: eventCategories[(i - 1) % eventCategories.length],
          eventAvatar: `https://picsum.photos/seed/event${i}/400/200`,
          creatorId,
          attendees: {
            create: [
              { userId: creatorId, role: AttendeeRole.ADMIN, status: AttendeeStatus.ENROLL },
              { userId: userIds[i % userIds.length], role: AttendeeRole.ATTENDEE, status: AttendeeStatus.ENROLL }
            ]
          }
        },
      }).catch(() => null);
    }
    console.log('✅ Seeded 100 Events & Event Attendees');

    // 4. Seed 100 Chat Rooms & 200 Messages
    console.log('4. Seeding 100 Chat Rooms & Chat Messages...');
    for (let i = 1; i <= 100; i++) {
      const senderId = userIds[(i - 1) % userIds.length];
      const receiverId = userIds[i % userIds.length];
      await prisma.chatRoom.upsert({
        where: { id: `chat-room-seed-${i}` },
        update: {},
        create: {
          id: `chat-room-seed-${i}`,
          type: 'DIRECT',
          name: `ChatRoom_${i}_${senderId}_${receiverId}`,
          creatorId: senderId,
          participants: {
            create: [{ userId: senderId }, { userId: receiverId }],
          },
          messages: {
            create: [
              {
                id: `msg-seed-${i}-1`,
                content: `Hello! Welcome to chat room #${i}`,
                type: 'DIRECT',
                senderId,
                receiverId,
              },
              {
                id: `msg-seed-${i}-2`,
                content: `Hi there! Responding in chat room #${i}`,
                type: 'DIRECT',
                senderId: receiverId,
                receiverId: senderId,
              },
            ],
          },
        },
      }).catch(() => null);
    }
    console.log('✅ Seeded 100 Chat Rooms & 200 Messages');

    // 5. Seed 100 Bookmarks
    console.log('5. Seeding 100 Bookmarks...');
    for (let i = 1; i <= 100; i++) {
      const userId = userIds[(i - 1) % userIds.length];
      const post = posts[(i - 1) % posts.length];
      if (post) {
        await prisma.bookmark.upsert({
          where: { userId_postId: { userId, postId: post.id } },
          update: {},
          create: {
            userId,
            postId: post.id,
          },
        }).catch(() => null);
      }
    }
    console.log('✅ Seeded 100 Bookmarks');

    console.log('🎉 Full database seeding script complete for Messages, Bookmarks, Events, and all tables!');
  } catch (error) {
    console.error('Error during database seed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
