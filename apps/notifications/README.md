# Notifications Microservice

The **Notifications Service** manages the dispatch and persistence of user alerts. It supports multiple channels and is designed to handle high-throughput event processing via RabbitMQ (or direct TCP events).

## 🚀 Features

- **Multi-Channel Delivery**:
  - **Email**: Transactional emails (implementation ready).
  - **Push**: Mobile push notifications.
  - **SMS**: Text message alerts.
  - **In-App**: Persistent notifications stored in the database.
- **Event Driven**: Listens for `send_notification` events from other services.
- **Persistence**: Stores In-App notification history in Postgres.

## 🏗 Architecture

### Modules
- **NotificationsModule**: Core module handling routing and dispatch logic.

### Data Models
- **Notification Entity**: Records recipient, content, read status, and metadata for in-app display.

### Workflows
1. **Trigger**: An external service (e.g., Feed) emits a `send_notification` event.
2. **Routing**: `NotificationsService` determines the type (`EMAIL`, `PUSH`, `IN_APP`).
3. **Dispatch**: The appropriate handler executes the delivery logic.
4. **Save**: If type is `IN_APP`, the notification is persisted to the database.

## 🛠 Configuration

| Environment Variable | Description |
|----------------------|-------------|
| `DATABASE_URL` | Postgres connection string |
| `RABBITMQ_URL` | AMQP connection string (if using RMQ transport) |

## 📦 Dependencies
- `@nestjs/microservices`
- `@nestjs/typeorm` & `pg`
- `@the-falcon/notifications` (Shared DTOs)
