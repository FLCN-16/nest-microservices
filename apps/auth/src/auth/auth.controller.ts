import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Body,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '@the-falcon/common';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any, @Headers('x-device-id') deviceId: string) {
    return this.authService.login(req.user, deviceId || 'unknown');
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Request() req: any) {
    const user = await this.authService.getMe(req.user.userId);
    return { user, isAuthenticated: true };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: any) {
    if (req.user?.sessionToken) {
      await this.authService.logout(req.user.sessionToken);
    }
    return { success: true };
  }

  @Post('register')
  async register(@Body() userData: any) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await this.usersService.create({
      ...userData,
      password: hashedPassword,
    });
    // Return user without password
    const { password: _password, ...result } = user;
    return result;
  }
}
