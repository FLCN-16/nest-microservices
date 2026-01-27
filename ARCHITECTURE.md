# Backend Architecture

The backend is built as a **Monorepo** using **NestJS**, managed by **Turbo Repo** and **pnpm workspaces**. It follows a microservices architecture with a hybrid communication model (HTTP + TCP).

## 📂 Project Structure

```
backend/
├── apps/               # Deployable services
│   ├── gateway/        # API Gateway (HTTP Entry Point)
│   ├── auth/           # Authentication Service (TCP)
│   ├── feed/           # Feed/Social Service (TCP)
│   ├── media/          # Media Upload Service (HTTP)
│   └── notifications/  # Notification Service (TCP + RabbitMQ)
├── packages/           # Shared libraries
│   ├── common/         # Shared Guards, Interceptors, Utilities
│   ├── types/          # Shared DTOs and Interfaces
│   └── notifications/  # Shared Notification definitions
└── docker-compose.yml  # Infrastructure (DB, Redis, Consul)
```

## 🧩 Services

| Service | Port (HTTP/TCP) | DB | Responsibility |
|---------|-----------------|----|----------------|
| **Gateway** | 4000 / - | - | Proxies requests to internal services. Handles rate limiting and aggregation. |
| **Auth** | 4001 / 5001 | Postgres | User management, Authentication (JWT), Authorization (CASL). |
| **Feed** | 4002 / 5002 | Postgres | Post creation, Home feed generation, Comments, Reactions. |
| **Media** | 4003 / 5003 | S3/MinIO | Handles file uploads (Images/Videos) and strict validation. |
| **Notifications** | - / - | - | Handles dispatching notifications via RabbitMQ. |

## 🔗 Communication Patterns

### 1. Client to Gateway (HTTP)
External clients (Mobile, Admin) communicate ONLY with the **Gateway** service via REST/GraphQL.

### 2. Gateway to Services (TCP / HTTP)
- The Gateway communicates with backend services using **NestJS Microservices (TCP)** for remote procedure calls (RPC).
- Some interactions (like Media upload) might stay HTTP for streaming performance.

### 3. Inter-Service (TCP)
Services communicate with each other via TCP using the Request-Response pattern.

### 4. Async Events (RabbitMQ)
For non-blocking operations (e.g., "User posted a photo" -> "Notify friends"), services emit events to **RabbitMQ**.

## 🛠 Shared Packages

- **`@the-falcon/common`**: Contains foundational code shared across all apps.
    - `DatabaseModule`: TypeORM configuration.
    - `AuthGuard`: JWT validation logic.
    - `RmqModule`: RabbitMQ setup.
- **`@the-falcon/types`**: TypeScript interfaces shared between Backend, Admin, and Mobile (where applicable via generation).

## 🚀 Development

We use a **Hybrid** development environment:
- **Infrastructure**: Runs in Docker (Postgres, RabbitMQ, Redis, Consul).
- **Services**: Run natively on the host machine for fast feedback.
