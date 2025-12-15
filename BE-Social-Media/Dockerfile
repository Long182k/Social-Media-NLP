# ===== Stage 1: Build =====
FROM node:20-alpine AS builder
WORKDIR /app

RUN echo "Stage 1: Build"
# Install OpenSSL and other required dependencies for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat

# Add CA certificates to fix TLS to npm registry
RUN apk add --no-cache ca-certificates && update-ca-certificates

# Allow switching npm registry via build ARG
ARG NPM_REGISTRY=https://registry.npmjs.org/
RUN npm install -g pnpm && pnpm config set registry $NPM_REGISTRY

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Generate Prisma client for build (so NestJS type-checks work)
RUN npx prisma generate

# Build NestJS app
RUN pnpm run build


# ===== Stage 2: Production =====
FROM node:20-alpine
WORKDIR /app
RUN echo "Stage 2: Production"
# Install OpenSSL for Prisma in production
RUN apk add --no-cache openssl libc6-compat
# Ensure CA certificates present for any runtime HTTPS needs
RUN apk add --no-cache ca-certificates && update-ca-certificates

ARG NPM_REGISTRY=https://registry.npmjs.org/
RUN npm install -g pnpm && pnpm config set registry $NPM_REGISTRY

# Only install production dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile && pnpm prune --prod

# Copy compiled files and Prisma stuff
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8080
CMD ["pnpm", "run", "start:prod"]