# ── Build ────────────────────────────────────────────────────────────────────
FROM oven/bun:1.1-alpine AS builder

WORKDIR /app
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun build src/index.ts --outdir dist --target bun

# ── Production ───────────────────────────────────────────────────────────────
FROM oven/bun:1.1-alpine AS production

RUN apk add --no-cache curl

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

RUN mkdir -p logs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["bun", "dist/index.js"]
