import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { CommonAuthModule } from '@the-falcon/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { AuthTcpController } from './auth.tcp.controller';

@Module({
  imports: [UsersModule, PassportModule, CommonAuthModule],
  providers: [AuthService, LocalStrategy],
  controllers: [AuthController, AuthTcpController],
  exports: [AuthService],
})
export class AuthModule {}
