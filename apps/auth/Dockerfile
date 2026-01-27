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
RUN pnpm --filter auth build

# Create a self-contained deployment bundle
RUN pnpm --filter auth --prod deploy /prod/auth

FROM base AS runner
WORKDIR /app

# Copy the deployment bundle
COPY --from=builder /prod/auth .

# Set production environment
ENV NODE_ENV=production
# Expose ports (TCP and HTTP)
EXPOSE 4001 5001

CMD ["node", "dist/main"]
