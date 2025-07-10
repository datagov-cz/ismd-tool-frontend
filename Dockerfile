### Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Set environment variable
ARG NODE_ENV=production

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the source code, excluding some things unnecessary for the build, see .dockerignore
COPY . .

# Build the application
ENV NODE_ENV=${NODE_ENV}
RUN npm run build

### Runtime stage
FROM node:18-alpine AS runtime
WORKDIR /app

# Set environment variables
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Default backend URL for Docker environments
# Can be overridden at runtime with docker run -e NEXT_PUBLIC_BE_URL=...
# (Works at runtime due to publicRuntimeConfig in next.config.mjs)
ENV NEXT_PUBLIC_BE_URL=http://host.docker.internal:8080

# Copy package files
COPY --from=build /app/package.json ./
COPY --from=build /app/package-lock.json ./

# Install dependencies, clean, only production ready
RUN npm ci --omit=dev

# Copy the built application
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.mjs ./
COPY --from=build /app/messages ./messages

EXPOSE 3000

CMD ["npm", "start"]
