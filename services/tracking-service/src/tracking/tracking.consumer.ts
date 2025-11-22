import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { TrackingService } from './tracking.service';

@Controller()
export class TrackingConsumer {
  private readonly logger = new Logger(TrackingConsumer.name);

  constructor(private readonly trackingService: TrackingService) {}

  @EventPattern('deliveries')
  async handleDeliveryEvents(@Payload() message: any, @Ctx() context: KafkaContext) {
    try {
      if (message.eventType === 'delivery.started') {
        this.logger.log(`Event received: delivery.started | DeliveryId: ${message.data.deliveryId} | OrderId: ${message.data.orderId}`);
        await this.trackingService.updateDeliveryStatus(message.data, 'IN_TRANSIT');
      } else if (message.eventType === 'delivery.completed') {
        this.logger.log(`Event received: delivery.completed | DeliveryId: ${message.data.deliveryId}`);
        await this.trackingService.updateDeliveryStatus(message.data, 'DELIVERED');
      } else {
        this.logger.debug(`Event ignored | Type: ${message.eventType}`);
      }
    } catch (error) {
      this.logger.error(`Error processing delivery event | Type: ${message?.eventType} | Error: ${error.message}`, error.stack);
    }
  }
}