import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CreateNotificationDto } from "./dtos/notification.dto";

@Injectable()
export class NotificationsUtilService {
  constructor(
    @Inject("NOTIFICATIONS_SERVICE") private readonly client: ClientProxy,
  ) {}

  sendNotification(payload: CreateNotificationDto) {
    return this.client.emit("send_notification", payload);
  }
}
