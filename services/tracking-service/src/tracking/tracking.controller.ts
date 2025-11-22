import { Controller, Get, Param, Logger } from '@nestjs/common';
import { TrackingService } from './tracking.service';

@Controller('tracking')
export class TrackingController {
  private readonly logger = new Logger(TrackingController.name);

  constructor(private readonly trackingService: TrackingService) {}

  @Get()
  async getAllDeliveries() {
    const deliveries = await this.trackingService.getAllDeliveries();
    return {
      success: true,
      count: deliveries.length,
      deliveries: deliveries.map((delivery) => ({
        deliveryId: delivery.deliveryId,
        orderId: delivery.orderId,
        customerName: delivery.customerName,
        status: delivery.status,
        items: delivery.items,
        startedAt: delivery.startedAt,
        completedAt: delivery.completedAt,
        statusHistory: delivery.statusHistory,
        createdAt: delivery.createdAt,
        updatedAt: delivery.updatedAt,
      })),
    };
  }

  @Get(':deliveryId')
  async getDeliveryById(@Param('deliveryId') deliveryId: string) {
    const delivery = await this.trackingService.getDeliveryById(deliveryId);
    
    if (!delivery) {
      return {
        success: false,
        message: 'Delivery not found',
      };
    }

    return {
      success: true,
      delivery: {
        deliveryId: delivery.deliveryId,
        orderId: delivery.orderId,
        customerName: delivery.customerName,
        status: delivery.status,
        items: delivery.items,
        startedAt: delivery.startedAt,
        completedAt: delivery.completedAt,
        statusHistory: delivery.statusHistory,
        createdAt: delivery.createdAt,
        updatedAt: delivery.updatedAt,
      },
    };
  }

  @Get('order/:orderId')
  async getDeliveryByOrderId(@Param('orderId') orderId: string) {
    const deliveries = await this.trackingService.getAllDeliveries();
    const delivery = deliveries.find((d) => d.orderId === orderId);
    
    if (!delivery) {
      return {
        success: false,
        message: 'Delivery not found for this order',
      };
    }

    return {
      success: true,
      delivery: {
        deliveryId: delivery.deliveryId,
        orderId: delivery.orderId,
        customerName: delivery.customerName,
        status: delivery.status,
        items: delivery.items,
        startedAt: delivery.startedAt,
        completedAt: delivery.completedAt,
        statusHistory: delivery.statusHistory,
        createdAt: delivery.createdAt,
        updatedAt: delivery.updatedAt,
      },
    };
  }
}

