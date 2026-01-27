import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { DiscoveryService } from '@the-falcon/common';
import { firstValueFrom, timeout, retry, catchError } from 'rxjs';

/**
 * Generic MicroserviceClient for TCP-based inter-service communication.
 *
 * This client dynamically discovers and connects to any registered microservice
 * via Consul, maintaining a connection pool for efficiency.
 *
 * @example
 * // Request/response pattern
 * const user = await this.microserviceClient.send('auth', { cmd: 'get_user' }, { id: '123' });
 *
 * // Fire-and-forget event
 * this.microserviceClient.emit('feed', 'user_created', { userId: '123' });
 */
@Injectable()
export class MicroserviceClient implements OnModuleDestroy {
  private readonly logger = new Logger(MicroserviceClient.name);
  private readonly clients = new Map<string, ClientProxy>();
  private readonly connectionPromises = new Map<string, Promise<ClientProxy>>();

  constructor(private readonly discoveryService: DiscoveryService) {}

  /**
   * Send a request to a microservice and wait for response.
   * Includes automatic retry (2 attempts) and timeout (5 seconds).
   */
  async send<TResult = any, TInput = any>(
    serviceName: string,
    pattern: string | object,
    data: TInput,
    options?: { timeout?: number; retries?: number },
  ): Promise<TResult> {
    const client = await this.getClient(serviceName);
    const timeoutMs = options?.timeout ?? 5000;
    const retries = options?.retries ?? 2;

    return firstValueFrom(
      client.send<TResult>(pattern, data).pipe(
        timeout(timeoutMs),
        retry(retries),
        catchError((error) => {
          this.logger.error(
            `Error calling ${serviceName} with pattern ${JSON.stringify(pattern)}: ${error.message}`,
          );
          // Invalidate client on connection errors to force reconnection
          if (
            error.message?.includes('connect') ||
            error.message?.includes('ECONNREFUSED')
          ) {
            this.invalidateClient(serviceName);
          }
          throw error;
        }),
      ),
    );
  }

  /**
   * Emit an event to a microservice (fire-and-forget).
   * Does not wait for acknowledgment.
   */
  async emit<TInput = any>(
    serviceName: string,
    pattern: string | object,
    data: TInput,
  ): Promise<void> {
    const client = await this.getClient(serviceName);
    client.emit(pattern, data);
  }

  /**
   * Get or create a TCP client for a service.
   * Uses connection pooling to reuse existing connections.
   */
  private async getClient(serviceName: string): Promise<ClientProxy> {
    // Return existing client if available
    const existing = this.clients.get(serviceName);
    if (existing) {
      return existing;
    }

    // Check if connection is already in progress (prevent race conditions)
    const pending = this.connectionPromises.get(serviceName);
    if (pending) {
      return pending;
    }

    // Create new connection
    const connectionPromise = this.createClient(serviceName);
    this.connectionPromises.set(serviceName, connectionPromise);

    try {
      const client = await connectionPromise;
      this.clients.set(serviceName, client);
      return client;
    } finally {
      this.connectionPromises.delete(serviceName);
    }
  }

  private async createClient(serviceName: string): Promise<ClientProxy> {
    try {
      const client = await this.discoveryService.createTcpClient(serviceName);
      this.logger.log(`Connected to ${serviceName} service via TCP`);
      return client;
    } catch (error) {
      this.logger.error(
        `Failed to connect to ${serviceName}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Invalidate a client connection (forces reconnection on next call)
   */
  private async invalidateClient(serviceName: string): Promise<void> {
    const client = this.clients.get(serviceName);
    if (client) {
      try {
        await client.close();
      } catch (error) {
        this.logger.warn(
          `Error closing client for ${serviceName}: ${error.message}`,
        );
      }
      this.clients.delete(serviceName);
    }
    await this.discoveryService.invalidateService(serviceName);
    this.logger.debug(`Invalidated client for ${serviceName}`);
  }

  /**
   * Cleanup all connections on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Closing all microservice connections...');
    for (const [name, client] of this.clients) {
      try {
        await client.close();
        this.logger.debug(`Closed connection to ${name}`);
      } catch (error) {
        this.logger.warn(`Error closing ${name}: ${error.message}`);
      }
    }
    this.clients.clear();
  }
}
