import 'dotenv/config';
import {
  PrismaClient,
  Role,
  GroupRole,
  AttendeeRole,
  AttendeeStatus,
  EventCategory,
  NotificationType,
  MediaType,
} from '@prisma/client';
import * as argon from 'argon2';
import { randomUUID } from 'crypto';

const NEON_DB_URL =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_knzcaILw5O9A@ep-super-bird-az3gx34q-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: NEON_DB_URL,
    },
  },
});

// Unsplash high quality curated profile avatars
const PROFILE_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
];

// Unsplash cover banner backgrounds
const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
];

// Unsplash post content attachment images
const POST_IMAGES = [
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
];

const HUMAN_PROFILES = [
  { name: 'Alice Johnson', email: 'alice@example.com', nick: 'Alice Johnson', bio: 'Fullstack AI Engineer & NLP Explorer 🚀 | VinRobotics' },
  { name: 'Bob Builder', email: 'bob@example.com', nick: 'Bob Builder', bio: 'Frontend Specialist & UI Designer ✨' },
  { name: 'Sophia Martinez', email: 'sophia.martinez@gmail.com', nick: 'Sophia M.', bio: 'Lead Product Designer @ Creative Studio | Figma & UX Systems' },
  { name: 'Nguyen Van An', email: 'an.nguyen@vinrobotics.vn', nick: 'An Nguyen', bio: 'Senior NLP Researcher & PyTorch Architect | Hanoi, Vietnam' },
  { name: 'Alexander Wright', email: 'alex.wright@techcorp.io', nick: 'Alex Wright', bio: 'Cloud Infrastructure & Kubernetes Evangelist ☁️' },
  { name: 'Emily Chen', email: 'emily.chen@stanford.edu', nick: 'Emily Chen', bio: 'AI Safety Researcher & Ethics in Tech | SF Bay Area' },
  { name: 'Liam O\'Connor', email: 'liam.oc@devhub.com', nick: 'Liam O\'Connor', bio: 'React Native & Mobile Performance Consultant' },
  { name: 'Elena Rostova', email: 'elena.rostova@design.org', nick: 'Elena R.', bio: 'Typography, Visual Systems & Motion Design 🎨' },
  { name: 'Tran Minh Duc', email: 'duc.tran@startup.vn', nick: 'Duc Tran', bio: 'Tech Co-founder @ AI Assistant | HCM City, Vietnam 🇻🇳' },
  { name: 'Marcus Vance', email: 'marcus.vance@cybersecurity.net', nick: 'Marcus V.', bio: 'AppSec Specialist, Rust Developer & Open Source Contributor' },
  { name: 'Jessica Taylor', email: 'jessica.taylor@venture.com', nick: 'Jess Taylor', bio: 'Tech Investor & Community Host @ TechFounders' },
  { name: 'David Kim', email: 'david.kim@ai-labs.kr', nick: 'David Kim', bio: 'Deep Learning & Transformer Model Optimization Specialist' },
];

const ADDRESSES = [
  '79 Le Loi Street, District 1, Ho Chi Minh City, Vietnam',
  '123 Market Street, Suite 400, San Francisco, CA 94105',
  '45 Lang Ha Street, Ba Dinh District, Hanoi, Vietnam',
  '500 Howard Street, San Francisco, CA 94105',
  '10 Collyer Quay, Ocean Financial Centre, Singapore',
  '71 Stevenson St, San Francisco, CA',
  '264 Nguyen Thi Minh Khai, District 3, Ho Chi Minh City',
];

const POST_CONTENTS = [
  'Just open-sourced our new NLP Transformer pipeline for real-time sentiment analysis! 🚀 Check it out and let me know your feedback.',
  'Next.js 15 App Router and React 19 Server Actions have transformed how we build full-stack web applications.',
  'Building resilient database architectures with PostgreSQL and Prisma ORM on Neon Serverless. Benchmark results are incredible!',
  'UI Design tip: Always prioritize typography hierarchy and visual contrast before adding complex animations.',
  'Attending the Global AI Summit 2026 today! Inspiring talks on generative models, local LLMs, and edge computing.',
  'Optimizing bundle sizes in Webpack & Vite: Direct imports vs barrel file overhead. A 40% reduction in initial load time!',
  'TypeScript Tip: Use template literal types and conditional type inference to build robust schema validators.',
  'Excited to share that our team just completed the migration of our backend services to NestJS microservices!',
  'What is your go-to state management library in 2026? Zustand, Redux Toolkit, or React Context with hooks?',
  'Designing accessible web apps for screen readers: ARIA labels, semantic HTML5 tags, and keyboard focus management.',
];

const GROUP_NAMES = [
  { name: 'React & Next.js Developers Network', desc: 'Community for React, Next.js, and TypeScript developers sharing code, jobs, and performance tips.' },
  { name: 'AI & NLP Innovators Hub', desc: 'Exploring Large Language Models, PyTorch, Node-NLP, and real-time AI applications.' },
  { name: 'UI/UX Designers & Design Systems', desc: 'Figma templates, component libraries, accessibility guidelines, and user research.' },
  { name: 'Vietnam Tech Founders & Engineers', desc: 'Connecting software engineers, founders, and startups across Vietnam and Southeast Asia.' },
  { name: 'Cloud Native & DevOps Engineers', desc: 'Docker, Kubernetes, AWS, Vercel deployments, and CI/CD automation.' },
];

const EVENT_NAMES = [
  { name: 'AI & NLP Summit 2026', desc: 'Annual developer summit focusing on NLP models, sentiment analysis, and intelligent web apps.' },
  { name: 'Next.js 15 & React 19 Deep Dive Workshop', desc: 'Hands-on workshop exploring Server Components, View Transitions, and API route optimization.' },
  { name: 'Global Tech Founders & Startup Meetup', desc: 'Networking event for tech entrepreneurs, engineers, and product creators.' },
  { name: 'Design System & Component Architecture Conference', desc: 'Best practices for building scalable React component libraries and design tokens.' },
  { name: 'Full-Stack JavaScript & TypeScript Bootcamp', desc: 'Interactive session covering NestJS, Prisma PostgreSQL, GraphQL, and modern web deployment.' },
];

async function seed() {
  console.log('🧹 Clearing existing database records...');
  try {
    await prisma.attachment.deleteMany();
    await prisma.chatMessage.deleteMany();
    await prisma.chatParticipant.deleteMany();
    await prisma.chatRoom.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.eventAttendee.deleteMany();
    await prisma.event.deleteMany();
    await prisma.groupMember.deleteMany();
    await prisma.group.deleteMany();
    await prisma.bookmark.deleteMany();
    await prisma.like.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.post.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Database cleared.');
  } catch (err: any) {
    console.warn('Clear DB warning:', err.message);
  }

  const hashedPassword = await argon.hash('password');
  console.log('🌱 Seeding human users with UUIDs...');

  const userIds: string[] = [];
  const userObjects: any[] = [];

  // Create 100 Users (all with pure UUIDs)
  for (let i = 0; i < 100; i++) {
    const userId = randomUUID();
    const profileTemplate = HUMAN_PROFILES[i % HUMAN_PROFILES.length];
    const email = i < HUMAN_PROFILES.length ? profileTemplate.email : `human.user${i}@example.com`;
    const name = i < HUMAN_PROFILES.length ? profileTemplate.name : `Developer User #${i}`;
    const nick = i < HUMAN_PROFILES.length ? profileTemplate.nick : `DevUser${i}`;
    const bio = i < HUMAN_PROFILES.length ? profileTemplate.bio : `Software Developer passionate about technology & innovation. User #${i}`;
    const avatarUrl = PROFILE_AVATARS[i % PROFILE_AVATARS.length];
    const coverPageUrl = COVER_IMAGES[i % COVER_IMAGES.length];

    const user = await prisma.user.create({
      data: {
        id: userId,
        userName: email,
        nickName: nick,
        email: email,
        hashedPassword,
        role: i === 0 || i % 15 === 0 ? Role.ADMIN : Role.USER,
        isActive: true,
        avatarUrl,
        coverPageUrl,
        bio,
        dateOfBirth: new Date(1992 + (i % 12), i % 12, (i % 25) + 1),
      },
    });

    userIds.push(user.id);
    userObjects.push(user);
  }
  console.log(`✅ Seeded ${userIds.length} users with pure UUIDs.`);

  // Alice & Bob reference IDs
  const aliceId = userIds[0];

  // Seed Follow Relationships
  console.log('🌱 Seeding Follow relationships...');
  const followRecords = [];
  for (let i = 0; i < 120; i++) {
    const followerId = userIds[i % userIds.length];
    const followingId = userIds[(i + 1 + Math.floor(i / userIds.length)) % userIds.length];
    if (followerId !== followingId) {
      followRecords.push({
        id: randomUUID(),
        followerId,
        followingId,
      });
    }
  }
  await prisma.follow.createMany({ data: followRecords, skipDuplicates: true });

  // Seed Posts
  console.log('🌱 Seeding 100 Posts with UUIDs and Unsplash attachments...');
  const postIds: string[] = [];
  for (let i = 0; i < 100; i++) {
    const postId = randomUUID();
    const authorId = userIds[i % userIds.length];
    const content = POST_CONTENTS[i % POST_CONTENTS.length] + ` (#${i + 1})`;
    
    const post = await prisma.post.create({
      data: {
        id: postId,
        content,
        userId: authorId,
        attachments: i % 3 === 0 ? {
          create: [{
            id: randomUUID(),
            url: POST_IMAGES[i % POST_IMAGES.length],
            type: i % 6 === 0 ? MediaType.VIDEO : MediaType.IMAGE,
          }],
        } : undefined,
      },
    });
    postIds.push(post.id);
  }
  console.log(`✅ Seeded ${postIds.length} posts.`);

  // Seed Comments
  console.log('🌱 Seeding Comments...');
  const commentRecords = [];
  for (let i = 0; i < 100; i++) {
    commentRecords.push({
      id: randomUUID(),
      content: `Insightful post! Really appreciate the detailed explanation and code snippets. 👍`,
      userId: userIds[(i + 3) % userIds.length],
      postId: postIds[i % postIds.length],
    });
  }
  await prisma.comment.createMany({ data: commentRecords });

  // Seed Likes
  console.log('🌱 Seeding Likes...');
  const likeRecords = [];
  for (let i = 0; i < 120; i++) {
    likeRecords.push({
      id: randomUUID(),
      userId: userIds[(i + 5) % userIds.length],
      postId: postIds[i % postIds.length],
    });
  }
  await prisma.like.createMany({ data: likeRecords, skipDuplicates: true });

  // Seed Bookmarks
  console.log('🌱 Seeding Bookmarks...');
  const bookmarkRecords = [];
  for (let i = 0; i < 100; i++) {
    bookmarkRecords.push({
      id: randomUUID(),
      userId: userIds[(i + 7) % userIds.length],
      postId: postIds[i % postIds.length],
    });
  }
  await prisma.bookmark.createMany({ data: bookmarkRecords, skipDuplicates: true });

  // Seed Groups
  console.log('🌱 Seeding 30 Groups...');
  const groupIds: string[] = [];
  for (let i = 0; i < 30; i++) {
    const groupId = randomUUID();
    const creatorId = userIds[i % userIds.length];
    const template = GROUP_NAMES[i % GROUP_NAMES.length];

    const memberSet = new Set<string>();
    memberSet.add(creatorId);
    memberSet.add(aliceId);
    memberSet.add(userIds[(i + 2) % userIds.length]);

    const memberCreates = Array.from(memberSet).map((uId, idx) => ({
      id: randomUUID(),
      userId: uId,
      role: uId === creatorId ? GroupRole.ADMIN : GroupRole.MEMBER,
    }));

    const group = await prisma.group.create({
      data: {
        id: groupId,
        name: `${template.name} #${i + 1}`,
        description: template.desc,
        groupAvatar: COVER_IMAGES[i % COVER_IMAGES.length],
        creatorId,
        members: {
          create: memberCreates,
        },
      },
    });
    groupIds.push(group.id);
  }
  console.log(`✅ Seeded ${groupIds.length} groups.`);

  // Seed Events
  console.log('🌱 Seeding 30 Events...');
  const eventCategories = [
    EventCategory.TECHNOLOGY,
    EventCategory.EDUCATION,
    EventCategory.BUSINESS,
    EventCategory.MUSIC,
    EventCategory.OTHER,
  ];

  for (let i = 0; i < 30; i++) {
    const eventId = randomUUID();
    const creatorId = userIds[i % userIds.length];
    const template = EVENT_NAMES[i % EVENT_NAMES.length];
    const address = ADDRESSES[i % ADDRESSES.length];

    const attendeeSet = new Set<string>();
    attendeeSet.add(creatorId);
    attendeeSet.add(aliceId);
    attendeeSet.add(userIds[(i + 4) % userIds.length]);

    const attendeeCreates = Array.from(attendeeSet).map((uId) => ({
      id: randomUUID(),
      userId: uId,
      role: uId === creatorId ? AttendeeRole.ADMIN : AttendeeRole.ATTENDEE,
      status: AttendeeStatus.ENROLL,
    }));

    await prisma.event.create({
      data: {
        id: eventId,
        name: `${template.name} #${i + 1}`,
        description: template.desc,
        eventDate: new Date(2026, (i % 12), (i % 28) + 1),
        address,
        category: eventCategories[i % eventCategories.length],
        eventAvatar: COVER_IMAGES[(i + 1) % COVER_IMAGES.length],
        creatorId,
        attendees: {
          create: attendeeCreates,
        },
      },
    });
  }
  console.log('✅ Seeded events.');

  // Seed Notifications
  console.log('🌱 Seeding Notifications...');
  const notifTypes = [
    NotificationType.LIKE,
    NotificationType.COMMENT,
    NotificationType.FOLLOW,
    NotificationType.BOOKMARK,
  ];
  const notifRecords = [];
  for (let i = 0; i < 100; i++) {
    const sender = userObjects[(i + 2) % userObjects.length];
    const receiverId = i % 2 === 0 ? aliceId : userIds[(i + 5) % userIds.length];
    const type = notifTypes[i % notifTypes.length];
    
    notifRecords.push({
      id: randomUUID(),
      content: `${sender.nickName} interacted with your content (${type.toLowerCase()}).`,
      type,
      senderId: sender.id,
      receiverId,
      isRead: i % 3 === 0,
    });
  }
  await prisma.notification.createMany({ data: notifRecords });
  console.log('✅ Seeded notifications.');

  // Seed Chat Rooms & Messages
  console.log('🌱 Seeding Chat Rooms & Chat Messages...');
  for (let i = 0; i < 30; i++) {
    const senderId = userIds[i % userIds.length];
    let receiverId = userIds[(i + 3) % userIds.length];
    if (senderId === receiverId) {
      receiverId = userIds[(i + 5) % userIds.length];
    }

    const participantSet = new Set<string>();
    participantSet.add(senderId);
    participantSet.add(receiverId);

    const participantCreates = Array.from(participantSet).map((uId) => ({
      id: randomUUID(),
      userId: uId,
    }));

    await prisma.chatRoom.create({
      data: {
        id: randomUUID(),
        type: 'DIRECT',
        name: `Chat with ${userObjects[(i + 3) % userObjects.length].nickName}`,
        creatorId: senderId,
        participants: {
          create: participantCreates,
        },
        messages: {
          create: [
            {
              id: randomUUID(),
              content: `Hey! Are you joining the tech workshop tomorrow?`,
              type: 'DIRECT',
              senderId,
              receiverId,
            },
            {
              id: randomUUID(),
              content: `Yes! Looking forward to it. See you there! 🚀`,
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

  console.log('\n🎉 ALL TABLES SEEDED SUCCESSFULLY WITH PURE UUIDs & REAL HUMAN INFO!');
  console.log('Alice Login Creds: username = alice@example.com | password = password');
  console.log('Alice UUID:', aliceId);
}

seed()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
