import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { MediaModule } from './media.module';
import { Logger, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('MediaService');

  const httpPort = parseInt(process.env.PORT || '4003', 10);
  const tcpPort = parseInt(process.env.TCP_PORT || '5003', 10);

  // Create HTTP application
  const app = await NestFactory.create(MediaModule);

  // Enable Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors(); // Allow upload from mobile/web

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
