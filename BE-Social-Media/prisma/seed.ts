import { PrismaClient, Role, GroupRole, AttendeeRole, AttendeeStatus, EventCategory, NotificationType } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password
  const hashedPassword = await argon.hash('password');

  // 1. Create Users
  console.log('Creating users...');
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      id: 'demo-alice-id-12345',
      userName: 'alice@example.com',
      nickName: 'Alice',
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
      bio: 'Frontend enthusiast & UI designer ✨',
      dateOfBirth: new Date('1995-12-15'),
    },
  });

  const charlie = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      id: 'demo-charlie-id-11223',
      userName: 'charlie@example.com',
      nickName: 'Charlie',
      email: 'charlie@example.com',
      hashedPassword,
      role: Role.ADMIN,
      isActive: true,
      avatarUrl: 'https://res.cloudinary.com/dcivdqyyj/image/upload/v1736957755/sq1svii2veo8hewyelud.jpg',
      bio: 'Platform Administrator 🛡️',
    },
  });

  // 2. Create Follows
  console.log('Creating follow relationships...');
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: alice.id, followingId: bob.id } },
    update: {},
    create: { followerId: alice.id, followingId: bob.id },
  });

  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId: bob.id, followingId: alice.id } },
    update: {},
    create: { followerId: bob.id, followingId: alice.id },
  });

  // 3. Create Posts & Comments
  console.log('Creating posts & comments...');
  await prisma.post.create({
    data: {
      content: 'Hello World! Excited to launch our new Social Media NLP platform! 🎉',
      userId: alice.id,
      likes: {
        create: [{ userId: bob.id }],
      },
      comments: {
        create: [
          {
            content: 'Looks awesome! Great work team! 👏',
            userId: bob.id,
          },
        ],
      },
      bookmarks: {
        create: [{ userId: bob.id }],
      },
    },
  });

  await prisma.post.create({
    data: {
      content: 'Building React apps with Tailwind and NestJS microservices has never been smoother.',
      userId: bob.id,
      likes: {
        create: [{ userId: alice.id }],
      },
    },
  });

  // 4. Create Groups
  console.log('Creating groups...');
  await prisma.group.create({
    data: {
      name: 'AI & NLP Engineers Hub',
      description: 'Community for discussing Natural Language Processing and Modern AI Models.',
      groupAvatar: 'https://res.cloudinary.com/dcivdqyyj/image/upload/v1736957755/sq1svii2veo8hewyelud.jpg',
      creatorId: alice.id,
      members: {
        create: [
          { userId: alice.id, role: GroupRole.ADMIN },
          { userId: bob.id, role: GroupRole.MEMBER },
        ],
      },
    },
  });

  // 5. Create Events
  console.log('Creating events...');
  await prisma.event.create({
    data: {
      name: 'Global AI & Web Tech Summit 2026',
      description: 'Annual gathering for web developers and AI researchers.',
      eventDate: new Date('2026-09-20'),
      address: 'Convention Center, Tech District',
      category: EventCategory.TECHNOLOGY,
      eventAvatar: 'https://res.cloudinary.com/dcivdqyyj/image/upload/v1736957755/sq1svii2veo8hewyelud.jpg',
      creatorId: alice.id,
      attendees: {
        create: [
          { userId: alice.id, role: AttendeeRole.ADMIN, status: AttendeeStatus.ENROLL },
          { userId: bob.id, role: AttendeeRole.ATTENDEE, status: AttendeeStatus.ENROLL },
        ],
      },
    },
  });

  // 6. Create Notifications
  console.log('Creating notifications...');
  await prisma.notification.create({
    data: {
      content: 'Bob liked your post.',
      type: NotificationType.LIKE,
      senderId: bob.id,
      receiverId: alice.id,
    },
  });

  // 7. Create Chat Rooms & Messages
  console.log('Creating chat rooms...');
  await prisma.chatRoom.create({
    data: {
      type: 'DIRECT',
      name: `${alice.id}_${bob.id}`,
      creatorId: alice.id,
      participants: {
        create: [{ userId: alice.id }, { userId: bob.id }],
      },
      messages: {
        create: [
          {
            content: 'Hey Alice! How is the NLP project going?',
            type: 'DIRECT',
            senderId: bob.id,
            receiverId: alice.id,
          },
          {
            content: 'Hey Bob! Everything is running smooth and all API endpoints are returning 200 OK!',
            type: 'DIRECT',
            senderId: alice.id,
            receiverId: bob.id,
          },
        ],
      },
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
