import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'notification-service',
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
        retry: {
          retries: 8,
          initialRetryTime: 300,
          maxRetryTime: 30000,
        },
      },
      consumer: {
        groupId: 'notification-consumer-group',
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
  
  const port = process.env.PORT || 3004;
  await app.listen(port);

  logger.log(`Notification Service started | Port: ${port} | Kafka: ${process.env.KAFKA_BROKER || 'localhost:9092'} | Consumer: deliveries`);
}

bootstrap();