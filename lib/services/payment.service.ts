/**
 * Payment Service - Frontend API Client for Payment Operations
 * SOLID: Single Responsibility - Only payment API calls
 */

export interface PaymentResponse {
  success: boolean;
  data?: {
    paymentUrl?: string;
    paymentForm?: string;
    transactionId?: string;
  };
  message?: string;
  error?: string;
}

class PaymentService {
  private baseUrl = '/api/payment';

  /**
   * Create payment for order
   */
  async createPayment(orderId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ orderId })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Payment creation failed'
        };
      }

      return data;
    } catch (error) {
      console.error('Payment creation error:', error);
      return {
        success: false,
        error: 'Failed to create payment'
      };
    }
  }

  /**
   * Submit payment form
   * Renders and auto-submits Shopier payment form
   */
  submitPaymentForm(paymentForm: string): void {
    // Create temporary container
    const container = document.createElement('div');
    container.innerHTML = paymentForm;
    container.style.display = 'none';
    document.body.appendChild(container);

    // Get form and submit
    const form = container.querySelector('form');
    if (form) {
      document.body.appendChild(form);
      form.submit();
    }
  }

  /**
   * Redirect to payment URL
   */
  redirectToPayment(paymentUrl: string): void {
    window.location.href = paymentUrl;
  }

  /**
   * Complete payment flow
   * Creates payment and handles redirect
   */
  async initiatePayment(orderId: string): Promise<void> {
    try {
      const result = await this.createPayment(orderId);

      if (!result.success) {
        throw new Error(result.error || 'Payment creation failed');
      }

      // Handle payment form
      if (result.data?.paymentForm) {
        this.submitPaymentForm(result.data.paymentForm);
      } 
      // Or redirect to payment URL
      else if (result.data?.paymentUrl) {
        this.redirectToPayment(result.data.paymentUrl);
      } else {
        throw new Error('No payment method available');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      throw error;
    }
  }
}

// Singleton instance
let paymentServiceInstance: PaymentService | null = null;

export function getPaymentService(): PaymentService {
  if (!paymentServiceInstance) {
    paymentServiceInstance = new PaymentService();
  }
  return paymentServiceInstance;
}

export default PaymentService;
