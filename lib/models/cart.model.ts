/**
 * Cart Models - Shopping Cart Type Definitions
 * SOLID: Single Responsibility - Cart-related types only
 */

import { ProductImage } from './product.model';

// Cart item - represents a product in cart
export interface CartItem {
  id: string; // Unique cart item ID
  productId: string;
  productName: string;
  productSlug: string;
  productImage: ProductImage;
  
  // Pricing
  unitPrice: number;
  totalPrice: number;
  
  // Quantity
  quantity: number;
  maxQuantity: number; // Stock limit
  
  // Variation if selected
  variationId?: string;
  variationName?: string;
  variationValue?: string;
  
  // Seller info
  sellerId: string;
  sellerName?: string;
  
  // Timestamps
  addedAt: Date;
  updatedAt: Date;
}

// Bundle in cart
export interface CartBundle {
  id: string; // Unique cart bundle ID
  bundleId: string;
  bundleName: string;
  items: CartItem[];
  
  // Pricing
  originalPrice: number;
  discountedPrice: number;
  discountAmount: number;
  
  quantity: number;
  
  addedAt: Date;
  updatedAt: Date;
}

// Shopping Cart
export interface Cart {
  id: string;
  userId?: string; // Undefined for guest carts
  sessionId?: string; // For guest tracking
  
  items: CartItem[];
  bundles: CartBundle[];
  
  // Pricing summary
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
  
  // Applied discounts/coupons
  appliedCoupons?: AppliedCoupon[];
  
  // Status
  status: 'active' | 'abandoned' | 'converted' | 'merged';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  expiresAt?: Date; // For abandoned cart cleanup
}

// Applied coupon/discount
export interface AppliedCoupon {
  code: string;
  discountType: 'percentage' | 'fixed' | 'shipping';
  discountValue: number;
  discountAmount: number;
  appliedAt: Date;
}

// Add to cart payload
export interface AddToCartPayload {
  productId: string;
  quantity: number;
  variationId?: string;
}

// Add bundle to cart payload
export interface AddBundleToCartPayload {
  bundleId: string;
  quantity: number;
}

// Update cart item payload
export interface UpdateCartItemPayload {
  cartItemId: string;
  quantity: number;
}

// Cart summary for display
export interface CartSummary {
  itemCount: number;
  bundleCount: number;
  subtotal: number;
  discountTotal: number;
  grandTotal: number;
  hasItems: boolean;
}

// Bulk add to cart (for promotions)
export interface BulkAddToCartPayload {
  items: AddToCartPayload[];
  bundles?: AddBundleToCartPayload[];
}
