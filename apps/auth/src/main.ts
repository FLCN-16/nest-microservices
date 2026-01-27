import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('AuthService');

  const httpPort = parseInt(process.env.PORT || '4001', 10);
  const tcpPort = parseInt(process.env.TCP_PORT || '5001', 10);

  // Create HTTP application
  const app = await NestFactory.create(AppModule);

  // Enable Versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Enable CORS
  app.enableCors();

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
  logger.log(`Auth TCP microservice is listening on port ${tcpPort}`);

  // Start HTTP server
  await app.listen(httpPort);
  logger.log(`Auth service is running on: http://localhost:${httpPort}`);
}
bootstrap();
