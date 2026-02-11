import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AllExceptionsFilter,
  LoggingInterceptor,
} from '@the-falcon/common';

async function bootstrap() {
  const logger = new Logger('Gateway');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const httpPort = configService.get<number>('PORT', 4000);
  const tcpPort = configService.get<number>('TCP_PORT', 5000);

  // Global filters and interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Connect TCP Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: tcpPort,
    },
  });

  // Enable CORS for all services
  app.enableCors({
    origin: configService.get<string>('ALLOWED_ORIGINS', 'http://localhost:3000').split(','),
    credentials: true,
  });

  await app.startAllMicroservices();
  await app.listen(httpPort);
  logger.log(`Gateway is running on: http://localhost:${httpPort}`);
  logger.log(`Gateway TCP is listening on port: ${tcpPort}`);
}
bootstrap();
