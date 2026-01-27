import { Injectable, Logger } from "@nestjs/common";
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";
import { ConsulService, ServiceAddress } from "./consul.service";

interface CachedAddress {
  address: ServiceAddress;
  timestamp: number;
}

@Injectable()
export class DiscoveryService {
  private readonly logger = new Logger(DiscoveryService.name);
  private readonly addressCache = new Map<string, CachedAddress>();
  private readonly clientCache = new Map<string, ClientProxy>();

  /** Cache TTL in milliseconds (default: 30 seconds) */
  private readonly cacheTtlMs = 30000;

  constructor(private readonly consulService: ConsulService) {}

  /**
   * Get the address of a service from Consul with caching
   */
  async getServiceAddress(
    serviceName: string,
    forceRefresh = false,
  ): Promise<ServiceAddress> {
    const cached = this.addressCache.get(serviceName);
    const now = Date.now();

    // Return cached address if valid and not forcing refresh
    if (!forceRefresh && cached && now - cached.timestamp < this.cacheTtlMs) {
      return cached.address;
    }

    // Fetch from Consul
    const address = await this.consulService.getServiceAddress(serviceName);

    // Update cache
    this.addressCache.set(serviceName, {
      address,
      timestamp: now,
    });

    this.logger.debug(
      `Resolved ${serviceName} to ${address.host}:${address.port}`,
    );
    return address;
  }

  /**
   * Create a TCP ClientProxy for a service
   * The client is cached and reused for subsequent calls
   */
  async createTcpClient(serviceName: string): Promise<ClientProxy> {
    // Check if we already have a connected client
    const existingClient = this.clientCache.get(serviceName);
    if (existingClient) {
      return existingClient;
    }

    const { host, port } = await this.getServiceAddress(serviceName);

    const client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { host, port },
    });

    // Connect the client
    await client.connect();

    // Cache the client
    this.clientCache.set(serviceName, client);

    this.logger.log(`Created TCP client for ${serviceName} at ${host}:${port}`);
    return client;
  }

  /**
   * Get a TCP client, reconnecting if the connection failed
   */
  async getTcpClient(serviceName: string): Promise<ClientProxy> {
    try {
      return await this.createTcpClient(serviceName);
    } catch (error) {
      this.logger.warn(
        `Failed to get client for ${serviceName}, refreshing address: ${error.message}`,
      );

      // Clear caches and retry with fresh address
      this.clientCache.delete(serviceName);
      this.addressCache.delete(serviceName);

      const { host, port } = await this.getServiceAddress(serviceName, true);

      const client = ClientProxyFactory.create({
        transport: Transport.TCP,
        options: { host, port },
      });

      await client.connect();
      this.clientCache.set(serviceName, client);

      return client;
    }
  }

  /**
   * Clear all cached addresses and clients
   */
  async clearCache(): Promise<void> {
    // Close all client connections
    for (const [name, client] of this.clientCache) {
      try {
        await client.close();
        this.logger.debug(`Closed client for ${name}`);
      } catch (error) {
        this.logger.warn(`Error closing client for ${name}: ${error.message}`);
      }
    }

    this.clientCache.clear();
    this.addressCache.clear();
  }

  /**
   * Invalidate cache for a specific service
   */
  async invalidateService(serviceName: string): Promise<void> {
    const client = this.clientCache.get(serviceName);
    if (client) {
      try {
        await client.close();
      } catch (error) {
        this.logger.warn(
          `Error closing client for ${serviceName}: ${error.message}`,
        );
      }
      this.clientCache.delete(serviceName);
    }
    this.addressCache.delete(serviceName);
  }
}
