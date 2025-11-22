import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrackingModule } from './tracking/tracking.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/delivery_tracking',
    ),
    TrackingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}