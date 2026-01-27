import { SetMetadata } from "@nestjs/common";
import { AppAbility } from "../casl/casl-ability.factory";

/**
 * Policy handler function type
 */
export type PolicyHandler = (ability: AppAbility) => boolean;

/**
 * Policy handler class interface
 */
export interface IPolicyHandler {
  handle(ability: AppAbility): boolean;
}

/**
 * Metadata key for policy handlers
 */
export const CHECK_POLICIES_KEY = "check_policy";

/**
 * Decorator to specify CASL policy checks on a route.
 *
 * Use with `PoliciesGuard` to enforce authorization.
 *
 * @example
 * // Using function handler
 * @CheckPolicies((ability) => ability.can(Action.Read, 'Post'))
 * @Get()
 * findAll() { ... }
 *
 * @example
 * // Multiple policies (all must pass)
 * @CheckPolicies(
 *   (ability) => ability.can(Action.Read, 'Post'),
 *   (ability) => ability.can(Action.Read, 'Comment')
 * )
 * @Get(':id')
 * findOne(@Param('id') id: string) { ... }
 */
export const CheckPolicies = (...handlers: PolicyHandler[]) =>
  SetMetadata(CHECK_POLICIES_KEY, handlers);
