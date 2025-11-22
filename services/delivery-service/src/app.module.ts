import { Module } from '@nestjs/common';
import { DeliveryModule } from './delivery/delivery.module';

@Module({
  imports: [DeliveryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}