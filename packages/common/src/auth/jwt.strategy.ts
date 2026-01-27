import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";

function loadPublicKey(configService: ConfigService): string | undefined {
  const publicKey = configService.get<string>("JWT_PUBLIC_KEY");
  if (publicKey) return publicKey;

  const keysPath = configService.get<string>("JWT_KEYS_PATH") || "./secrets";
  const publicKeyPath = path.resolve(keysPath, "public_key.pem");

  try {
    if (fs.existsSync(publicKeyPath)) {
      return fs.readFileSync(publicKeyPath, "utf8");
    } else {
      console.warn(
        `JwtStrategy: Public key file not found at ${publicKeyPath}`,
      );
    }
  } catch (err) {
    console.error(
      `JwtStrategy: Failed to load public key from ${publicKeyPath}`,
      err,
    );
  }
  return undefined;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) {
    const publicKey = loadPublicKey(configService);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: publicKey || "MISSING_PUBLIC_KEY",
      algorithms: ["RS256"],
    });

    if (!publicKey) {
      this.logger.error("Public key not found. JWT verification will fail.");
    }
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      username: payload.username,
      role: payload.role || "user",
      sessionToken: payload.sessionToken,
    };
  }
}
