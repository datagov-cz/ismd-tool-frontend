### Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Set environment variable
ARG NODE_ENV=production

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# Copy the source code, excluding some things unnecessary for the build, see .dockerignore
COPY . .

# Build arguments for basePath
ARG NEXT_PUBLIC_BASE_PATH=/popisujeme
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_PUBLIC_BASE_PATH=${NEXT_PUBLIC_BASE_PATH}

# Build the application
RUN npm run build

### Runtime stage
FROM node:20-alpine AS runtime
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

# Copy the built application
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./
COPY --from=build /app/messages ./messages

EXPOSE 3000

CMD ["npm", "start"]
