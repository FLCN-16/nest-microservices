import { Controller, Get } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      service: 'auth',
      timestamp: new Date().toISOString(),
    };
  }

  @MessagePattern({ cmd: 'health' })
  tcpHealthCheck() {
    return { status: 'ok', service: 'auth' };
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
