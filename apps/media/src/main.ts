import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { MediaModule } from './media.module';
import { Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter, LoggingInterceptor } from '@the-falcon/common';

async function bootstrap() {
  const logger = new Logger('MediaService');

  const app = await NestFactory.create(MediaModule);
  const configService = app.get(ConfigService);

  const httpPort = configService.get<number>('PORT', 4003);
  const tcpPort = configService.get<number>('TCP_PORT', 5003);

  // Global filters and interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

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

  // Connect TCP microservice for inter-service communication
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: tcpPort,
    },
  });

  // Start all microservices (TCP)
  await app.startAllMicroservices();
  logger.log(`Media TCP microservice is listening on port ${tcpPort}`);

  // Start HTTP server
  await app.listen(httpPort);
  logger.log(`Media service is running on: http://localhost:${httpPort}`);
  logger.log(`GraphQL Playground: http://localhost:${httpPort}/graphql`);
}
bootstrap();
