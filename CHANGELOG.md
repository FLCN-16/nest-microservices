# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-11

### Added
- **Global Exception Filter** — `AllExceptionsFilter` handles HTTP and RPC contexts with structured JSON error responses (`packages/common`)
- **Logging Interceptor** — `LoggingInterceptor` logs `METHOD URL STATUS - latency` for all HTTP requests (`packages/common`)
- **Health Check Endpoints** — HTTP `GET /health` and TCP `{ cmd: 'health' }` handlers across all 5 services
- **Environment Validation** — Joi schemas in all service modules; fail-fast on missing required vars (`JWT_SECRET`, `GATEWAY_SECRET`)
- **Secret Generation Script** — `scripts/generate-secrets.sh` generates cryptographic secrets via `openssl rand`
- **CI/CD Test Step** — `pnpm test --if-present` step in GitHub Actions with required env vars and Turbo cache support
- **Comprehensive `.env.example`** — 65-line reference covering all services

### Changed
- **ConfigService Refactor** — All 5 `main.ts` files now use NestJS `ConfigService` instead of direct `process.env` access
- **CORS Hardening** — All services read `ALLOWED_ORIGINS` from env (default: `http://localhost:3000`) instead of allowing all origins
- **Package Descriptions** — Renamed from "BeReal Clone" to "The Falcon" in `@the-falcon/common` and `@the-falcon/types`

### Fixed
- **`synchronize: true` in production** — TypeORM `synchronize` now disabled when `NODE_ENV === 'production'` (auth, feed, notifications)
- **DB Port Defaults** — Changed from non-standard `5433` to standard `5432` in auth and feed modules
- **ARCHITECTURE.md** — Notifications service port corrected from `- / -` to `4004 / -`
- **README Environment Variables** — Replaced incorrect `DATABASE_URL` references with actual `DB_*`, `FEED_DB_*`, and `NOTIFICATIONS_DB_*` variables in auth, feed, and notifications READMEs

### Security
- **@apollo/server** — Upgraded from 5.2.0 → 5.4.0 (fixes HIGH severity vulnerability in feed and media services)
- **@nestjs/\*** — Upgraded core packages from 11.1.12 → 11.1.13
- **@nestjs/graphql** — Upgraded from 13.2.3 → 13.2.4
- **axios** — Upgraded from 1.13.2 → 1.13.4
- **pg** — Upgraded from 8.17.2 → 8.18.0
- **@types/node** — Upgraded from 22.15.29 → 25.2.1
- **prettier** — Upgraded from 3.5.3 → 3.8.1
- **typescript-eslint** — Upgraded from 8.33.1 → 8.54.0
- **turbo** — Upgraded from 2.5.4 → 2.8.3

## [0.0.1] - 2026-01-22

### Added
- Initial project scaffold with 5 NestJS microservices (auth, feed, gateway, media, notifications)
- Monorepo setup with pnpm workspaces and Turborepo
- Shared packages: `@the-falcon/common`, `@the-falcon/types`, `@the-falcon/notifications`
- Consul service discovery integration
- TCP inter-service communication
- GraphQL support in feed and media services
- JWT authentication with CASL-based RBAC
- RabbitMQ integration for notifications
- Docker Compose local development setup
