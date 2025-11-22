import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Create hybrid application (HTTP + Kafka)
  const app = await NestFactory.create(AppModule);

  // Configure Kafka microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'delivery-service',
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
        retry: {
          retries: 8,
          initialRetryTime: 300,
          maxRetryTime: 30000,
        },
      },
      consumer: {
        groupId: 'delivery-consumer-group',
        allowAutoTopicCreation: true,
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  });

  await app.startAllMicroservices();
  
  const port = process.env.PORT || 3002;
  await app.listen(port);

  logger.log(`Delivery Service started | Port: ${port} | Kafka: ${process.env.KAFKA_BROKER || 'localhost:9092'}`);
  logger.log(`Consumer: orders | Producer: deliveries`);
}

bootstrap();