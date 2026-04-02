# Multi-stage build for Next.js Nexus Dashboard
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
COPY --from=deps /app/node_modules ./node_modules
# COPY . . (moved down to after installs if needed, but let's keep it simple)
COPY . .
# Add external dependency
COPY ./automations /app/automations

# Disable telemetry during the build
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm install --no-audit --no-fund --legacy-peer-deps && \
    npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/01_Areas/Codebases/ailcc/dashboard/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/01_Areas/Codebases/ailcc/dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/01_Areas/Codebases/ailcc/dashboard/.next/static ./01_Areas/Codebases/ailcc/dashboard/.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "01_Areas/Codebases/ailcc/dashboard/server.js"]
