# Nest Microservices

![CI](https://github.com/FLCN-16/nest-microservices/actions/workflows/ci.yml/badge.svg)

**Nest Microservices** is a highly scalable, robust microservices backend designed for social media applications. It follows a monolithic repository structure managed by Turbo Repo and pnpm workspaces, leveraging NestJS for efficient and modular service development.

## 🚀 Key Features

- **Hybrid Architecture**: Combines HTTP for external clients with high-performance TCP for inter-service communication.
- **Event-Driven**: Uses RabbitMQ for asynchronous task processing and notifications.
- **Scalable Infrastructure**: Containerized dependencies (PostgreSQL, Redis, Consul, MinIO) managed via Docker.
- **Service Discovery**: Automated service registration and discovery using Consul.
- **Type Safety**: Shared TypeScript types and DTOs across the entire stack.
- **Automated Database Provisioning**: Custom scripts to automatically create and manage multiple Postgres databases from a single Docker instance.
- **Monorepo Efficiency**: Uses Turbo Repo for incremental builds, caching, and task orchestration.
- **Unified Tooling**: Centralized ESLint and Prettier configurations for consistent code style.
- **Local-First Development**: Optimized for running services natively while keeping infrastructure containerized for the best debugging experience.

## 🛠 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Monorepo**: [Turbo Repo](https://turbo.build/) + [pnpm](https://pnpm.io/)
- **Database**: PostgreSQL (with TypeORM)
- **Caching**: Redis
- **Message Broker**: RabbitMQ
- **Service Discovery**: Consul
- **Object Storage**: MinIO (S3 compatible)

## 📂 Project Structure

```bash
.
├── apps/               # Deployable microservices
│   ├── gateway/        # API Gateway (HTTP/GraphQL entry point)
│   ├── auth/           # Authentication & User Management (TCP)
│   ├── feed/           # Social Graph, Posts, Comments (TCP)
│   ├── media/          # File Uploads & Processing (HTTP)
│   └── notifications/  # Notification Dispatcher (TCP + RabbitMQ)
├── packages/           # Shared libraries
│   ├── common/         # Utilities, Guards, Interceptors (@the-falcon/common)
│   ├── types/          # Shared Interfaces & DTOs (@the-falcon/types)
│   └── notifications/  # Notification Definitions (@the-falcon/notifications)
├── docker-compose.local.yml  # Local infrastructure definitions
└── pnpm-workspace.yaml       # Workspace configuration
```

## ⚡ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [Docker](https://www.docker.com/) & Docker Compose

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/FLCN-16/nest-microservices.git
cd nest-microservices
pnpm install
```

### 2. Start Infrastructure

Start the supporting services (Databases, Message Brokers, etc.) in Docker:

```bash
docker-compose -f docker-compose.local.yml up -d
```

This will spin up:
- **PostgreSQL** (Port 5432)
- **Redis** (Port 6379)
- **RabbitMQ** (Ports 5672, 15672)
- **Consul** (Ports 8500, 8600)
- **MinIO** (Ports 9000, 9001)

### 3. Running Services

You can run all services in development mode using Turbo:

```bash
pnpm dev
```

Or run a specific service individually (e.g., the Gateway):

```bash
pnpm --filter gateway dev
```

## 📖 Documentation

For more detailed information, check out the following guides:

- [Architecture Overview](./ARCHITECTURE.md) - Deep dive into the system design and communication patterns.
- [Development Guidelines](./GUIDELINES.md) - Coding standards, best practices, and error handling.

## ❤️ Sponsor

If you find this project useful, please consider supporting the team to help us maintain and improve **Nest Microservices**.

- [GitHub Sponsors](https://github.com/sponsors/FLCN-16)
- **Star this repo** if you like what you see! ⭐
