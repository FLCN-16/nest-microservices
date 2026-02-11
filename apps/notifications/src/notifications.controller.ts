import { Controller, Get, UseGuards } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from '@the-falcon/notifications';
import { CurrentUser, TcpAuthGuard } from '@the-falcon/common';
import { IUser } from '@the-falcon/types';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get('health')
  healthCheck() {
    return { status: 'ok', service: 'notifications', timestamp: new Date().toISOString() };
  }

  @EventPattern('send_notification')
  async handleNotification(@Payload() data: CreateNotificationDto) {
    await this.notificationsService.handleNotification(data);
  }

  @UseGuards(TcpAuthGuard)
  @Get('notifications')
  async getNotifications(@CurrentUser() user: IUser) {
    return this.notificationsService.getNotifications(user.id);
  }
}
