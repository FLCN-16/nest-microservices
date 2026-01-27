import { Module } from '@nestjs/common';
import { ConsulModule } from '@the-falcon/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { TcpController } from './tcp.controller';
import { AppService } from './app.service';
import { MicroserviceClient } from './proxies';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
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
export class AppModule {}
