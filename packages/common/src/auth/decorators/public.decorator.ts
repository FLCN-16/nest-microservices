import { SetMetadata } from "@nestjs/common";
import { IS_PUBLIC_KEY } from "../guards/tcp-auth.guard";

/**
 * Decorator to mark a route as public (skip authentication).
 *
 * Use this decorator on routes that should be accessible without authentication
 * when using TcpAuthGuard as a global guard.
 *
 * @example
 * @Public()
 * @Get('health')
 * getHealth() {
 *   return { status: 'ok' };
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
