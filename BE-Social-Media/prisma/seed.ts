import 'dotenv/config';
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'mysql://root:password@localhost:3306/social_media';
}

import {
  PrismaClient,
  Role,
  GroupRole,
  AttendeeRole,
  AttendeeStatus,
  EventCategory,
  NotificationType,
} from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database bulk seeding (100+ records per table)...');

  const hashedPassword = await argon.hash('password');

  // 1. Seed 105 Users
  console.log('1. Seeding 105 users...');
  const userIds: string[] = [];

  // Anchor Demo Users
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      id: 'demo-alice-id-12345',
      userName: 'alice@example.com',
      nickName: 'Alice Johnson',
      email: 'alice@example.com',
      hashedPassword,
      role: Role.USER,
      isActive: true,
      avatarUrl: 'https://res.cloudinary.com/dcivdqyyj/image/upload/v1736957755/sq1svii2veo8hewyelud.jpg',
      coverPageUrl: 'https://res.cloudinary.com/dcivdqyyj/image/upload/v1736957736/mfbprtxbj5bjj8nkzt7f.jpg',
      bio: 'Fullstack AI Engineer & NLP Explorer 🚀',
      dateOfBirth: new Date('1998-07-26'),
    },
  });
  userIds.push(alice.id);

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      id: 'demo-bob-id-67890',
      userName: 'bob@example.com',
      nickName: 'Bob Builder',
      email: 'bob@example.com',
      hashedPassword,
      role: Role.USER,
      isActive: true,
      avatarUrl: 'https://res.cloudinary.com/dcivdqyyj/image/upload/v1736957755/sq1svii2veo8hewyelud.jpg',
      coverPageUrl: 'https://res.cloudinary.com/dcivdqyyj/image/upload/v1736957736/mfbprtxbj5bjj8nkzt7f.jpg',
      bio: 'Frontend Specialist & UI Designer ✨',
      dateOfBirth: new Date('1995-12-15'),
    },
  });
  userIds.push(bob.id);

  // Generate 103 additional users
  for (let i = 1; i <= 103; i++) {
    const email = `user${i}@example.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        id: `user-id-${i}`,
        userName: email,
        nickName: `User ${i}`,
        email,
        hashedPassword,
        role: i % 10 === 0 ? Role.ADMIN : Role.USER,
        isActive: true,
        avatarUrl: `https://picsum.photos/seed/user${i}/200/200`,
        coverPageUrl: `https://picsum.photos/seed/cover${i}/800/300`,
        bio: `Passionate about technology, web dev, and AI. User #${i}`,
        dateOfBirth: new Date(1990 + (i % 15), i % 12, (i % 28) + 1),
      },
    });
    userIds.push(user.id);
  }
  console.log(`✅ Seeded ${userIds.length} users.`);

  // 2. Seed 120 Follow relationships
  console.log('2. Seeding 120 follow relationships...');
  const followData = [];
  for (let i = 0; i < 120; i++) {
    const followerId = userIds[i % userIds.length];
    const followingId = userIds[(i + 1 + Math.floor(i / userIds.length)) % userIds.length];
    if (followerId !== followingId) {
      followData.push({ followerId, followingId });
    }
  }
  await prisma.follow.createMany({
    data: followData,
    skipDuplicates: true,
  });
  console.log('✅ Seeded follows.');

  // 3. Seed 110 Posts
  console.log('3. Seeding 110 posts...');
  const samplePosts = [
    'Exploring deep learning and NLP architectures for modern social apps!',
    'Next.js 15 App Router and React Server Components are game changers.',
    'Just deployed microservices backend to Vercel with zero downtime! 🚀',
    'What is your favorite CSS framework in 2026? Tailwind, Vanilla, or Styled Components?',
    'Building responsive web designs with smooth animations and dark mode.',
    'GraphQL vs REST APIs: Which one do you prefer for enterprise applications?',
    'Understanding TypeScript generics and advanced utility types.',
  ];

  const postIds: string[] = [];
  for (let i = 1; i <= 110; i++) {
    const userId = userIds[i % userIds.length];
    const textContent = `${samplePosts[i % samplePosts.length]} (#Post${i})`;
    const post = await prisma.post.create({
      data: {
        content: textContent,
        userId,
      },
    });
    postIds.push(post.id);
  }
  console.log(`✅ Seeded ${postIds.length} posts.`);

  // 4. Seed 110 Comments
  console.log('4. Seeding 110 comments...');
  const commentData = [];
  for (let i = 1; i <= 110; i++) {
    const postId = postIds[i % postIds.length];
    const userId = userIds[(i + 3) % userIds.length];
    commentData.push({
      content: `Great insight on post #${i}! Totally agree with this approach. 👍`,
      userId,
      postId,
    });
  }
  await prisma.comment.createMany({
    data: commentData,
  });
  console.log('✅ Seeded comments.');

  // 5. Seed 110 Likes
  console.log('5. Seeding 110 likes...');
  const likeData = [];
  for (let i = 0; i < 110; i++) {
    const postId = postIds[i % postIds.length];
    const userId = userIds[(i + 5) % userIds.length];
    likeData.push({ postId, userId });
  }
  await prisma.like.createMany({
    data: likeData,
    skipDuplicates: true,
  });
  console.log('✅ Seeded likes.');

  // 6. Seed 105 Bookmarks
  console.log('6. Seeding 105 bookmarks...');
  const bookmarkData = [];
  for (let i = 0; i < 105; i++) {
    const postId = postIds[i % postIds.length];
    const userId = userIds[(i + 7) % userIds.length];
    bookmarkData.push({ postId, userId });
  }
  await prisma.bookmark.createMany({
    data: bookmarkData,
    skipDuplicates: true,
  });
  console.log('✅ Seeded bookmarks.');

  // 7. Seed 100 Groups & Members
  console.log('7. Seeding 100 groups and group members...');
  const groupCategories = ['AI & Tech', 'Web Developers', 'Cloud Architecture', 'UI/UX Design', 'Data Science'];
  for (let i = 1; i <= 100; i++) {
    const creatorId = userIds[i % userIds.length];
    const categoryName = groupCategories[i % groupCategories.length];
    await prisma.group.create({
      data: {
        name: `${categoryName} Group #${i}`,
        description: `Official group for ${categoryName} discussions and community support.`,
        groupAvatar: `https://picsum.photos/seed/group${i}/300/300`,
        creatorId,
        members: {
          create: [
            { userId: creatorId, role: GroupRole.ADMIN },
            { userId: userIds[(i + 1) % userIds.length], role: GroupRole.MEMBER },
          ],
        },
      },
    });
  }
  console.log('✅ Seeded groups and group members.');

  // 8. Seed 100 Events & Attendees
  console.log('8. Seeding 100 events and attendees...');
  const eventCategories = [
    EventCategory.TECHNOLOGY,
    EventCategory.EDUCATION,
    EventCategory.BUSINESS,
    EventCategory.MUSIC,
    EventCategory.OTHER,
  ];

  for (let i = 1; i <= 100; i++) {
    const creatorId = userIds[i % userIds.length];
    const category = eventCategories[i % eventCategories.length];
    await prisma.event.create({
      data: {
        name: `Tech Summit & Workshop #${i}`,
        description: `Join us for event #${i} featuring industry keynotes and hands-on developer workshops.`,
        eventDate: new Date(2026, (i % 12), (i % 28) + 1),
        address: `Convention Center Hall ${i % 10 + 1}`,
        category,
        eventAvatar: `https://picsum.photos/seed/event${i}/400/200`,
        creatorId,
        attendees: {
          create: [
            { userId: creatorId, role: AttendeeRole.ADMIN, status: AttendeeStatus.ENROLL },
            { userId: userIds[(i + 2) % userIds.length], role: AttendeeRole.ATTENDEE, status: AttendeeStatus.ENROLL },
          ],
        },
      },
    });
  }
  console.log('✅ Seeded events and event attendees.');

  // 9. Seed 110 Notifications
  console.log('9. Seeding 110 notifications...');
  const notificationTypes = [
    NotificationType.LIKE,
    NotificationType.COMMENT,
    NotificationType.FOLLOW,
    NotificationType.BOOKMARK,
  ];

  const notificationData = [];
  for (let i = 1; i <= 110; i++) {
    const senderId = userIds[i % userIds.length];
    const receiverId = userIds[(i + 4) % userIds.length];
    const type = notificationTypes[i % notificationTypes.length];
    notificationData.push({
      content: `User ${i % userIds.length} interacted with your content (${type.toLowerCase()}).`,
      type,
      senderId,
      receiverId,
      isRead: i % 2 === 0,
    });
  }
  await prisma.notification.createMany({
    data: notificationData,
  });
  console.log('✅ Seeded notifications.');

  // 10. Seed 100 Chat Rooms & Chat Messages
  console.log('10. Seeding 100 chat rooms and messages...');
  for (let i = 1; i <= 100; i++) {
    const senderId = userIds[i % userIds.length];
    const receiverId = userIds[(i + 1) % userIds.length];
    await prisma.chatRoom.create({
      data: {
        type: 'DIRECT',
        name: `ChatRoom_${i}_${senderId}_${receiverId}`,
        creatorId: senderId,
        participants: {
          create: [{ userId: senderId }, { userId: receiverId }],
        },
        messages: {
          create: [
            {
              content: `Hello! Welcome to chat room #${i}`,
              type: 'DIRECT',
              senderId,
              receiverId,
            },
            {
              content: `Hi there! Responding in chat room #${i}`,
              type: 'DIRECT',
              senderId: receiverId,
              receiverId: senderId,
            },
          ],
        },
      },
    });
  }
  console.log('✅ Seeded chat rooms and messages.');

  // 11. Seed 100 Bookmarks
  console.log('11. Seeding 100 bookmarks...');
  const bookmarkData = [];
  for (let i = 0; i < 100; i++) {
    const userId = userIds[i % userIds.length];
    const postId = posts[i % posts.length]?.id;
    if (userId && postId) {
      bookmarkData.push({ userId, postId });
    }
  }
  await prisma.bookmark.createMany({
    data: bookmarkData,
    skipDuplicates: true,
  });
  console.log('✅ Seeded bookmarks.');

  console.log('🎉 Database bulk seeding completed successfully! All tables contain 100+ records.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
