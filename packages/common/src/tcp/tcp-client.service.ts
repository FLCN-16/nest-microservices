import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { DiscoveryService } from "../consul/discovery.service";
import { firstValueFrom, timeout, retry, catchError } from "rxjs";

/**
 * Options for TCP command execution
 */
export interface TcpCommandOptions {
  /** Timeout in milliseconds (default: 5000) */
  timeout?: number;
  /** Number of retries on failure (default: 2) */
  retries?: number;
}

/**
 * Typed TCP Client Service for inter-service communication.
 *
 * Provides typed methods for communicating with specific microservices
 * over TCP using NestJS microservices.
 *
 * @example
 * // Validate a token with auth service
 * const result = await tcpClient.sendAuthCommand('validate_token', { token: 'xxx' });
 *
 * // Get posts from feed service
 * const posts = await tcpClient.sendFeedCommand('get_posts', { userId: '123' });
 */
@Injectable()
export class TcpClientService implements OnModuleDestroy {
  private readonly logger = new Logger(TcpClientService.name);
  private readonly clients = new Map<string, ClientProxy>();
  private readonly connectionPromises = new Map<string, Promise<ClientProxy>>();

  constructor(private readonly discoveryService: DiscoveryService) {}

  /**
   * Send a command to the Auth service
   */
  async sendAuthCommand<TResult = any, TInput = any>(
    cmd: string,
    data: TInput,
    options?: TcpCommandOptions,
  ): Promise<TResult> {
    return this.sendCommand<TResult, TInput>("auth", cmd, data, options);
  }

  /**
   * Send a command to the Feed service
   */
  async sendFeedCommand<TResult = any, TInput = any>(
    cmd: string,
    data: TInput,
    options?: TcpCommandOptions,
  ): Promise<TResult> {
    return this.sendCommand<TResult, TInput>("feed", cmd, data, options);
  }

  /**
   * Send a command to the Media service
   */
  async sendMediaCommand<TResult = any, TInput = any>(
    cmd: string,
    data: TInput,
    options?: TcpCommandOptions,
  ): Promise<TResult> {
    return this.sendCommand<TResult, TInput>("media", cmd, data, options);
  }

  /**
   * Send a command to the Gateway service
   */
  async sendGatewayCommand<TResult = any, TInput = any>(
    cmd: string,
    data: TInput,
    options?: TcpCommandOptions,
  ): Promise<TResult> {
    return this.sendCommand<TResult, TInput>("gateway", cmd, data, options);
  }

  /**
   * Generic method to send a command to any service
   */
  async sendCommand<TResult = any, TInput = any>(
    serviceName: string,
    cmd: string,
    data: TInput,
    options?: TcpCommandOptions,
  ): Promise<TResult> {
    const client = await this.getClient(serviceName);
    const timeoutMs = options?.timeout ?? 5000;
    const retries = options?.retries ?? 2;

    return firstValueFrom(
      client.send<TResult>(cmd, data).pipe(
        timeout(timeoutMs),
        retry(retries),
        catchError((error) => {
          this.logger.error(
            `Error calling ${serviceName}.${cmd}: ${error.message}`,
          );
          // Invalidate client on connection errors to force reconnection
          if (
            error.message?.includes("connect") ||
            error.message?.includes("ECONNREFUSED")
          ) {
            this.invalidateClient(serviceName);
          }
          throw error;
        }),
      ),
    );
  }

  /**
   * Emit an event to a service (fire-and-forget)
   */
  async emit<TInput = any>(
    serviceName: string,
    event: string,
    data: TInput,
  ): Promise<void> {
    const client = await this.getClient(serviceName);
    client.emit(event, data);
  }

  /**
   * Get or create a TCP client for a service
   */
  private async getClient(serviceName: string): Promise<ClientProxy> {
    // Return existing client if available
    const existing = this.clients.get(serviceName);
    if (existing) {
      return existing;
    }

    // Check if connection is already in progress
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

  async onModuleDestroy(): Promise<void> {
    this.logger.log("Closing all TCP client connections...");
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
