import { Module, DynamicModule, Global } from "@nestjs/common";
import { TcpClientService } from "./tcp-client.service";
import { ConsulModule } from "../consul/consul.module";

export interface TcpClientModuleOptions {
  /** Service name for Consul registration (optional, only needed if this service also registers itself) */
  serviceName?: string;
  /** Whether to register as global module (default: true) */
  global?: boolean;
}

/**
 * Module that provides TcpClientService for inter-service TCP communication.
 *
 * @example
 * // Basic usage - just need TCP client functionality
 * @Module({
 *   imports: [TcpClientModule.register()],
 * })
 * export class AppModule {}
 *
 * @example
 * // With service registration
 * @Module({
 *   imports: [TcpClientModule.register({ serviceName: 'feed' })],
 * })
 * export class AppModule {}
 */
@Global()
@Module({})
export class TcpClientModule {
  static register(options?: TcpClientModuleOptions): DynamicModule {
    const isGlobal = options?.global ?? true;

    return {
      module: TcpClientModule,
      global: isGlobal,
      imports: [
        ConsulModule.register({
          serviceName: options?.serviceName,
        }),
      ],
      providers: [TcpClientService],
      exports: [TcpClientService],
    };
  }
}
