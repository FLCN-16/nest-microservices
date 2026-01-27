import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Gateway');
  const app = await NestFactory.create(AppModule);

  // Connect TCP Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: Number(process.env.TCP_PORT) || 5000,
    },
  });

  // Enable CORS for all services
  app.enableCors();

  await app.startAllMicroservices();
  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`Gateway is running on: http://localhost:${port}`);
  logger.log(
    `Gateway TCP is listening on port: ${process.env.TCP_PORT || 5000}`,
  );
}
bootstrap();
