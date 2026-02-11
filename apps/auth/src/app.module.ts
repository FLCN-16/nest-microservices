import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonGatewayAuthModule, ConsulModule } from '@the-falcon/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(4001),
        TCP_PORT: Joi.number().default(5001),
        DB_HOST: Joi.string().default('localhost'),
        DB_PORT: Joi.number().default(5432),
        DB_USER: Joi.string().default('auth_user'),
        DB_PASSWORD: Joi.string().default('auth_password'),
        DB_NAME: Joi.string().default('auth_db'),
        JWT_SECRET: Joi.string().required(),
        ALLOWED_ORIGINS: Joi.string().default('http://localhost:3000'),
      }),
    }),
    ConsulModule.register({
      serviceName: 'auth',
      port: parseInt(process.env.PORT || '4001', 10),
      tcpPort: parseInt(process.env.TCP_PORT || '5001', 10),
      transport: 'tcp',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'auth_user',
      password: process.env.DB_PASSWORD || 'auth_password',
      database: process.env.DB_NAME || 'auth_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    CommonGatewayAuthModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
