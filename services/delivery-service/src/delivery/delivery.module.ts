import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DeliveryConsumer } from './delivery.consumer';
import { DeliveryProducer } from './delivery.producer';
import { DeliveryService } from './delivery.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'delivery-producer',
            brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
            retry: {
              retries: 8,
              initialRetryTime: 300,
              maxRetryTime: 30000,
            },
          },
          producer: {
            allowAutoTopicCreation: true,
            transactionTimeout: 30000,
          },
        },
      },
    ]),
  ],
  controllers: [DeliveryConsumer],
  providers: [DeliveryService, DeliveryProducer],
})
export class DeliveryModule {}