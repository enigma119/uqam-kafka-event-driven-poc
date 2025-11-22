import { Injectable, Inject, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class DeliveryProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DeliveryProducer.name);

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    try {
      await this.kafkaClient.connect();
      this.logger.log('Kafka producer connected');
    } catch (error) {
      this.logger.error('Failed to connect Kafka producer', error);
      throw error;
    }
  }

  async publishDeliveryStarted(delivery: any) {
    const event = {
      eventType: 'delivery.started',
      timestamp: new Date().toISOString(),
      data: delivery,
    };

    this.kafkaClient.emit('deliveries', {
      key: delivery.deliveryId,
      value: JSON.stringify(event),
    });

    this.logger.log(`Event published: delivery.started | DeliveryId: ${delivery.deliveryId} | Topic: deliveries`);
  }

  async publishDeliveryCompleted(delivery: any) {
    const event = {
      eventType: 'delivery.completed',
      timestamp: new Date().toISOString(),
      data: delivery,
    };

    this.kafkaClient.emit('deliveries', {
      key: delivery.deliveryId,
      value: JSON.stringify(event),
    });

    this.logger.log(`Event published: delivery.completed | DeliveryId: ${delivery.deliveryId} | Topic: deliveries`);
  }

  async onModuleDestroy() {
    await this.kafkaClient.close();
    this.logger.log('Kafka producer disconnected');
  }
}