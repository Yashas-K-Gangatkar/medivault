# MEDIVAULT — Production Dockerfile
# Multi-stage build for smaller final image.

# ---- Stage 1: Build ----
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and install deps
COPY package.json bun.lock* package-lock.json* yarn.lock* ./
RUN npm install --frozen-lockfile 2>/dev/null || npm install

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source and build
COPY . .
RUN npm run build

# ---- Stage 2: Production ----
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=file:/app/db/medivault.db
ENV NEXT_TELEMETRY_DISABLED=1

# Install only production deps
COPY package.json bun.lock* package-lock.json* yarn.lock* ./
RUN npm install --omit=dev --frozen-lockfile 2>/dev/null || npm install --omit=dev

# Copy build output + prisma + public + scripts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Ensure db directory exists and is writable
RUN mkdir -p /app/db

# Expose port
EXPOSE 3000

# Healthcheck — hit the homepage
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Start Next.js in production mode
CMD ["npm", "start"]
