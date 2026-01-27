import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  Inject,
} from "@nestjs/common";
import axios, { AxiosInstance } from "axios";
import * as os from "os";

export interface ConsulModuleOptions {
  serviceName: string;
  port?: number;
  consulHost?: string;
  consulPort?: number;
  /** Transport type for health checks: 'http' or 'tcp'. Default: 'http' */
  transport?: "http" | "tcp";
  /** TCP port for microservice communication (used when transport is 'tcp') */
  tcpPort?: number;
  /** TCP host for microservice communication. Default: hostname */
  tcpHost?: string;
  /** Custom health check path. Default: '/health' */
  healthPath?: string;
}

export interface ServiceAddress {
  host: string;
  port: number;
  meta?: Record<string, string>;
}

@Injectable()
export class ConsulService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ConsulService.name);
  private readonly client: AxiosInstance;
  private serviceId: string;

  constructor(
    @Inject("CONSUL_OPTIONS") private readonly options: ConsulModuleOptions,
  ) {
    const host = this.options.consulHost || process.env.CONSUL_HOST || "consul";
    const port =
      this.options.consulPort ||
      parseInt(process.env.CONSUL_PORT || "8500", 10);

    this.client = axios.create({
      baseURL: `http://${host}:${port}/v1`,
    });
  }

  async onModuleInit() {
    const httpPort =
      this.options.port || parseInt(process.env.PORT || "3000", 10);
    const serviceName = this.options.serviceName;
    const transport = this.options.transport || "http";
    const tcpPort = this.options.tcpPort;

    // Allow overriding host for Docker scenarios (e.g. host.docker.internal)
    const resolvedHost = process.env.SERVICE_HOST || os.hostname();
    const tcpHost = this.options.tcpHost || resolvedHost;

    // Use TCP port for service registration if transport is TCP
    const registrationPort =
      transport === "tcp" && tcpPort ? tcpPort : httpPort;
    // Use resolvedHost for service ID generation to ensure uniqueness/consistency
    this.serviceId = `${serviceName}-${resolvedHost}-${registrationPort}`;

    // Build health check based on transport type
    const check =
      transport === "tcp" && tcpPort
        ? {
            TCP: `${tcpHost}:${tcpPort}`,
            Interval: "10s",
            Timeout: "5s",
            Status: "passing",
          }
        : {
            HTTP: `http://${resolvedHost}:${httpPort}${this.options.healthPath || "/health"}`,
            Interval: "10s",
            Timeout: "5s",
            Status: "passing",
          };

    try {
      await this.client.put("/agent/service/register", {
        Name: serviceName,
        ID: this.serviceId,
        Address: transport === "tcp" ? tcpHost : resolvedHost,
        Port: registrationPort,
        Tags: ["nest-service", `transport-${transport}`],
        Check: check,
        Meta: {
          transport,
          httpPort: String(httpPort),
          ...(tcpPort && { tcpPort: String(tcpPort) }),
        },
      });
      this.logger.log(
        `Registered service ${serviceName} (ID: ${this.serviceId}) with Consul [transport: ${transport}]`,
      );
    } catch (error) {
      this.logger.error(`Failed to register with Consul: ${error.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.serviceId) {
      try {
        await this.client.put(`/agent/service/deregister/${this.serviceId}`);
        this.logger.log(`Deregistered service ${this.serviceId}`);
      } catch (error) {
        this.logger.error(`Failed to deregister service: ${error.message}`);
      }
    }
  }

  /**
   * Get the URL for a service (HTTP transport)
   */
  async getServiceUrl(serviceName: string): Promise<string> {
    const { host, port, meta } = await this.getServiceAddress(serviceName);

    // Use httpPort from metadata if available, otherwise fallback to registered port
    const httpPort = meta?.httpPort ? parseInt(meta.httpPort, 10) : port;

    return `http://${host}:${httpPort}`;
  }

  /**
   * Get the address (host and port) for a service
   */
  async getServiceAddress(serviceName: string): Promise<ServiceAddress> {
    const instances = await this.getAllHealthyInstances(serviceName);

    if (instances.length === 0) {
      throw new Error(`No healthy service found for ${serviceName}`);
    }

    // Simple random selection for basic load balancing
    const instance = instances[Math.floor(Math.random() * instances.length)];
    return instance;
  }

  /**
   * Get all healthy instances of a service
   */
  async getAllHealthyInstances(serviceName: string): Promise<ServiceAddress[]> {
    try {
      console.log(`Consul lookup for service: ${serviceName}`);
      const { data } = await this.client.get(
        `/health/service/${serviceName}?passing=true`,
      );
      console.log(
        `Consul returned ${data?.length || 0} healthy instances for ${serviceName}`,
      );

      if (!data || data.length === 0) {
        return [];
      }

      return data.map((entry: any) => ({
        host:
          entry.Service.Address === "host.docker.internal"
            ? "localhost"
            : entry.Service.Address,
        port: entry.Service.Port,
        meta: entry.Service.Meta,
      }));
    } catch (error) {
      this.logger.error(
        `Error looking up service ${serviceName}: ${error.message}`,
      );
      throw error;
    }
  }
}
