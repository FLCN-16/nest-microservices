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
RUN pnpm --filter media build

# Create a self-contained deployment bundle
RUN pnpm --filter media --prod deploy /prod/media

FROM base AS runner
WORKDIR /app

# Copy the deployment bundle
COPY --from=builder /prod/media .

# Set production environment
ENV NODE_ENV=production
# Expose ports (TCP and HTTP)
EXPOSE 4003 5003

CMD ["node", "dist/main"]
