import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NotificationsModule } from './notifications.module';

async function bootstrap() {
  const logger = new Logger('NotificationsService');

  const app = await NestFactory.create(NotificationsModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: 'notifications_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  // Enable Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors(); // Allow upload from mobile/web

  await app.startAllMicroservices();

  const port = process.env.PORT || 4004;
  await app.listen(port);
  logger.log(
    `Notifications Service is listening on port ${port} (HTTP) and consuming RabbitMQ messages`,
  );
}
bootstrap();
