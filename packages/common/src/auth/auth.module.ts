import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy";
import * as fs from "fs";
import * as path from "path";

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Load RSA keys from files
        // Use JWT_KEYS_PATH env var or default to ./secrets (relative to app cwd)
        const keysPath =
          configService.get<string>("JWT_KEYS_PATH") || "./secrets";
        const privateKeyPath = path.resolve(keysPath, "private_key.pem");
        const publicKeyPath = path.resolve(keysPath, "public_key.pem");

        let privateKey: string | undefined;
        let publicKey: string | undefined;

        try {
          privateKey = fs.readFileSync(privateKeyPath, "utf8");
          publicKey = fs.readFileSync(publicKeyPath, "utf8");
        } catch (err) {
          console.error(
            `Failed to load RSA keys from ${keysPath}:`,
            err.message,
          );
        }

        return {
          privateKey: privateKey,
          publicKey: publicKey,
          signOptions: { expiresIn: "60m", algorithm: "RS256" },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [JwtStrategy],
  exports: [JwtModule, PassportModule, JwtStrategy],
})
export class CommonAuthModule {}
