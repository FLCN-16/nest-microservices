# Feed Microservice

The **Feed Service** is the central content engine of The Falcon platform. It manages the creation, retrieval, and distribution of user posts and social interactions.

## 🚀 Features

- **Post Management**: Create and retrieve posts with rich content support.
- **DTO Validation**: Strict input validation and response transformation to protect sensitive user data (e.g., masking emails/phones in public feeds).
- **Hybrid API**:
  - **GraphQL**: Exposes a flexible schema for frontend clients to query posts.
  - **TCP**: Internal communication handling.

## 🏗 Architecture

Built on **NestJS** with **PostgreSQL** for persistence.

### Core Modules
- **FeedModule**: Main business logic container.
- **Microservices Integration**: Connects to other services (like Auth/Notifications) via TCP.

### Data Models
- **Post Entity**: Stores content, metadata, and author relationships.
- **PostDto**: Transfer object that shapes the API response and handles data sanitization.

## 🛠 Configuration

| Environment Variable | Description |
|----------------------|-------------|
| `FEED_DB_HOST` | Postgres host (default: localhost) |
| `FEED_DB_PORT` | Postgres port (default: 5432) |
| `FEED_DB_USER` | Postgres username (default: feed_user) |
| `FEED_DB_PASSWORD` | Postgres password |
| `FEED_DB_NAME` | Postgres database name (default: feed_db) |
| `PORT` | HTTP port (default: 4002) |
| `TCP_PORT` | TCP port (default: 5002) |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins |

## 📦 Dependencies
- `@nestjs/graphql` & `@nestjs/apollo`
- `@nestjs/typeorm` & `pg`
- `class-transformer` & `class-validator` for DTO management
