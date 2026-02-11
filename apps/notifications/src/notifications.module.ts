import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ConsulModule,
  CommonGatewayAuthModule,
  TcpClientModule,
} from '@the-falcon/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import * as Joi from 'joi';

@Module({
  imports: [
    TcpClientModule.register(),
    CommonGatewayAuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(4004),
        NOTIFICATIONS_DB_HOST: Joi.string().default('localhost'),
        NOTIFICATIONS_DB_PORT: Joi.number().default(5432),
        NOTIFICATIONS_DB_USER: Joi.string().default('notifications_user'),
        NOTIFICATIONS_DB_PASSWORD: Joi.string().default('notifications_password'),
        NOTIFICATIONS_DB_NAME: Joi.string().default('notifications_db'),
        RABBITMQ_URL: Joi.string().default('amqp://guest:guest@localhost:5672'),
        ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),
      }),
    }),
    ConsulModule.register({
      serviceName: 'notifications',
      port: parseInt(process.env.PORT || '4004', 10),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.NOTIFICATIONS_DB_HOST || 'localhost',
      port: parseInt(process.env.NOTIFICATIONS_DB_PORT || '5432'),
      username: process.env.NOTIFICATIONS_DB_USER || 'notifications_user',
      password:
        process.env.NOTIFICATIONS_DB_PASSWORD || 'notifications_password',
      database: process.env.NOTIFICATIONS_DB_NAME || 'notifications_db',
      entities: [Notification],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([Notification]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule { }
