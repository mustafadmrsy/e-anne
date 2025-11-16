/**
 * Order Models - Order and Payment Type Definitions
 * SOLID: Single Responsibility - Order-related types only
 */

import { CartItem, CartBundle } from './cart.model';

// Customer information
export interface CustomerInfo {
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ipAddress?: string;
}

// Address information
export interface Address {
  street: string;
  city: string;
  district: string;
  neighbourhood?: string;
  country: string;
  postalCode: string;
  additionalInfo?: string;
}

// Order item (snapshot from cart)
export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage: string;
  
  // Pricing at time of order
  unitPrice: number;
  totalPrice: number;
  
  quantity: number;
  
  // Variation if selected
  variationId?: string;
  variationName?: string;
  variationValue?: string;
  
  // Seller info
  sellerId: string;
  sellerName?: string;
}

// Order bundle (snapshot from cart)
export interface OrderBundle {
  id: string;
  bundleId: string;
  bundleName: string;
  items: OrderItem[];
  
  originalPrice: number;
  discountedPrice: number;
  discountAmount: number;
  
  quantity: number;
}

// Order status enum
export enum OrderStatus {
  PENDING = 'pending',
  PAYMENT_PENDING = 'payment_pending',
  PAYMENT_FAILED = 'payment_failed',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// Payment status
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

// Order
export interface Order {
  id: string;
  orderNumber: string; // Human-readable order number
  
  // Customer
  customer: CustomerInfo;
  
  // Addresses
  billingAddress: Address;
  shippingAddress: Address;
  sameAsShipping?: boolean;
  
  // Order items
  items: OrderItem[];
  bundles: OrderBundle[];
  
  // Pricing
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingCost: number;
  grandTotal: number;
  
  // Applied discounts
  appliedCoupons?: {
    code: string;
    discountAmount: number;
  }[];
  
  // Payment
  paymentMethod: string;
  paymentProvider?: string;
  paymentId?: string;
  transactionId?: string;
  paymentStatus: PaymentStatus;
  
  // Order status
  orderStatus: OrderStatus;
  
  // Shipping
  trackingNumber?: string;
  shippingProvider?: string;
  estimatedDelivery?: Date;
  
  // Notes
  customerNote?: string;
  internalNote?: string;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
}

// Create order payload
export interface CreateOrderPayload {
  cartId: string;
  customer: CustomerInfo;
  billingAddress: Address;
  shippingAddress: Address;
  sameAsShipping?: boolean;
  paymentMethod: string;
  customerNote?: string;
}

// Order list item for display
export interface OrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  grandTotal: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  itemCount: number;
  createdAt: Date;
}

// Order status update
export interface UpdateOrderStatusPayload {
  orderId: string;
  orderStatus?: OrderStatus;
  trackingNumber?: string;
  shippingProvider?: string;
  internalNote?: string;
}
