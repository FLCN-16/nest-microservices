import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class AuthTcpController {
  private readonly logger = new Logger(AuthTcpController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @MessagePattern('get_me')
  async getMe(@Payload() data: { authToken: string; deviceId: string }) {
    this.logger.debug('Received TCP get_me request');
    const user = await this.authService.getMeByToken(
      data.authToken,
      data.deviceId,
    );
    return { user, isAuthenticated: true };
  }

  /**
   * Validate a JWT token and return user data.
   * Used by TcpAuthGuard in other services to verify authentication.
   */
  @MessagePattern('validate_token')
  async validateToken(@Payload() data: { token: string }) {
    this.logger.debug('Received TCP validate_token request');

    try {
      // Verify the JWT token
      const payload = this.jwtService.verify(data.token);

      // Find the user by ID from the token payload
      const user = await this.usersService.findById(payload.sub);

      if (!user) {
        return {
          valid: false,
          user: null,
          error: 'User not found',
        };
      }

      // Return validated user data (without sensitive fields)
      return {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.displayName || user.username || user.email.split('@')[0],
          role: 'user', // TODO: Implement proper role system
          permissions: [],
        },
      };
    } catch (error) {
      this.logger.warn(`Token validation failed: ${error.message}`);
      return {
        valid: false,
        user: null,
        error: error.message || 'Invalid token',
      };
    }
  }
}
