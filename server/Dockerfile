# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:20-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S taskflow -u 1001
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=taskflow:nodejs . .
RUN mkdir -p uploads logs && chown -R taskflow:nodejs uploads logs
USER taskflow
EXPOSE 5000
CMD ["node", "server.js"]
