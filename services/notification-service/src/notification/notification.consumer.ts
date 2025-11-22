import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationConsumer {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(private readonly notificationService: NotificationService) {}

  @EventPattern('deliveries')
  async handleDeliveryCompleted(@Payload() message: any, @Ctx() context: KafkaContext) {
    try {
      if (message.eventType === 'delivery.completed') {
        this.logger.log(`Event received: delivery.completed | DeliveryId: ${message.data.deliveryId} | OrderId: ${message.data.orderId}`);
        
        await this.notificationService.sendNotification(message.data);
        
        this.logger.log(`Notification processed | DeliveryId: ${message.data.deliveryId}`);
      } else {
        this.logger.debug(`Event ignored | Type: ${message.eventType}`);
      }
    } catch (error) {
      this.logger.error(`Error processing notification event | Type: ${message?.eventType} | Error: ${error.message}`, error.stack);
    }
  }
}