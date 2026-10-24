# syntax=docker/dockerfile:1

# --- STAGE 1: Builder ---
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependency manifest
COPY package.json ./

# Install all dependencies (including devDependencies required for Vite build)
RUN npm install --legacy-peer-deps

# Copy configuration and source files
COPY tsconfig.json vite.config.ts index.html ./
COPY src/ ./src/
COPY server.ts ./

# Compile frontend assets to dist/
RUN npm run build

# --- STAGE 2: Production Runner ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install tsx globally and production dependencies locally
COPY package.json ./
RUN npm install --omit=dev --legacy-peer-deps && npm install -g tsx

# Copy built static frontend
COPY --from=builder /app/dist ./dist

# Copy backend server script and backend-consumed source modules
COPY --from=builder /app/server.ts ./
COPY --from=builder /app/src ./src

# Set proper ownership and drop root privileges
RUN chown -R node:node /app
USER node

EXPOSE 3000

# Healthcheck pinging the SQLite WASM binary endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/api/sql-wasm.wasm || exit 1

CMD ["tsx", "server.ts"]
