# Connected Social Media Platform

👉 **Live Demo:** [Connected Social Media Platform](https://connected-social-media.online)

A full-stack social media platform with intelligent content evaluation, real-time messaging, and comprehensive user interaction features. Built with modern web technologies including React, NestJS, GraphQL, WebSocket, and AI-powered sentiment analysis.

## 🚀 Overview

The platform leverages Natural Language Processing to analyze user content for sentiment and appropriateness, creating a safer and more positive social media environment. It features real-time communication, group management, events, and comprehensive admin capabilities.

## 🏗️ Architecture

### Frontend (FE-Social-Media)
- **React 18.3.1** with TypeScript
- **Vite** for fast development and building
- **Ant Design** for UI components
- **Zustand** for state management
- **TanStack Query** for data fetching and caching
- **Socket.IO Client** for real-time communication
- **Apollo Client** for GraphQL queries and subscriptions

### Backend (BE-Social-Media)
- **NestJS** framework with modular architecture
- **Prisma ORM** with MySQL database
- **GraphQL** with Apollo Server for API
- **Redis** for caching and session management
- **Socket.IO** for real-time messaging
- **Cloudinary** for media storage
- **Nodemailer** for transactional emails
- **Jest** for comprehensive testing

## 🧠 Key Features

### Intelligent Content Evaluation
- **NLP-powered sentiment analysis** for posts and comments
- **Real-time content moderation** with appropriate/inappropriate detection
- **Sentiment indicators** (green for positive, red for negative, orange for neutral)
- **Automated mood detection** and insights

### Real-time Communication
- **WebSocket messaging** with Socket.IO
- **Live notifications** via GraphQL subscriptions
- **User presence tracking** and online status
- **Private messaging** system

### Social Features
- **User profiles** with follower/following systems
- **Groups** with member management and content controls
- **Events** with notifications and reminders
- **Rich media support** (images, videos via Cloudinary)

### Admin Dashboard
- **User management** and activity monitoring
- **Group oversight** and content moderation
- **Event management** and analytics
- **System metrics** and insights

## 🛠️ Tech Stack

### Frontend Technologies
- React 18.3.1 + TypeScript
- Vite (build tool)
- Ant Design (UI components)
- Zustand (state management)
- TanStack Query (data fetching)
- Socket.IO Client (real-time)
- Apollo Client (GraphQL)
- Axios (HTTP client)

### Backend Technologies
- NestJS (Node.js framework)
- Prisma + MySQL (database)
- GraphQL + Apollo Server
- Redis (caching/sessions)
- Socket.IO (real-time)
- Cloudinary (media storage)
- Nodemailer (emails)
- Jest (testing)

### DevOps & Deployment
- Docker (containerization)
- GitHub Actions (CI/CD)
- Nginx (reverse proxy)
- Cloudflare (SSL/CDN)

## 🚀 Quick Start

### Prerequisites
- Node.js (v20)
- PNPM package manager
- MySQL database
- Redis (optional, for full features)

### Installation

```bash
# Clone the repository
git clone https://github.com/Long182k/Social-Media-Platform.git
cd Social-Media-Platform

# Install backend dependencies
cd BE-Social-Media
pnpm install

# Install frontend dependencies
cd ../FE-Social-Media
pnpm install

# Setup database (from backend directory)
cd ../BE-Social-Media
npx prisma generate
npx prisma migrate dev

# Start development servers
# Backend (port 3001)
cd BE-Social-Media
pnpm start:dev

# Frontend (port 3000)
cd FE-Social-Media
pnpm dev
```

## 📁 Project Structure

```
Social-Media-Platform/
├── BE-Social-Media/          # NestJS Backend
│   ├── src/
│   │   ├── auth/            # Authentication module
│   │   ├── posts/           # Content management
│   │   ├── nlp/             # Sentiment analysis
│   │   ├── websocket/       # Real-time messaging
│   │   ├── graphql/         # GraphQL API
│   │   ├── cloudinary/      # Media storage
│   │   ├── mail/            # Email services
│   │   ├── redis/           # Caching layer
│   │   └── admin/           # Admin features
│   ├── prisma/              # Database schema
│   └── test/                # Test suites
├── FE-Social-Media/         # React Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── store/           # Zustand state management
│   │   ├── services/        # API services
│   │   └── utils/           # Helper functions
│   └── public/              # Static assets
├── .gitignore               # Combined ignore rules
└── README.md               # This file
```

## 🔐 Security Features

- **JWT authentication** with refresh token rotation
- **Password hashing** with bcrypt
- **Input validation** and sanitization
- **Rate limiting** for API protection
- **Secure file storage** via Cloudinary
- **Environment-based configuration**

## 🧪 Testing

- **Frontend**: Component testing with React Testing Library
- **Backend**: Unit and integration tests with Jest
- **E2E Testing**: NestJS testing utilities
- **CI/CD**: Automated testing via GitHub Actions

## 📊 Content Evaluation Flow

1. User creates content (post/comment)
2. Content is sent to NLP service
3. Sentiment analysis generates scores
4. Content is flagged based on analysis
5. Results stored with content metadata
6. Real-time updates sent to frontend

## 🚀 Deployment

The application is deployed using:
- **Docker containers** for consistent environments
- **GitHub Actions** for automated CI/CD
- **Nginx** as reverse proxy
- **Cloudflare** for SSL and CDN
- **VPS hosting** for production deployment

## 🤝 Contributing

This project is open source and welcomes contributions. Feel free to:
- Submit issues and bug reports
- Request new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is [MIT licensed](LICENSE).

## 📞 Contact

✨ **LinkedIn** - [Long182k](https://www.linkedin.com/in/drakenguyen1820/)  
✨ **GitHub** - [Long182k](https://github.com/Long182k)  
✨ **Portfolio** - [Long182k](https://drake-porfolio.vercel.app/)
