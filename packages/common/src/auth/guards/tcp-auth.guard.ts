import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Logger,
  mixin,
  Type,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { TcpClientService } from "../../tcp/tcp-client.service";
import {
  CaslAbilityFactory,
  Action,
  Subjects,
  AppAbility,
} from "../casl/casl-ability.factory";

/**
 * Decorator key to mark routes as public (skip auth)
 */
export const IS_PUBLIC_KEY = "isPublic";

/**
 * Response from the auth service's validate_token command
 */
export interface ValidateTokenResponse {
  valid: boolean;
  user: {
    id: string;
    email: string;
    username?: string;
    name?: string;
    role?: string;
    permissions?: string[];
  } | null;
  error?: string;
}

/**
 * Options for TcpAuthGuard
 */
export interface TcpAuthGuardOptions {
  action?: Action | string;
  subject?: Subjects | string;
  conditions?: Record<string, any>;
}

/**
 * Base TcpAuthGuard class for authentication via TCP.
 * Use the factory function TcpAuthGuard() for the enhanced API.
 */
@Injectable()
export class BaseTcpAuthGuard implements CanActivate {
  protected readonly logger = new Logger(BaseTcpAuthGuard.name);
  protected readonly options: TcpAuthGuardOptions = {};

  constructor(
    protected readonly tcpClient: TcpClientService,
    protected readonly reflector: Reflector,
    protected readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // Authenticate user
    await this.authenticateRequest(request);

    // Check authorization if action/subject specified
    if (this.options.action && this.options.subject) {
      this.checkAuthorization(request, this.options);
    }

    return true;
  }

  protected async authenticateRequest(request: any): Promise<void> {
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException("No authorization token provided");
    }

    try {
      const result =
        await this.tcpClient.sendAuthCommand<ValidateTokenResponse>(
          "validate_token",
          { token },
          { timeout: 5000, retries: 1 },
        );

      if (!result.valid || !result.user) {
        throw new UnauthorizedException(result.error || "Invalid token");
      }

      // Attach user and ability to request
      request.user = result.user;
      request.ability = this.caslAbilityFactory.createForUser(result.user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.error(`Token validation failed: ${error.message}`);
      throw new UnauthorizedException("Failed to validate token");
    }
  }

  protected checkAuthorization(
    request: any,
    options: TcpAuthGuardOptions,
  ): void {
    const ability: AppAbility = request.ability;

    if (!ability) {
      throw new ForbiddenException("Ability not found on request");
    }

    const { action, subject, conditions } = options;

    // Create a subject object if conditions are provided
    let subjectToCheck: any = subject;
    if (conditions) {
      subjectToCheck = { ...conditions, __caslSubjectType__: subject };
    }

    const canPerformAction = ability.can(
      action as Action,
      subjectToCheck as Subjects,
    );

    if (!canPerformAction) {
      this.logger.debug(
        `Access denied: cannot ${action} ${subject}` +
          (conditions ? ` with conditions ${JSON.stringify(conditions)}` : ""),
      );
      throw new ForbiddenException("Insufficient permissions");
    }
  }

  protected extractToken(request: any): string | null {
    const authHeader = request.headers?.authorization;

    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return null;
    }

    return token;
  }
}

/**
 * Factory function to create TcpAuthGuard with CASL authorization.
 *
 * @example
 * // Authentication only
 * @UseGuards(TcpAuthGuard())
 * @Get('protected')
 * getProtected() { ... }
 *
 * @example
 * // Authentication + Authorization
 * @UseGuards(TcpAuthGuard('read', 'Post'))
 * @Get('posts')
 * getPosts() { ... }
 *
 * @example
 * // With conditions
 * @UseGuards(TcpAuthGuard('read', 'Post', { published: true }))
 * @Get('published-posts')
 * getPublishedPosts() { ... }
 */
export function TcpAuthGuard(): Type<CanActivate>;
export function TcpAuthGuard(
  action: Action | string,
  subject: Subjects | string,
  conditions?: Record<string, any>,
): Type<CanActivate>;
export function TcpAuthGuard(
  action?: Action | string,
  subject?: Subjects | string,
  conditions?: Record<string, any>,
): Type<CanActivate> {
  @Injectable()
  class TcpAuthGuardMixin extends BaseTcpAuthGuard {
    protected override readonly options: TcpAuthGuardOptions = {
      action,
      subject,
      conditions,
    };

    constructor(
      tcpClient: TcpClientService,
      reflector: Reflector,
      caslAbilityFactory: CaslAbilityFactory,
    ) {
      super(tcpClient, reflector, caslAbilityFactory);
    }
  }

  return mixin(TcpAuthGuardMixin);
}

// Also export the base class for cases where injection is needed
export { BaseTcpAuthGuard as TcpAuthGuardClass };
