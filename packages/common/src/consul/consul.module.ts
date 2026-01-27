import { DynamicModule, Global, Module } from "@nestjs/common";
import { ConsulService, ConsulModuleOptions } from "./consul.service";
import { DiscoveryService } from "./discovery.service";

@Global()
@Module({})
export class ConsulModule {
  static register(options: ConsulModuleOptions): DynamicModule {
    return {
      module: ConsulModule,
      providers: [
        {
          provide: "CONSUL_OPTIONS",
          useValue: options,
        },
        ConsulService,
        DiscoveryService,
      ],
      exports: [ConsulService, DiscoveryService],
    };
  }
}
