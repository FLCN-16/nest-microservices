import { All, Controller, Get, Param, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
    console.log('AppController instantiated');
  }

  @Get('api/health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  // REST API Proxies
  @All(['api/:version/:service', 'api/:version/:service/*path'])
  proxyServiceRest(
    @Param('service') service: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.appService.proxyRequest(service, req, res, false);
  }

  // GraphQL Proxies - /graphql/{service}
  @All('graphql/:service')
  proxyServiceGraphQL(
    @Param('service') service: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.appService.proxyRequest(service, req, res, true);
  }
}
