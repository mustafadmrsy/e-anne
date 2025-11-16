/**
 * Payment Models - Payment Integration Type Definitions
 * SOLID: Single Responsibility - Payment-related types only
 */

import { CustomerInfo, Address } from './order.model';

// Payment provider types
export enum PaymentProvider {
  SHOPIER = 'shopier',
  IYZICO = 'iyzico',
  STRIPE = 'stripe'
}

// Currency
export enum Currency {
  TRY = 'TRY',
  USD = 'USD',
  EUR = 'EUR'
}

// Payment item for provider
export interface PaymentItem {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity: number;
}

// Payment request to provider
export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: Currency;
  
  customer: CustomerInfo;
  
  items: PaymentItem[];
  
  billingAddress?: Address;
  shippingAddress?: Address;
  
  description?: string;
  
  // Return URLs
  returnUrl?: string;
  cancelUrl?: string;
  webhookUrl?: string;
  
  metadata?: Record<string, any>;
}

// Payment response from provider
export interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  paymentForm?: string;
  transactionId?: string;
  message?: string;
  error?: string;
  providerResponse?: any;
}

// Payment verification result
export interface PaymentVerification {
  isValid: boolean;
  orderId?: string;
  transactionId?: string;
  amount?: number;
  status?: PaymentStatus;
  data?: any;
  error?: string;
}

// Payment webhook data
export interface PaymentWebhookData {
  orderId: string;
  transactionId: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  customer: CustomerInfo;
  items?: PaymentItem[];
  metadata?: Record<string, any>;
  providerData?: any;
}

// Payment record in database
export interface PaymentRecord {
  id: string;
  orderId: string;
  transactionId?: string;
  
  provider: PaymentProvider;
  
  amount: number;
  currency: Currency;
  
  customer: CustomerInfo;
  items: PaymentItem[];
  
  billingAddress?: Address;
  shippingAddress?: Address;
  
  status: PaymentStatus;
  
  // Provider responses
  providerResponse?: any;
  webhookData?: any;
  
  metadata?: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

// Payment status from models
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

// Shopier specific types
export interface ShopierConfig {
  apiKey: string;
  apiSecret: string;
  websiteIndex?: number;
}

export interface ShopierPaymentParams {
  orderId: string;
  productName: string;
  amount: number;
  buyer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  billingAddress: Address;
  shippingAddress: Address;
}

export interface ShopierFormData {
  API_key: string;
  website_index: number;
  platform_order_id: string;
  product_name: string;
  product_type: number;
  buyer_name: string;
  buyer_surname: string;
  buyer_email: string;
  buyer_account_age: number;
  buyer_id_nr: string;
  buyer_phone: string;
  billing_address: string;
  billing_city: string;
  billing_country: string;
  billing_postcode: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  shipping_postcode: string;
  total_order_value: number;
  currency: string;
  platform: number;
  is_in_frame: number;
  current_language: number;
  modul_version: string;
  random_nr: number;
  signature: string;
}
