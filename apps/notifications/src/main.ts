import { Logger, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { NotificationsModule } from './notifications.module';
import { AllExceptionsFilter, LoggingInterceptor } from '@the-falcon/common';

async function bootstrap() {
  const logger = new Logger('NotificationsService');

  const app = await NestFactory.create(NotificationsModule);
  const configService = app.get(ConfigService);

  const httpPort = configService.get<number>('PORT', 4004);
  const rabbitmqUrl = configService.get<string>(
    'RABBITMQ_URL',
    'amqp://guest:guest@localhost:5672',
  );

  // Global filters and interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
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

  app.enableCors({
    origin: configService
      .get<string>('ALLOWED_ORIGINS', 'http://localhost:3000')
      .split(','),
    credentials: true,
  });

  await app.startAllMicroservices();

  await app.listen(httpPort);
  logger.log(
    `Notifications Service is listening on port ${httpPort} (HTTP) and consuming RabbitMQ messages`,
  );
}
bootstrap();
