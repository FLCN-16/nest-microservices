import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { Roles } from '@the-falcon/common';

@Injectable()
export class AuthService {
  private roles = Roles;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password: _password, ...result } = user;
      return result;
    }
    return null;
  }

  private getPermissionsForRole(role: string): string[] {
    return (this.roles as Record<string, string[]>)[role] || [];
  }

  async login(user: any, deviceId: string) {
    const sessionToken = crypto.randomUUID();

    // Create session in DB
    await this.usersService.createSession(user, sessionToken, deviceId);

    const payload = {
      email: user.email,
      sub: user.id,
      username: user.username,
      role: user.role || 'user',
      sessionToken: sessionToken,
    };

    return {
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.displayName || user.username || user.email.split('@')[0],
        username: user.username,
        role: user.role || 'user',
        permissions: this.getPermissionsForRole(user.role || 'user'),
      },
    };
  }

  async logout(sessionToken: string) {
    await this.usersService.deleteSession(sessionToken);
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      name: user.displayName || user.username || user.email.split('@')[0],
      username: user.username,
      role: user.role || 'user',
      permissions: this.getPermissionsForRole(user.role || 'user'),
    };
  }

  async getMeByToken(authToken: string, deviceId: string) {
    try {
      const payload = this.jwtService.verify(authToken);

      // Validate session exists for this device
      const session = await this.usersService.findSession(payload.sessionToken);
      if (!session || session.deviceId !== deviceId) {
        throw new UnauthorizedException('Invalid session or device');
      }

      return this.getMe(payload.sub);
    } catch (_error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
