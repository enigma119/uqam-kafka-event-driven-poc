import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeliveryDocument = Delivery & Document;

@Schema({ timestamps: true })
export class Delivery {
  @Prop({ required: true, unique: true })
  deliveryId: string;

  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  status: string;

  @Prop({ type: [String], default: [] })
  items: string[];

  @Prop()
  startedAt: string;

  @Prop()
  completedAt: string;

  @Prop({ type: [String], default: [] })
  statusHistory: string[];

  // Timestamps are automatically added by Mongoose when timestamps: true
  // but we need to declare them for TypeScript
  createdAt?: Date;
  updatedAt?: Date;
}

export const DeliverySchema = SchemaFactory.createForClass(Delivery);