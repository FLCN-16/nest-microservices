import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateNotificationDto,
  NotificationType,
} from '@the-falcon/notifications';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async getNotifications(userId: string) {
    return this.notificationRepository.find({ where: { userId } });
  }

  async handleNotification(payload: CreateNotificationDto) {
    this.logger.log(
      `Received notification request: ${JSON.stringify(payload)}`,
    );

    const recipients = Array.isArray(payload.recipient)
      ? payload.recipient
      : [payload.recipient];

    for (const recipient of recipients) {
      try {
        await this.processNotification(payload.type, recipient, payload);
      } catch (error) {
        this.logger.error(
          `Failed to send ${payload.type} notification to ${recipient}`,
          error,
        );
      }
    }
  }

  private async processNotification(
    type: NotificationType,
    recipient: string,
    payload: CreateNotificationDto,
  ) {
    switch (type) {
      case NotificationType.EMAIL:
        await this.sendEmail(recipient, payload);
        break;
      case NotificationType.PUSH:
        await this.sendPush(recipient, payload);
        break;
      case NotificationType.SMS:
        await this.sendSms(recipient, payload);
        break;
      case NotificationType.IN_APP:
        await this.saveInAppNotification(recipient, payload);
        break;
      default:
        this.logger.warn(`Unsupported notification type: ${type}`);
    }
  }

  private async sendEmail(recipient: string, payload: CreateNotificationDto) {
    this.logger.log(
      `[EMAIL] Sending email to ${recipient}: ${payload.subject} - ${payload.content}`,
    );
    // implementation for email sending
  }

  private async sendPush(recipient: string, payload: CreateNotificationDto) {
    this.logger.log(
      `[PUSH] Sending push notification to ${recipient}: ${payload.content}`,
    );
    // implementation for push notification
  }

  private async sendSms(recipient: string, payload: CreateNotificationDto) {
    this.logger.log(`[SMS] Sending SMS to ${recipient}: ${payload.content}`);
    // implementation for SMS
  }

  private async saveInAppNotification(
    recipient: string,
    payload: CreateNotificationDto,
  ) {
    this.logger.log(
      `[IN_APP] Saving notification for ${recipient}: ${payload.content}`,
    );
    const notification = this.notificationRepository.create({
      recipient,
      userId: payload.userId,
      content: payload.content,
      subject: payload.subject,
      metadata: payload.metadata,
    });
    await this.notificationRepository.save(notification);
  }
}
