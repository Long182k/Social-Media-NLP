import { NotificationType } from '@prisma/client';

export const MOCK_USERS = Array.from({ length: 50 }).map((_, index) => {
  const id = index === 0 ? 'demo-alice-id-12345' : `mock-user-id-${index + 1}`;
  return {
    id,
    userName: index === 0 ? 'alice@example.com' : `user${index + 1}@example.com`,
    nickName: index === 0 ? 'Alice Johnson' : `User ${index + 1}`,
    email: index === 0 ? 'alice@example.com' : `user${index + 1}@example.com`,
    role: 'USER',
    avatarUrl: `https://picsum.photos/seed/user${index + 1}/200/200`,
    coverPageUrl: `https://picsum.photos/seed/cover${index + 1}/800/300`,
    bio: `Fullstack AI Developer & Social Media Enthusiast #${index + 1}`,
    dateOfBirth: new Date('1995-05-15'),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
});

export const MOCK_POSTS = Array.from({ length: 40 }).map((_, index) => {
  const user = MOCK_USERS[index % MOCK_USERS.length];
  const postContents = [
    'Exploring deep learning and NLP architectures for modern social apps! 🚀',
    'Next.js 15 App Router and React Server Components are game changers for web apps.',
    'Just deployed microservices backend to Vercel with zero downtime! ✨',
    'What is your favorite CSS framework in 2026? Tailwind, Vanilla, or Styled Components?',
    'Building responsive web designs with smooth animations and sleek dark mode.',
    'GraphQL vs REST APIs: Which one do you prefer for enterprise microservices?',
    'Understanding TypeScript generics and advanced utility types in production.',
  ];

  return {
    id: `mock-post-id-${index + 1}`,
    content: `${postContents[index % postContents.length]} (#Post${index + 1})`,
    userId: user.id,
    user,
    sentiment: index % 2 === 0 ? 'POSITIVE' : 'NEUTRAL',
    createdAt: new Date(Date.now() - index * 3600000),
    updatedAt: new Date(Date.now() - index * 3600000),
    attachments: index % 3 === 0 ? [
      {
        id: `mock-att-${index + 1}`,
        type: 'image',
        url: `https://picsum.photos/seed/post${index + 1}/600/400`,
        postId: `mock-post-id-${index + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ] : [],
    comments: [
      {
        id: `mock-comment-${index + 1}`,
        content: 'Awesome post! Totally agree with this insight.',
        userId: MOCK_USERS[(index + 1) % MOCK_USERS.length].id,
        user: MOCK_USERS[(index + 1) % MOCK_USERS.length],
        postId: `mock-post-id-${index + 1}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],
    _count: {
      likes: (index * 7) % 50 + 5,
      comments: (index * 3) % 20 + 1,
      bookmarks: (index * 2) % 15,
    },
  };
});

export const MOCK_GROUPS = Array.from({ length: 30 }).map((_, index) => {
  const categories = ['AI & Machine Learning', 'Web Development', 'Cloud Computing', 'UI/UX Design', 'Data Science'];
  return {
    id: `mock-group-id-${index + 1}`,
    name: `${categories[index % categories.length]} Hub #${index + 1}`,
    description: `Official community hub for ${categories[index % categories.length]} discussions and collaboration.`,
    groupAvatar: `https://picsum.photos/seed/group${index + 1}/300/300`,
    creatorId: MOCK_USERS[index % MOCK_USERS.length].id,
    creator: MOCK_USERS[index % MOCK_USERS.length],
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      members: (index * 11) % 100 + 10,
    },
  };
});

export const MOCK_EVENTS = Array.from({ length: 30 }).map((_, index) => {
  const categories = ['TECHNOLOGY', 'EDUCATION', 'BUSINESS', 'MUSIC', 'OTHER'];
  return {
    id: `mock-event-id-${index + 1}`,
    name: `Global Tech Conference & Summit #${index + 1}`,
    description: `Join industry keynotes, live code demos, and developer workshops at Summit #${index + 1}.`,
    eventDate: new Date(Date.now() + (index + 1) * 86400000),
    address: `Tech Convention Center, Hall ${index % 10 + 1}`,
    category: categories[index % categories.length],
    eventAvatar: `https://picsum.photos/seed/event${index + 1}/400/200`,
    creatorId: MOCK_USERS[index % MOCK_USERS.length].id,
    creator: MOCK_USERS[index % MOCK_USERS.length],
    createdAt: new Date(),
    updatedAt: new Date(),
    _count: {
      attendees: (index * 13) % 150 + 15,
    },
  };
});

export const MOCK_NOTIFICATIONS: any[] = Array.from({ length: 30 }).map((_, index) => {
  const types = [
    NotificationType.LIKE,
    NotificationType.COMMENT,
    NotificationType.FOLLOW,
    NotificationType.BOOKMARK,
  ];
  return {
    id: `mock-notif-id-${index + 1}`,
    content: `${MOCK_USERS[(index + 1) % MOCK_USERS.length].nickName} liked your post #${index + 1}`,
    type: types[index % types.length],
    senderId: MOCK_USERS[(index + 1) % MOCK_USERS.length].id,
    sender: MOCK_USERS[(index + 1) % MOCK_USERS.length],
    receiverId: 'demo-alice-id-12345',
    isRead: index % 2 === 0,
    createdAt: new Date(Date.now() - index * 1800000),
    updatedAt: new Date(Date.now() - index * 1800000),
  };
});
