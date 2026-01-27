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

@Module({
  imports: [
    TcpClientModule.register(),
    CommonGatewayAuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
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
      synchronize: true, // Auto-create tables (dev only)
    }),
    TypeOrmModule.forFeature([Notification]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
