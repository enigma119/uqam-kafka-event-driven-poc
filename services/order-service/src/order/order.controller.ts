import { Controller, Post, Body, Logger, Get } from '@nestjs/common';
import { OrderService } from './order.service';

@Controller('orders')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Get()
  getStatus() {
    return {
      service: 'Order Service',
      status: 'running',
      timestamp: new Date().toISOString(),
    };
  }

  @Post()
  async createOrder(@Body() orderData: { customerName: string;  customerEmail: string, items: string[] }) {
    this.logger.log(`Order creation request | Customer: ${orderData.customerName} | Items: ${orderData.items.length}`);
    
    const order = await this.orderService.createOrder(orderData);
    
    this.logger.log(`Order created | OrderId: ${order.orderId} | Customer: ${orderData.customerName}`);
    
    return order;
  }
}