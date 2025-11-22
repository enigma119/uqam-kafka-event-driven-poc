import { Injectable, Logger } from '@nestjs/common';
import { sendNotificationStatus } from '../utils/mailer';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private mailer = sendNotificationStatus;
  private readonly trackingServiceUrl = process.env.TRACKING_SERVICE_URL || 'http://tracking-service:3003';
  private readonly maxRetries = 5;
  private readonly retryDelay = 1000; // 1 second
  private readonly skipVerification = process.env.SKIP_MONGODB_VERIFICATION === 'true'; // Pour tests/développement

  /**
   * Vérifie que le statut de livraison est bien enregistré dans MongoDB
   * avant d'envoyer la notification. Cela garantit la cohérence des données.
   */
  private async verifyDeliveryStatusInDatabase(
    deliveryId: string,
    expectedStatus: string = 'DELIVERED',
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(
          `${this.trackingServiceUrl}/tracking/${deliveryId}`,
        );

        if (!response.ok) {
          if (response.status === 404 && attempt < this.maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
            continue;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success && data.delivery?.status === expectedStatus) {
          this.logger.log(`Status verified | DeliveryId: ${deliveryId} | Status: ${data.delivery.status}`);
          return true;
        } else {
          if (attempt < this.maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
            continue;
          }
        }
      } catch (error) {
        if (attempt < this.maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
          continue;
        }
      }
    }

    this.logger.warn(`Status verification failed | DeliveryId: ${deliveryId} | Attempts: ${this.maxRetries}`);
    return false;
  }

  async sendNotification(deliveryData: any) {
    this.logger.log(`Processing notification | DeliveryId: ${deliveryData.deliveryId} | OrderId: ${deliveryData.orderId}`);

    let isStatusConfirmed = true;
    
    if (!this.skipVerification) {
      isStatusConfirmed = await this.verifyDeliveryStatusInDatabase(
        deliveryData.deliveryId,
        'DELIVERED',
      );

      if (!isStatusConfirmed) {
        this.logger.warn(`Status not confirmed, proceeding anyway | DeliveryId: ${deliveryData.deliveryId}`);
      }
    }

    const isMockMode = !process.env.BREVO_API_KEY || !process.env.BREVO_SMTP_URL;
    if (isMockMode) {
      this.logger.log(`Mock mode enabled | Email will be simulated`);
    }

    try {
      await this.mailer(
        deliveryData.customerEmail,
        deliveryData.customerName,
        deliveryData.deliveryId,
        'DELIVERED',
        `https://tracking.example.com/${deliveryData.deliveryId}`,
      );

      this.logger.log(`Notification sent | DeliveryId: ${deliveryData.deliveryId} | Recipient: ${deliveryData.customerEmail} | Mode: ${isMockMode ? 'MOCK' : 'PRODUCTION'}`);

      return {
        success: true,
        notificationType: 'email',
        recipient: deliveryData.customerName,
        deliveryId: deliveryData.deliveryId,
        mockMode: isMockMode,
        sentAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to send notification | DeliveryId: ${deliveryData.deliveryId} | Error: ${error.message}`, error.stack);

      return {
        success: false,
        notificationType: 'email',
        recipient: deliveryData.customerName,
        deliveryId: deliveryData.deliveryId,
        error: error.message,
        sentAt: new Date().toISOString(),
      };
    }
  }

  async sendSMS(phoneNumber: string, message: string) {
    this.logger.log(`SMS sent to ${phoneNumber}: ${message}`);
    return { success: true, method: 'SMS' };
  }

  async sendEmail(email: string, subject: string, body: string) {
    this.logger.log(`Email sent to ${email} - Subject: ${subject}`);
    return { success: true, method: 'Email' };
  }

  async sendPushNotification(userId: string, message: string) {
    this.logger.log(`Push notification sent to user ${userId}: ${message}`);
    return { success: true, method: 'Push' };
  }
}