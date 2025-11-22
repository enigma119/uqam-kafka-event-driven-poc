import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService implements OnModuleInit {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    try {
      await this.kafkaClient.connect();
      this.logger.log('Kafka producer connected');
    } catch (error) {
      this.logger.error('Failed to connect to Kafka', error);
      throw error;
    }
  }

  async createOrder(orderData: { customerName: string; customerEmail: string, items: string[] }) {
    const order = {
      orderId: uuidv4(),
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      items: orderData.items,
      status: 'CREATED',
      createdAt: new Date().toISOString(),
    };

    const event = {
      eventType: 'order.created',
      timestamp: new Date().toISOString(),
      data: order,
    };

    this.kafkaClient.emit('orders', {
      key: order.orderId,
      value: JSON.stringify(event),
    });

    this.logger.log(`Event published: order.created | OrderId: ${order.orderId} | Topic: orders`);

    return order;
  }

  async onModuleDestroy() {
    await this.kafkaClient.close();
    this.logger.log('Kafka producer disconnected');
  }
}