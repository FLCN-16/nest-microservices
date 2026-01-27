import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UserSession } from './user-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
