const { PrismaClient, Role, EventCategory, NotificationType, AttendeeRole, AttendeeStatus, GroupRole } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting full database seed with 100+ records per table...');

  try {
    const hashedPassword = await bcrypt.hash('password', 10);

    // 1. Seed 100 Users
    console.log('Seeding 100 Users...');
    const userPromises = [];
    for (let i = 1; i <= 100; i++) {
      const isAlice = i === 1;
      const userName = isAlice ? 'alice@example.com' : `user${i}@example.com`;
      const nickName = isAlice ? 'Alice Johnson' : `User ${i}`;
      const email = isAlice ? 'alice@example.com' : `user${i}@example.com`;
      const id = isAlice ? 'demo-alice-id-12345' : `user-seed-id-${i}`;

      userPromises.push(
        prisma.user.upsert({
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
            bio: `Passionate developer & AI enthusiast #${i}`,
            dateOfBirth: new Date('1995-05-15'),
            isActive: true,
          },
        })
      );
    }
    const users = await Promise.all(userPromises);
    console.log(`✅ Seeded ${users.length} Users`);

    // 2. Seed 100 Posts
    console.log('Seeding 100 Posts...');
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

    const postPromises = [];
    for (let i = 1; i <= 100; i++) {
      const author = users[(i - 1) % users.length];
      postPromises.push(
        prisma.post.create({
          data: {
            id: `post-seed-id-${i}`,
            content: `${postContents[(i - 1) % postContents.length]} (Post #${i})`,
            userId: author.id,
            sentiment: i % 2 === 0 ? 'POSITIVE' : 'NEUTRAL',
            createdAt: new Date(Date.now() - i * 3600000),
          },
        }).catch(() => null)
      );
    }
    const posts = (await Promise.all(postPromises)).filter(Boolean);
    console.log(`✅ Seeded ${posts.length} Posts`);

    // 3. Seed 100 Groups
    console.log('Seeding 100 Groups...');
    const categories = ['AI & Machine Learning', 'Web Development', 'Cloud Computing', 'UI/UX Design', 'Data Science'];
    const groupPromises = [];
    for (let i = 1; i <= 100; i++) {
      const creator = users[(i - 1) % users.length];
      groupPromises.push(
        prisma.group.create({
          data: {
            id: `group-seed-id-${i}`,
            name: `${categories[(i - 1) % categories.length]} Hub #${i}`,
            description: `Official community hub for ${categories[(i - 1) % categories.length]} discussions and collaboration.`,
            groupAvatar: `https://picsum.photos/seed/group${i}/300/300`,
            creatorId: creator.id,
            members: {
              create: [
                { userId: creator.id, role: GroupRole.ADMIN },
                { userId: users[i % users.length].id, role: GroupRole.MEMBER }
              ]
            }
          },
        }).catch(() => null)
      );
    }
    const groups = (await Promise.all(groupPromises)).filter(Boolean);
    console.log(`✅ Seeded ${groups.length} Groups`);

    // 4. Seed 100 Events
    console.log('Seeding 100 Events...');
    const eventCategories = [EventCategory.TECHNOLOGY, EventCategory.EDUCATION, EventCategory.BUSINESS, EventCategory.MUSIC, EventCategory.OTHER];
    const eventPromises = [];
    for (let i = 1; i <= 100; i++) {
      const creator = users[(i - 1) % users.length];
      eventPromises.push(
        prisma.event.create({
          data: {
            id: `event-seed-id-${i}`,
            name: `Global Tech Conference & Summit #${i}`,
            description: `Join industry keynotes, live code demos, and developer workshops at Summit #${i}.`,
            eventDate: new Date(Date.now() + (i + 1) * 86400000),
            address: `Tech Convention Center, Hall ${(i % 10) + 1}`,
            category: eventCategories[(i - 1) % eventCategories.length],
            eventAvatar: `https://picsum.photos/seed/event${i}/400/200`,
            creatorId: creator.id,
            attendees: {
              create: [
                { userId: creator.id, role: AttendeeRole.ADMIN, status: AttendeeStatus.ENROLL },
                { userId: users[i % users.length].id, role: AttendeeRole.ATTENDEE, status: AttendeeStatus.ENROLL }
              ]
            }
          },
        }).catch(() => null)
      );
    }
    const events = (await Promise.all(eventPromises)).filter(Boolean);
    console.log(`✅ Seeded ${events.length} Events`);

    // 5. Seed 100 Notifications
    console.log('Seeding 100 Notifications...');
    const notifTypes = [NotificationType.LIKE, NotificationType.COMMENT, NotificationType.FOLLOW, NotificationType.BOOKMARK];
    const notifPromises = [];
    for (let i = 1; i <= 100; i++) {
      const sender = users[i % users.length];
      notifPromises.push(
        prisma.notification.create({
          data: {
            id: `notif-seed-id-${i}`,
            content: `${sender.nickName} interacted with your item #${i}`,
            type: notifTypes[(i - 1) % notifTypes.length],
            senderId: sender.id,
            receiverId: 'demo-alice-id-12345',
            isRead: i % 2 === 0,
          },
        }).catch(() => null)
      );
    }
    const notifications = (await Promise.all(notifPromises)).filter(Boolean);
    console.log(`✅ Seeded ${notifications.length} Notifications`);

    // 6. Seed 100 Comments
    console.log('Seeding 100 Comments...');
    const commentPromises = [];
    for (let i = 1; i <= 100; i++) {
      const author = users[i % users.length];
      const post = posts[(i - 1) % posts.length];
      if (post) {
        commentPromises.push(
          prisma.comment.create({
            data: {
              id: `comment-seed-id-${i}`,
              content: `Great insight on post #${i}! Absolutely agree with this point.`,
              userId: author.id,
              postId: post.id,
            },
          }).catch(() => null)
        );
      }
    }
    const comments = (await Promise.all(commentPromises)).filter(Boolean);
    console.log(`✅ Seeded ${comments.length} Comments`);

    console.log('🎉 Seed complete successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
