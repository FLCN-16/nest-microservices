import { Module } from '@nestjs/common';
import { ConsulModule } from '@the-falcon/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TcpController } from './tcp.controller';
import { AppService } from './app.service';
import { MicroserviceClient } from './proxies';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(4000),
        TCP_PORT: Joi.number().default(5000),
        GATEWAY_SECRET: Joi.string().required(),
        ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),
      }),
    }),
    HttpModule,
    ConsulModule.register({
      serviceName: 'gateway',
      healthPath: '/api/health',
    }),
  ],
  controllers: [AppController, TcpController],
  providers: [AppService, MicroserviceClient],
  exports: [MicroserviceClient],
})
export class AppModule { }
