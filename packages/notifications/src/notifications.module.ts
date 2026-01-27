import { Module, Global } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { NotificationsUtilService } from "./notifications.service";

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: "NOTIFICATIONS_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672",
          ],
          queue: "notifications_queue",
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [NotificationsUtilService],
  exports: [NotificationsUtilService],
})
export class NotificationsModule {}
