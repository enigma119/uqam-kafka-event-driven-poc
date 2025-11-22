import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Delivery, DeliveryDocument } from './schemas/delivery.schema';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    @InjectModel(Delivery.name) private deliveryModel: Model<DeliveryDocument>,
  ) {}

  async updateDeliveryStatus(deliveryData: any, status: string) {
    const existingDelivery = await this.deliveryModel.findOne({
      deliveryId: deliveryData.deliveryId,
    });

    const statusEntry = `${status} at ${new Date().toISOString()}`;

    if (existingDelivery) {
      existingDelivery.status = status;
      existingDelivery.statusHistory.push(statusEntry);
      
      if (status === 'IN_TRANSIT' && deliveryData.startedAt) {
        existingDelivery.startedAt = deliveryData.startedAt;
      } else if (status === 'DELIVERED' && deliveryData.completedAt) {
        existingDelivery.completedAt = deliveryData.completedAt;
      }

      await existingDelivery.save();
      this.logger.log(`Delivery status updated | DeliveryId: ${deliveryData.deliveryId} | Status: ${status}`);
    } else {
      const newDelivery = new this.deliveryModel({
        deliveryId: deliveryData.deliveryId,
        orderId: deliveryData.orderId,
        customerName: deliveryData.customerName || 'Unknown',
        status,
        items: deliveryData.items || [],
        statusHistory: [statusEntry],
        ...(deliveryData.startedAt && { startedAt: deliveryData.startedAt }),
        ...(deliveryData.completedAt && { completedAt: deliveryData.completedAt }),
      });

      await newDelivery.save();
      this.logger.log(`Delivery record created | DeliveryId: ${deliveryData.deliveryId} | Status: ${status}`);
    }
  }

  async getAllDeliveries() {
    return this.deliveryModel.find().sort({ createdAt: -1 }).exec();
  }

  async getDeliveryById(deliveryId: string) {
    return this.deliveryModel.findOne({ deliveryId }).exec();
  }
}