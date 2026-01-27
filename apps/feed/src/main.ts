import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { FeedModule } from './feed.module';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('FeedService');

  const httpPort = parseInt(process.env.PORT || '4002', 10);
  const tcpPort = parseInt(process.env.TCP_PORT || '5002', 10);

  // Create HTTP application
  const app = await NestFactory.create(FeedModule);

  // Enable Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Enable CORS
  app.enableCors();

  // Enable global validation (required for robust DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

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
  logger.log(`Feed TCP microservice is listening on port ${tcpPort}`);

  // Start HTTP server
  await app.listen(httpPort);
  logger.log(`Feed service is running on: http://localhost:${httpPort}`);
  logger.log(`GraphQL Playground: http://localhost:${httpPort}/graphql`);
}
bootstrap();
