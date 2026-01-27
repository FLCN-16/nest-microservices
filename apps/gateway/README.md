# API Gateway

The **Gateway** is the unified entry point for all client applications (Mobile, Web, Admin). It proxies requests to appropriate backend microservices and handles cross-cutting concerns like aggregation and protocol translation.

## 🚀 Features

- **Unified Proxy**: Single endpoint for accessing Auth, Feed, Media, and Notification services.
- **Service Discovery**: Integrates with **Consul** to dynamically resolve microservice locations (Host/Port).
- **Resiliency**: Built-in **MicroserviceClient** with automatic connection pooling, retries, and error handling.
- **Protocol Translation**: Converts incoming HTTP/GraphQL requests into TCP calls for internal services.

## 🏗 Architecture

The Gateway does not own its own database. It acts as an orchestrator.

### Key Components
- **MicroserviceClient**: Advanced TCP client wrapper that manages connections using the `DiscoveryService`.
- **Proxies**: Abstractions for downstream services.
- **Controllers**:
  - `AppController`: General HTTP endpoints.
  - `TcpController`: Handles internal health/routing if needed.

## ⚙️ How It Works

1. **Discovery**: On startup, it connects to Consul to find available services (`auth`, `feed`, etc.).
2. **Routing**: Incoming requests are intercepted.
3. **Dispatch**: The `MicroserviceClient` identifies the target service and sends a TCP message (CMD or Event).
4. **Response**: The result is formatted and returned to the HTTP client.

## 🛠 Configuration

| Environment Variable | Description |
|----------------------|-------------|
| `CONSUL_HOST` | Host address of the Consul server |
| `PORT` | HTTP port (default: 4000) |
| `NODE_ENV` | Environment (development/production) |

## 📦 Dependencies
- `@nestjs/axios`
- `consul`
- `@the-falcon/common` (Shared logic)
