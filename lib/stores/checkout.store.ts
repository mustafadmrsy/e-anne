/**
 * Checkout Store - Zustand State Management for Checkout
 * SOLID: Single Responsibility - Only checkout state management
 */

'use client';

import { create } from 'zustand';
import type { 
  CreateOrderPayload, 
  CustomerInfo, 
  Address 
} from '@/lib/models';
import { getCheckoutService, getPaymentService } from '@/lib/services';

interface CheckoutStore {
  // State
  step: 'customer' | 'shipping' | 'payment' | 'review';
  customerInfo: Partial<CustomerInfo>;
  billingAddress: Partial<Address>;
  shippingAddress: Partial<Address>;
  sameAsShipping: boolean;
  paymentMethod: string;
  customerNote: string;
  
  // Order state
  orderId: string | null;
  orderNumber: string | null;
  isProcessing: boolean;
  error: string | null;

  // Actions
  setStep: (step: CheckoutStore['step']) => void;
  setCustomerInfo: (info: Partial<CustomerInfo>) => void;
  setBillingAddress: (address: Partial<Address>) => void;
  setShippingAddress: (address: Partial<Address>) => void;
  setSameAsShipping: (same: boolean) => void;
  setPaymentMethod: (method: string) => void;
  setCustomerNote: (note: string) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  submitOrder: (cartId: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  step: 'customer' as const,
  customerInfo: {},
  billingAddress: {},
  shippingAddress: { country: 'Türkiye' },
  sameAsShipping: true,
  paymentMethod: 'credit_card',
  customerNote: '',
  orderId: null,
  orderNumber: null,
  isProcessing: false,
  error: null
};

export const useCheckoutStore = create<CheckoutStore>((set, get) => ({
  ...initialState,

  // Set current step
  setStep: (step) => set({ step }),

  // Set customer information
  setCustomerInfo: (info) => 
    set((state) => ({
      customerInfo: { ...state.customerInfo, ...info }
    })),

  // Set billing address
  setBillingAddress: (address) =>
    set((state) => ({
      billingAddress: { ...state.billingAddress, ...address }
    })),

  // Set shipping address
  setShippingAddress: (address) =>
    set((state) => ({
      shippingAddress: { ...state.shippingAddress, ...address }
    })),

  // Toggle same as shipping
  setSameAsShipping: (same) => set({ sameAsShipping: same }),

  // Set payment method
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  // Set customer note
  setCustomerNote: (note) => set({ customerNote: note }),

  // Go to next step
  goToNextStep: () => {
    const currentStep = get().step;
    const steps: CheckoutStore['step'][] = ['customer', 'shipping', 'payment', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      set({ step: steps[currentIndex + 1] });
    }
  },

  // Go to previous step
  goToPreviousStep: () => {
    const currentStep = get().step;
    const steps: CheckoutStore['step'][] = ['customer', 'shipping', 'payment', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      set({ step: steps[currentIndex - 1] });
    }
  },

  // Submit order
  submitOrder: async (cartId: string) => {
    const state = get();
    set({ isProcessing: true, error: null });

    try {
      // Prepare order payload
      const payload: CreateOrderPayload = {
        cartId,
        customer: state.customerInfo as CustomerInfo,
        billingAddress: state.billingAddress as Address,
        shippingAddress: state.sameAsShipping 
          ? state.billingAddress as Address
          : state.shippingAddress as Address,
        sameAsShipping: state.sameAsShipping,
        paymentMethod: state.paymentMethod,
        customerNote: state.customerNote || undefined
      };

      // Validate
      const checkoutService = getCheckoutService();
      const validation = checkoutService.validateCheckoutData(payload);

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      // Create order
      const result = await checkoutService.createOrder(payload);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Order creation failed');
      }

      set({
        orderId: result.data.orderId,
        orderNumber: result.data.orderNumber,
        isProcessing: false
      });

      // Initiate payment
      const paymentService = getPaymentService();
      await paymentService.initiatePayment(result.data.orderId);

    } catch (error) {
      console.error('Submit order error:', error);
      set({
        error: error instanceof Error ? error.message : 'Order submission failed',
        isProcessing: false
      });
      throw error;
    }
  },

  // Reset checkout state
  reset: () => set(initialState)
}));
