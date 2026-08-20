# Build stage
FROM node:18-slim AS builder

# Install openssl which Prisma needs for its query engine
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (dev + prod) ONCE
RUN npm ci

# Copy source code and build
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-slim

# Install openssl in the production stage as well
RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

# Copy only what we need from the builder stage
COPY package*.json ./
COPY prisma ./prisma/
COPY --from=builder /app/dist ./dist

# Instead of running npm ci again, copy the entire node_modules folder from builder
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "run", "start"]
