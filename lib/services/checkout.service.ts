/**
 * Checkout Service - Frontend API Client for Checkout Operations
 * SOLID: Single Responsibility - Only checkout API calls
 */

import type { Order, CreateOrderPayload } from '@/lib/models';

export interface CheckoutResponse {
  success: boolean;
  data?: {
    order: Order;
    orderId: string;
    orderNumber: string;
  };
  message?: string;
  error?: string;
}

class CheckoutService {
  private baseUrl = '/api/checkout';

  /**
   * Create order from cart
   */
  async createOrder(payload: CreateOrderPayload): Promise<CheckoutResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Checkout failed'
        };
      }

      return data;
    } catch (error) {
      console.error('Checkout error:', error);
      return {
        success: false,
        error: 'Failed to create order'
      };
    }
  }

  /**
   * Validate checkout data before submission
   */
  validateCheckoutData(payload: CreateOrderPayload): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Customer validation
    if (!payload.customer?.firstName?.trim()) {
      errors.push('Ad gereklidir');
    }
    if (!payload.customer?.lastName?.trim()) {
      errors.push('Soyad gereklidir');
    }
    if (!payload.customer?.email?.trim()) {
      errors.push('E-posta gereklidir');
    } else if (!this.isValidEmail(payload.customer.email)) {
      errors.push('Geçerli bir e-posta adresi giriniz');
    }
    if (!payload.customer?.phone?.trim()) {
      errors.push('Telefon numarası gereklidir');
    }

    // Billing address validation
    if (!payload.billingAddress?.street?.trim()) {
      errors.push('Fatura adresi gereklidir');
    }
    if (!payload.billingAddress?.city?.trim()) {
      errors.push('Fatura şehri gereklidir');
    }
    if (!payload.billingAddress?.district?.trim()) {
      errors.push('Fatura ilçesi gereklidir');
    }
    if (!payload.billingAddress?.postalCode?.trim()) {
      errors.push('Fatura posta kodu gereklidir');
    }

    // Shipping address validation
    if (!payload.shippingAddress?.street?.trim()) {
      errors.push('Teslimat adresi gereklidir');
    }
    if (!payload.shippingAddress?.city?.trim()) {
      errors.push('Teslimat şehri gereklidir');
    }
    if (!payload.shippingAddress?.district?.trim()) {
      errors.push('Teslimat ilçesi gereklidir');
    }
    if (!payload.shippingAddress?.postalCode?.trim()) {
      errors.push('Teslimat posta kodu gereklidir');
    }

    // Payment method validation
    if (!payload.paymentMethod) {
      errors.push('Ödeme yöntemi seçiniz');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Email validation helper
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Singleton instance
let checkoutServiceInstance: CheckoutService | null = null;

export function getCheckoutService(): CheckoutService {
  if (!checkoutServiceInstance) {
    checkoutServiceInstance = new CheckoutService();
  }
  return checkoutServiceInstance;
}

export default CheckoutService;
