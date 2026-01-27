import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Request, Response } from 'express';
import { ConsulService } from '@the-falcon/common';
import { firstValueFrom } from 'rxjs';
import { MicroserviceClient } from './proxies';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly consulService: ConsulService,
    private readonly microserviceClient: MicroserviceClient,
  ) {}

  async proxyRequest(
    serviceName: string,
    req: Request,
    res: Response,
    isGraphQL: boolean,
  ): Promise<void> {
    try {
      // Dynamic lookup via Consul
      const serviceUrl = await this.consulService.getServiceUrl(serviceName);

      this.logger.debug(`Resolved ${serviceName} to ${serviceUrl}`);

      // Build target URL
      let targetPath: string;

      // Check for Device ID header (Security)
      const deviceId = req.headers['x-device-id'];
      if (!deviceId) {
        throw new Error('Missing X-Device-ID header');
      }

      if (isGraphQL) {
        // GraphQL: /graphql/{service} -> {service_url}/graphql
        targetPath = '/graphql';
      } else {
        // REST: /api/{version}/{service}/* -> {service_url}/{version}/{service}/*
        targetPath = req.path.replace(/^\/api/, '');
      }

      const targetUrl = `${serviceUrl}${targetPath}`;
      const gatewaySecret = process.env.GATEWAY_SECRET;

      this.logger.log(`Proxying ${req.method} ${req.path} -> ${targetUrl}`);

      // Filter out headers that shouldn't be forwarded
      const forwardedHeaders: Record<string, any> = {};
      const excludeHeaders = [
        'host',
        'content-length',
        'transfer-encoding',
        'connection',
      ];

      Object.entries(req.headers).forEach(([key, value]) => {
        if (!excludeHeaders.includes(key.toLowerCase())) {
          forwardedHeaders[key] = value;
        }
      });

      // Forward the request
      const response = await firstValueFrom(
        this.httpService.request({
          method: req.method,
          url: targetUrl,
          data: req.body,
          headers: {
            ...forwardedHeaders,
            'content-type': req.headers['content-type'] || 'application/json',
            'x-device-id': deviceId, // Ensure it's forwarded
            'x-gateway-secret': gatewaySecret, // Inject secret
          },
          params: req.query,
          validateStatus: () => true, // Don't throw on any status code
          timeout: 30000, // 30 second timeout
        }),
      );

      this.logger.debug(
        `Response from ${serviceName}: status=${response.status}`,
      );

      // Forward response
      res.status(response.status);

      // Only forward safe response headers
      const safeResponseHeaders = ['content-type', 'x-request-id'];
      Object.entries(response.headers).forEach(([key, value]) => {
        if (
          safeResponseHeaders.includes(key.toLowerCase()) ||
          key.startsWith('x-')
        ) {
          res.setHeader(key, value as string);
        }
      });

      res.send(response.data);
    } catch (error) {
      this.logger.error(`Proxy error for ${serviceName}:`, error.message);

      if (error.message === 'Missing X-Device-ID header') {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Missing X-Device-ID header',
        });
        return;
      }

      res.status(502).json({
        error: 'Bad Gateway',
        message: `Failed to reach ${serviceName} service`,
        details: error.message,
      });
    }
  }

  async proxyTcp(payload: {
    service: string;
    cmd: string;
    data: any;
  }): Promise<any> {
    const { service, cmd, data } = payload;
    console.log(`Gateway proxying TCP to ${service} [cmd=${cmd}]`);
    this.logger.debug(`Proxying TCP request to ${service} with cmd: ${cmd}`);

    try {
      const result = await this.microserviceClient.send(service, cmd, data);
      console.log(`Gateway received TCP response from ${service}`);
      return result;
    } catch (error) {
      console.log(`Gateway TCP proxy error: ${error.message}`);
      this.logger.error(`TCP Proxy error for ${service}:`, error.message);
      throw error;
    }
  }
}
