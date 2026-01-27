# Backend Development Guidelines

This document is the **authoritative source** for development standards, architecture patterns, and operational procedures for the BeReal Clone Monorepo.

---

## 🏗️ 1. Architecture & Patterns

We follow a strict **Microservices Architecture** using **NestJS**.

### 1.1 Module Structure
Each service is composed of modules. The `AppModule` is the root, importing feature modules.
- **Controller**: Handles incoming requests (HTTP or RPC), validating input (DTOs), and returning responses. **No business logic here.**
- **Service**: Contains **all** business logic. calls Repositories or other Services.
- **Repository**: (Optional) Direct database access. Use `TypeOrmModule.forFeature([Entity])` to inject repositories.
- **Resolver**: If using GraphQL, handles the graph queries.

### 1.2 DTOs & Validation
- **All** inputs must have a Data Transfer Object (DTO) defined in classes.
- Use `class-validator` decorators (`@IsString()`, `@IsUUID()`).
- Use `class-transformer` if transformation is needed.
- Shared DTOs between services/clients should reside in `packages/types`.

### 1.3 Error Handling
- Use standard NestJS Exceptions (`NotFoundException`, `BadRequestException`) for HTTP.
- For **Microservices (TCP)**, use `RpcException` to propagate errors correctly to the Gateway.
- Use the global `AllExceptionsFilter` (provided by `@the-falcon/common`) to standardize error responses.

---

## 📦 2. Monorepo Management (pnpm + Turbo)

We use **pnpm workspaces** and **TurboRepo** for build orchestration.

### 2.1 Dependency Management
**NEVER** run `npm install` inside a package.
```bash
# Add dependency to specific app
pnpm add @nestjs/axios --filter auth

# Add dev dependency to root
pnpm add -D husky -w
```
- **Internal Packages**: Use the workspace protocol: `"@the-falcon/common": "workspace:*"`

### 2.2 Shared Code
- **`@the-falcon/common`**: Interceptors, Guards, Utilities, Base Classes.
- **`@the-falcon/types`**: Interfaces, DTOs, Enums.
- **`@the-falcon/config`**: Shared configuration logic.

**Rule**: If logic is used by 2+ services, move it to `@the-falcon/common`.

---

## 📡 3. Communication Patterns

### 3.1 External (Gateway)
- Clients (Mobile/Admin) **only** talk to the **Gateway** (Port 4000).
- Gateway routes requests via **Proxy** or **Aggregate** logic.

### 3.2 Internal Synchronous (TCP)
- Use **NestJS TCP Microservices** for request/response flows between services.
- **Pattern**: `cmd` pattern for routing.
- **Example**: Gateway asks Auth Service to validate a token.

### 3.3 Internal Asynchronous (RabbitMQ)
- Use **RabbitMQ** for event-driven architecture ("Fire and Forget").
- **Pattern**: `emit` events.
- **Example**: Feed Service emits `post.created` -> Notification Service listens and sends push notification.

### 3.4 Service Discovery (Consul)
- All services register with Consul on startup.
- `ConsulService` (from common) handles registration.
- **Dev Mode**: Registers as `host.docker.internal` (mapped to `localhost`).
- **Prod Mode**: Registers with actual container IP.

---

## 💾 4. Data & Storage

### 4.1 Database (PostgreSQL)
- Use **TypeORM** for all relational data.
- **Entities**: Define in `src/database/entities`.
- **Naming**: Snake_case for columns (`created_at`), CamelCase for properties (`createdAt`).
- **Migrations**: Use TypeORM migrations for schema changes.

### 4.2 File Storage (Media Service)
- **Never** store files in the application container or database.
- Upload to **Media Service** via HTTP (Multipart).
- **Providers**: 
  - `s3` (Production/MinIO).
  - `local` (Simple dev fallback).

---

## ⚙️ 5. Configuration

We use **12-Factor App** principles. Configuration is stored in **Environment Variables**.

### 5.1 Env Files
- `.env.development`: Local development overrides.
- `.env.test`: Test environment.
- **Production**: Env vars injected by Kubernetes/Docker.

### 5.2 ConfigModule
- Always use `ConfigService` to access variables. **Do not use `process.env` directly in code.**
- Validate env vars using Joi validation schema in `AppModule`.

---

## 🐳 6. Deployment & Docker

### 6.1 Dockerfiles
- Located in `apps/<service>/Dockerfile`.
- Must be built from **Root Context**.
- Multi-stage builds are used to prune dev dependencies.

### 6.2 Health Checks
- All services must expose a health check.
- HTTP: `/health` (or `/api/health` for Gateway).
- TCP: Respond to `{ cmd: 'health' }`.

---

## 🧪 7. Testing

- **Unit Tests**: `*.spec.ts`. Run with `pnpm test`. Mock all dependencies.
- **E2E Tests**: Located in `test/`. Run calls against a running container/instance.
