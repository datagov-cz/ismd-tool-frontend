### Build stage
FROM node:24-alpine AS build
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Copy the source code, excluding some things unnecessary for the build, see .dockerignore
COPY . .

# Build arguments for basePath
ARG NEXT_PUBLIC_BASE_PATH=/popisujeme
# `next build` MUST run in production. Building with NODE_ENV=development
# produces a broken static export of the error pages and fails with the
# misleading "<Html> should not be imported outside of pages/_document" error.
# This is intentionally NOT driven by the NODE_ENV build arg (which may be
# `development` when composed) — the build is always production.
ENV NODE_ENV=production
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}

# Build the application
RUN npm run build

### Runtime stage
FROM node:24-alpine AS runtime
WORKDIR /app

# Set environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Backend URL for proxying API requests (server-side only, safe to set at runtime)
ENV BE_URL=http://host.docker.internal:8081/popisujeme

# Copy package files
COPY --from=build /app/package.json ./
COPY --from=build /app/package-lock.json ./

# Install dependencies, clean, only production ready
RUN npm ci --omit=dev --ignore-scripts

# Copy the built application. Everything stays root-owned and read-only except
# .next, which Next.js writes to at runtime (.next/cache, image optimisation).
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./
COPY --from=build /app/messages ./messages
# Hint and blog API routes read these markdown/MDX files from disk at runtime
# via process.cwd()/src/app/{hints,blogs}, so the source content must ship in
# the image.
COPY --from=build /app/src/app/hints ./src/app/hints
COPY --from=build /app/src/app/blogs ./src/app/blogs

# Run as the unprivileged `node` user (uid 1000) shipped with the base image
USER node

EXPOSE 3000

CMD ["npm", "start"]
