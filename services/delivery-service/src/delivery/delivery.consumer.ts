import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, KafkaContext } from '@nestjs/microservices';
import { DeliveryService } from './delivery.service';

@Controller()
export class DeliveryConsumer {
  private readonly logger = new Logger(DeliveryConsumer.name);

  constructor(private readonly deliveryService: DeliveryService) {}

  @EventPattern('orders')
  async handleOrderCreated(@Payload() event: any, @Ctx() context: KafkaContext) {
    try {
      if (event.eventType === 'order.created') {
        this.logger.log(`Event received: order.created | OrderId: ${event.data.orderId} | Topic: ${context.getTopic()}`);
        
        await this.deliveryService.startDelivery(event.data);
        
        this.logger.log(`Order processed | OrderId: ${event.data.orderId}`);
      } else {
        this.logger.debug(`Event ignored | Type: ${event.eventType}`);
      }
    } catch (error) {
      this.logger.error(`Error processing event | Type: ${event?.eventType} | Error: ${error.message}`, error.stack);
    }
  }
}