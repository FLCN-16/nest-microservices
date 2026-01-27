import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  CHECK_POLICIES_KEY,
  PolicyHandler,
  IPolicyHandler,
} from "../decorators/check-policies.decorator";
import { CaslAbilityFactory, AppAbility } from "../casl/casl-ability.factory";

/**
 * Guard that checks CASL policies specified via @CheckPolicies decorator.
 *
 * Must be used after an authentication guard (like TcpAuthGuard or JwtAuthGuard)
 * that attaches the user to the request.
 *
 * @example
 * @Controller('posts')
 * @UseGuards(TcpAuthGuard, PoliciesGuard)
 * export class PostsController {
 *   @Get()
 *   @CheckPolicies((ability) => ability.can(Action.Read, 'Post'))
 *   findAll() { ... }
 * }
 */
@Injectable()
export class PoliciesGuard implements CanActivate {
  private readonly logger = new Logger(PoliciesGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly caslAbilityFactory: CaslAbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(
        CHECK_POLICIES_KEY,
        context.getHandler(),
      ) || [];

    // If no policies specified, allow access
    if (policyHandlers.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      this.logger.warn(
        "PoliciesGuard: No user found on request. Ensure auth guard runs first.",
      );
      throw new ForbiddenException("User not authenticated");
    }

    // Create ability for this user
    const ability = this.caslAbilityFactory.createForUser(user);

    // Attach ability to request for use in controllers
    request.ability = ability;

    // Check all policy handlers
    const allPoliciesPass = policyHandlers.every((handler) =>
      this.execPolicyHandler(handler, ability),
    );

    if (!allPoliciesPass) {
      this.logger.debug(`Access denied for user ${user.id}`);
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }

  private execPolicyHandler(
    handler: PolicyHandler | IPolicyHandler,
    ability: AppAbility,
  ): boolean {
    if (typeof handler === "function") {
      return handler(ability);
    }
    return handler.handle(ability);
  }
}
