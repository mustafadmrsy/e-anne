/**
 * Payment Manager - Payment Operations with Shopier
 * SOLID: Single Responsibility - Only payment operations
 */

import { BaseManager } from './base.manager';
import type {
  PaymentRecord,
  PaymentRequest,
  PaymentResponse,
  ShopierConfig,
  ShopierFormData
} from '@/lib/models';
import { PaymentProvider } from '@/lib/models';
import { PaymentStatus, Currency } from '@/lib/models';
import crypto from 'crypto';

export class PaymentManager extends BaseManager<PaymentRecord> {
  private shopierConfig: ShopierConfig;
  private shopierUrl = 'https://www.shopier.com/ShowProduct/api_pay4.php';

  constructor() {
    super('payments');
    
    // Load Shopier config from environment
    this.shopierConfig = {
      apiKey: process.env.SHOPIER_API_KEY || '',
      apiSecret: process.env.SHOPIER_API_SECRET || '',
      websiteIndex: parseInt(process.env.SHOPIER_WEBSITE_INDEX || '1')
    };
  }

  /**
   * Create payment with Shopier
   */
  async createPayment(
    request: PaymentRequest,
    provider: PaymentProvider = PaymentProvider.SHOPIER
  ): Promise<PaymentResponse> {
    if (provider !== PaymentProvider.SHOPIER) {
      return {
        success: false,
        error: 'Only Shopier is currently supported'
      };
    }

    try {
      // Create payment record
      const paymentId = `payment_${Date.now()}`;
      const paymentData: Omit<PaymentRecord, 'id'> = {
        orderId: request.orderId,
        provider,
        amount: request.amount,
        currency: request.currency,
        customer: request.customer,
        items: request.items,
        billingAddress: request.billingAddress,
        shippingAddress: request.shippingAddress,
        status: PaymentStatus.PENDING,
        metadata: request.metadata,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.create(paymentId, paymentData);

      // Generate Shopier form
      const formData = this.generateShopierForm(request);

      // Update payment record with provider data
      await this.update(paymentId, {
        providerResponse: { formData }
      });

      return {
        success: true,
        paymentUrl: this.shopierUrl,
        paymentForm: this.generateShopierFormHTML(formData),
        transactionId: paymentId,
        message: 'Payment form generated successfully'
      };

    } catch (error) {
      console.error('Payment creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed'
      };
    }
  }

  /**
   * Verify payment from webhook
   */
  async verifyPayment(
    orderId: string,
    webhookData: any
  ): Promise<boolean> {
    try {
      // Get payment record
      const payments = await this.query({
        filters: [{ field: 'orderId', operator: '==', value: orderId }]
      });

      if (payments.length === 0) {
        return false;
      }

      const payment = payments[0];

      // Verify signature
      const isValid = this.verifyShopierSignature(webhookData);

      if (!isValid) {
        return false;
      }

      // Update payment status
      const status = webhookData.status === 'success'
        ? PaymentStatus.COMPLETED
        : PaymentStatus.FAILED;

      await this.update(payment.id, {
        status,
        transactionId: webhookData.payment_id || webhookData.platform_order_id,
        webhookData,
        paidAt: status === PaymentStatus.COMPLETED ? new Date() : undefined
      });

      return status === PaymentStatus.COMPLETED;

    } catch (error) {
      console.error('Payment verification failed:', error);
      return false;
    }
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: string): Promise<PaymentRecord | null> {
    const payments = await this.query({
      filters: [{ field: 'orderId', operator: '==', value: orderId }]
    });

    return payments.length > 0 ? payments[0] : null;
  }

  /**
   * Generate Shopier form data
   */
  private generateShopierForm(request: PaymentRequest): ShopierFormData {
    const randomNr = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    
    const productNames = request.items
      .map(item => `${item.name} x${item.quantity}`)
      .join(', ');

    const formData: Omit<ShopierFormData, 'signature'> = {
      API_key: this.shopierConfig.apiKey,
      website_index: this.shopierConfig.websiteIndex || 1,
      platform_order_id: request.orderId,
      product_name: productNames.substring(0, 255), // Shopier limit
      product_type: 0,
      buyer_name: request.customer.firstName,
      buyer_surname: request.customer.lastName,
      buyer_email: request.customer.email,
      buyer_account_age: 0,
      buyer_id_nr: request.customer.userId || request.orderId,
      buyer_phone: request.customer.phone || '',
      billing_address: request.billingAddress?.street || '',
      billing_city: request.billingAddress?.city || '',
      billing_country: request.billingAddress?.country || 'Türkiye',
      billing_postcode: request.billingAddress?.postalCode || '',
      shipping_address: request.shippingAddress?.street || '',
      shipping_city: request.shippingAddress?.city || '',
      shipping_country: request.shippingAddress?.country || 'Türkiye',
      shipping_postcode: request.shippingAddress?.postalCode || '',
      total_order_value: request.amount,
      currency: request.currency === Currency.TRY ? '0' : '1',
      platform: 0,
      is_in_frame: 0,
      current_language: 0,
      modul_version: '1.0.0',
      random_nr: randomNr
    };

    // Generate signature
    const signatureData = `${randomNr}${request.orderId}${request.amount}${formData.currency}`;
    const signature = crypto
      .createHmac('sha256', this.shopierConfig.apiSecret)
      .update(signatureData)
      .digest('base64');

    return {
      ...formData,
      signature
    };
  }

  /**
   * Generate HTML form for Shopier
   */
  private generateShopierFormHTML(formData: ShopierFormData): string {
    const inputs = Object.entries(formData)
      .map(([key, value]) => 
        `<input type="hidden" name="${key}" value="${value}">`
      )
      .join('\n');

    return `
      <form id="shopier-payment-form" action="${this.shopierUrl}" method="POST">
        ${inputs}
      </form>
    `;
  }

  /**
   * Verify Shopier webhook signature
   */
  private verifyShopierSignature(webhookData: any): boolean {
    try {
      const { signature, random_nr, platform_order_id, total_order_value, currency } = webhookData;
      
      if (!signature) return false;

      const data = `${random_nr}${platform_order_id}${total_order_value}${currency}`;
      const calculatedSignature = crypto
        .createHmac('sha256', this.shopierConfig.apiSecret)
        .update(data)
        .digest('base64');

      return signature === calculatedSignature;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Check if Shopier is configured
   */
  isConfigured(): boolean {
    return !!(this.shopierConfig.apiKey && this.shopierConfig.apiSecret);
  }
}

// Singleton instance
let paymentManagerInstance: PaymentManager | null = null;

export function getPaymentManager(): PaymentManager {
  if (!paymentManagerInstance) {
    paymentManagerInstance = new PaymentManager();
  }
  return paymentManagerInstance;
}
