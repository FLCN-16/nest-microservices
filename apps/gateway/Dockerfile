FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile

# Build workspace dependencies
RUN pnpm --filter @the-falcon/common build
# Build the application
RUN pnpm --filter gateway build

# Create a self-contained deployment bundle
RUN pnpm --filter gateway --prod deploy /prod/gateway

FROM base AS runner
WORKDIR /app

# Copy the deployment bundle
COPY --from=builder /prod/gateway .

# Set production environment
ENV NODE_ENV=production
# Expose ports (HTTP)
EXPOSE 4000

CMD ["node", "dist/main"]
