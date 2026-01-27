import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Observable } from "rxjs";

@Injectable()
export class GatewayAuthGuard implements CanActivate {
  private readonly logger = new Logger(GatewayAuthGuard.name);

  constructor(private configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const gatewaySecret = request.headers["x-gateway-secret"];
    const expectedSecret = this.configService.get<string>("GATEWAY_SECRET");

    if (!expectedSecret) {
      this.logger.error("GATEWAY_SECRET is not defined in environment");
      throw new ForbiddenException(
        "Service misconfigured: Gateway secret not set",
      );
    }

    if (!gatewaySecret || gatewaySecret !== expectedSecret) {
      throw new ForbiddenException("Invalid or missing Gateway Secret");
    }

    return true;
  }
}
