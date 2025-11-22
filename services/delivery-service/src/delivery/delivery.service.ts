import { Injectable, Logger } from '@nestjs/common';
import { DeliveryProducer } from './delivery.producer';

@Injectable()
export class DeliveryService {
  private readonly logger = new Logger(DeliveryService.name);

  constructor(private readonly deliveryProducer: DeliveryProducer) {}

  async startDelivery(orderData: any) {
    const deliveryId = `DLV-${orderData.orderId.substring(0, 8)}`;

    this.logger.log(`Delivery initiated | DeliveryId: ${deliveryId} | OrderId: ${orderData.orderId}`);

    await this.deliveryProducer.publishDeliveryStarted({
      deliveryId,
      orderId: orderData.orderId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      items: orderData.items,
      status: 'IN_TRANSIT',
      startedAt: new Date().toISOString(),
    });

    this.logger.log(`Delivery status: IN_TRANSIT | DeliveryId: ${deliveryId}`);

    setTimeout(async () => {
      await this.deliveryProducer.publishDeliveryCompleted({
        deliveryId,
        orderId: orderData.orderId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        status: 'DELIVERED',
        completedAt: new Date().toISOString(),
      });

      this.logger.log(`Delivery completed | DeliveryId: ${deliveryId} | OrderId: ${orderData.orderId}`);
    }, 5000);
  }
}