/**
 * Index file for all models
 * Exports all model types for easy importing
 */

// Product models
export type {
  Product,
  ProductSEO,
  ProductImage,
  ProductVariation,
  ProductVariationOption,
  ProductBundle,
  BundleProduct,
  ProductListItem,
  CreateProductPayload,
  UpdateProductPayload
} from './product.model';

// Cart models
export type {
  Cart,
  CartItem,
  CartBundle,
  AppliedCoupon,
  AddToCartPayload,
  AddBundleToCartPayload,
  UpdateCartItemPayload,
  CartSummary,
  BulkAddToCartPayload
} from './cart.model';

// Order models
export type {
  Order,
  OrderItem,
  OrderBundle,
  CustomerInfo,
  Address,
  CreateOrderPayload,
  OrderListItem,
  UpdateOrderStatusPayload
} from './order.model';

export { OrderStatus, PaymentStatus } from './order.model';

// Payment models
export type {
  PaymentRequest,
  PaymentResponse,
  PaymentVerification,
  PaymentWebhookData,
  PaymentRecord,
  PaymentItem,
  ShopierConfig,
  ShopierPaymentParams,
  ShopierFormData
} from './payment.model';

export { PaymentProvider, Currency } from './payment.model';
