# Multi-stage build for NestJS application

# Stage 1: Build the application
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies required for native modules and FFmpeg
RUN apk add --no-cache python3 make g++ ffmpeg

RUN npm install -g @nestjs/cli

# Copy package files
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci && npm cache clean --force

# Copy application source
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production image
FROM node:22-alpine AS production

# Set working directory
WORKDIR /app

# Install FFmpeg for media processing
RUN apk add --no-cache ffmpeg

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy package files
COPY package.json package-lock.json* ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copy data directory if exists (for NeDB or local storage)
COPY --chown=nestjs:nodejs ./data ./data

# Switch to non-root user
USER nestjs

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/main.js"]
