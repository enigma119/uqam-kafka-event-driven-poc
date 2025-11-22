import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'tracking-service',
        brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
        retry: {
          retries: 8,
          initialRetryTime: 300,
          maxRetryTime: 30000,
        },
      },
      consumer: {
        groupId: 'tracking-consumer-group',
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
  
  const port = process.env.PORT || 3003;
  await app.listen(port);

  logger.log(`Tracking Service started | Port: ${port} | Kafka: ${process.env.KAFKA_BROKER || 'localhost:9092'}`);
  logger.log(`MongoDB: ${process.env.MONGODB_URI ? 'connected' : 'mongodb://localhost:27017/delivery_tracking'} | Consumer: deliveries`);
}

bootstrap();