export enum NotificationType {
  EMAIL = "email",
  PUSH = "push",
  SMS = "sms",
  IN_APP = "in_app",
}

export class CreateNotificationDto {
  type: NotificationType;
  recipient: string | string[];
  subject?: string;
  content: string;
  metadata?: Record<string, any>;
  userId?: string;
}
