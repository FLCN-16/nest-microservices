# Auth Microservice

The **Auth Service** is the backbone of identity and access management for The Falcon platform. It handles user registration, login, session management, and JWT token issuance/validation.

## 🚀 Features

- **Authentication Strategies**:
  - **Local Auth**: Email/username and password login.
  - **JWT Strategy**: Secure stateless authentication using RS256 signed tokens.
- **Session Management**: Persistent tracking of user sessions per device.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions using CASL (e.g., `manage:all`, `read:posts`).
- **TCP Interface**: Exposes internal commands for other microservices to validate tokens.

## 🏗 Architecture

This service is built with **NestJS** and manages its own **PostgreSQL** database.

### Core Modules
- **AuthModule**: Handles login flows and strategy implementations.
- **UsersModule**: Manages `User` and `UserSession` persistence.
- **ConsulModule**: Registers service for discovery.

### Data Models
- **User**: Stores credentials and profile data.
- **UserSession**: Maps valid authentication tokens to specific devices.

## 📡 Message Patterns (TCP)

This service listens for the following TCP commands from other services (e.g., Gateway):

| Pattern | Payload | Description |
|---------|---------|-------------|
| `get_me` | `{ authToken, deviceId }` | Retrieves user details for a valid session. |
| `validate_token` | `{ token }` | Verifies a JWT and returns the associated user payload. |

## 🛠 Configuration

| Environment Variable | Description |
|----------------------|-------------|
| `DATABASE_URL` | Postgres connection string |
| `JWT_KEYS_PATH` | Path to directory containing `private_key.pem` and `public_key.pem` |
| `PORT` | HTTP port (default: 4001) |
| `TCP_PORT` | TCP port (default: 5001) |

## 📦 Dependencies
- `@nestjs/passport` & `passport-jwt`
- `@nestjs/typeorm` & `pg`
- `bcrypt` for password hashing
