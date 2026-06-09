# ─── Base stage ───────────────────────────────────────────────
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies first (leverages Docker layer caching)
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# ─── Build stage ─────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Build Next.js standalone output
RUN bun run build

# ─── Production stage ───────────────────────────────────────
FROM oven/bun:1 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static .next/static/
COPY --from=builder /app/public ./public/

# Copy Prisma schema for migrations
COPY --from=builder /app/prisma ./prisma/

# Copy generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma/
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma/

# Copy sharp + native bindings (for image resizing)
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp
COPY --from=builder /app/node_modules/@img ./node_modules/@img

# Create db directory
RUN mkdir -p /app/db

EXPOSE 3000

# Health check (uses bun fetch instead of curl to avoid extra packages)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["bun", "server.js"]
