import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller('tcp')
export class TcpController {
  constructor(private readonly appService: AppService) {
    console.log('TcpController instantiated');
  }

  @MessagePattern({ cmd: 'health' })
  healthCheck() {
    return { status: 'ok', service: 'gateway' };
  }

  @MessagePattern('ping')
  ping() {
    console.log('TCP Controller received ping');
    return 'pong';
  }

  @MessagePattern({ cmd: 'gateway.proxy' })
  proxyServiceTcp(
    @Payload() payload: { service: string; cmd: string; data: any },
  ) {
    console.log(
      'TCP Controller received proxy request:',
      JSON.stringify(payload),
    );
    return this.appService.proxyTcp(payload);
  }
}
