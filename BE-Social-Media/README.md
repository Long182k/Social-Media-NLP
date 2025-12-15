<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>
  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
</p>

# BE-Social-Media

Backend service for the Social Media platform built with NestJS, Prisma, GraphQL, WebSocket, Redis, Cloudinary, Jest (for testing), and a Mail service.  
CI/CD implemented using GitHub Actions and Docker for VPS deployment.

👉 **Live Demo:** [Connected Social Media Platform](https://connected-social-media.online)

---

## 🧠 Tech Overview

### Prisma & MySQL

<a href="https://www.mysql.com/" target="_blank"><img src="https://www.pngplay.com/wp-content/uploads/7/Mysql-Logo-PNG-Photos.png" width="100" alt="MySQL Logo" /></a> <a href="https://www.prisma.com/" target="_blank"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFs7mx6b1e4Y2farjg6wO8s5FulJb8RNcpaQ&s" width="100" alt="Prisma Logo" /></a>

- Prisma ORM for database schema management and migrations
- MySQL database for production-grade data storage

---

### Redis

<a href="https://redis.io/" target="_blank"><img src="https://cdn.worldvectorlogo.com/logos/redis.svg" width="100" alt="Redis Logo" /></a>

- Blacklist and revoke refresh tokens to enforce logout and session invalidation
- Redlock-based distributed locks for concurrency control on critical operations

---

### GraphQL - Apollo

<a href="https://graphql.org/" target="_blank"><img src="https://upload.wikimedia.org/wikipedia/commons/1/17/GraphQL_Logo.svg" width="100" alt="GraphQL Logo" /></a>

- Subscriptions over Apollo WebSocket for real-time notifications
- `graphql-ws` protocol with Apollo Client integration
- Nginx upgrade handling and subprotocol forwarding for stable connections

---

### Socket.IO

<a href="https://socket.io/" target="_blank"><img src="https://d13vhgz95ul9hy.cloudfront.net/blog/wp-content/uploads/2018/04/socket.io_.png" width="100" alt="Socket.IO Logo" /></a>

- Real-time messaging and presence tracking
- Namespaces and rooms for scalable channels
- Sticky sessions support through proxy configuration

---

### Cloudinary

<a href="https://cloudinary.com/" target="_blank"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Cloudinary_logo.svg/2560px-Cloudinary_logo.svg.png" width="140" alt="Cloudinary Logo" /></a>

- Image/video upload and delivery
- Automatic transformations for thumbnails and optimized media
- Secure storage with API key/secret

---

### Nodemailer

<a href="https://nodemailer.com/about/" target="_blank"><img src="https://raw.githubusercontent.com/nodemailer/nodemailer/master/assets/nm_logo_200x136.png" width="120" alt="Nodemailer Logo" /></a>

- Transactional emails (verification, password reset)
- Nodemailer integration with SMTP provider
- Handlebars templates for consistent layouts

---

### Jest

<a href="https://jestjs.io/" target="_blank"><img src="https://www.vectorlogo.zone/logos/jestjsio/jestjsio-icon.svg" width="80" alt="Jest Logo" /></a>

- Unit and integration tests for services/controllers by [Jest](https://jestjs.io/)
- Coverage reporting and watch mode for TDD workflows
- E2E tests with Nest Testing utilities

---

### Deployment: CI/CD (GitHub Action) - Docker - Cloudflare - Nginx

<a href="https://github.com/features/actions" target="_blank"><img src="https://avatars.githubusercontent.com/u/44036562?s=200&v=4" width="90" alt="GitHub Actions Logo" /></a>

- Build, test, and deploy pipeline for CI/CD by [GitHub Actions](https://github.com/features/actions)
- Docker build/push and rollout to VPS by [Docker](https://docs.docker.com/compose/)
- Nginx reverse proxy for load balancing and SSL termination by [NGINX](https://www.nginx.com/)
- Activate SSL via Cloudflare for secure connections

## Getting Started Locally

```bash
# Generate Prisma client
npx prisma generate

# Install dependencies
pnpm install

# Run development
pnpm start:dev
```

## Key Features

### Content Evaluation with NLP

The platform implements advanced Natural Language Processing to:

- Analyze sentiment in user posts and comments
- Detect potential harmful or inappropriate content
- Provide content mood insights
- Help maintain a positive community environment

### Real-time Communication

- WebSocket integration for instant messaging
- Live notifications for user interactions by GraphQL subscriptions

### Security

- JWT-based authentication with refresh token rotation
- Password hashing with argo2
- Input validation and sanitization
- Rate limiting to prevent abuse

### Media Management

- Cloudinary integration for media file handling
- Support for images and videos
- Secure file storage and delivery

### Mail Features

- Transactional emails (verification, password reset)
- Nodemailer integration with SMTP provider
- Handlebars templates for consistent layouts

## Getting Started

### Prerequisites

- Node.js (v20)
- PNPM package manager (You can use NPM OR Yarn if you want)
- MySQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/Long182k/BE-SOCIAL-MEDIA.git
cd BE-Social-Media

# Install dependencies
pnpm install

# Start the development server
pnpm start:dev
```

## Architecture

The application is built using NestJS framework with a modular architecture that could develop and scale independently.

### Core Modules

1. **NLP Module**

   - Integration with a Sentiment Analysis model for content evaluation
   - Content sentiment analysis
   - Text classification
   - Mood detection
   - Content moderation

2. **Authentication Module**

   - JWT-based authentication
   - User session management
   - Security middleware

3. **Posts Module**

   - Content creation and management
   - Automatic sentiment analysis
   - Media attachment handling

4. **WebSocket Module**

   - Real-time messaging
   - User presence tracking

5. **GraphQL Module**

   - API for content creation, retrieval, and updates
   - Real-time event subscriptions
   - Batch query support

6. **Cloudinary Module**

   - Integration with Cloudinary for media storage
   - Secure file uploads and management

7. **Mail Module**

   - Transactional emails (verification, password reset)
   - Nodemailer integration with SMTP provider
   - Handlebars templates for consistent layouts

8. **Redis Module**

   - Caching layer for frequently accessed data
   - Improved performance and scalability
   - Serving for revoke refresh token, redlock and rate limiting features.

9. **Admin Module**
   - Analytics dashboard
   - User, group, event management

## Content Evaluation Flow

1. User creates/updates content through posts
2. NLP service analyzes the content
3. Sentiment and appropriateness scores are generated
4. Content is stored with analysis results
5. Sentiment flags are raised with green (positive), red (negative), or orange (neutral)

## Support

This project is open source and welcomes contributions. Feel free to submit issues and enhancement requests.

## License

This project is [MIT licensed](LICENSE).

## Stay in touch

✨ Linkedin - [Long182k](https://www.linkedin.com/in/drakenguyen1820/)
✨ Github - [Long182k](https://github.com/Long182k)
✨ Porfolio - [Long182k](https://drake-porfolio.vercel.app/)
