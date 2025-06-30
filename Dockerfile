FROM oven/bun:1.0.29 as base
WORKDIR /app

# Install dependencies
FROM base as deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Build the app
FROM base as builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production image
FROM base as runner
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["bun", "server.js"] 