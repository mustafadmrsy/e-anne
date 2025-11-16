/**
 * Index file for all managers
 * Exports manager instances and classes
 */

// Base manager
export { BaseManager } from './base.manager';
export type { QueryFilter, QueryOptions } from './base.manager';

// Product manager
export { ProductManager, getProductManager } from './product.manager';

// Cart manager
export { CartManager, getCartManager } from './cart.manager';

// Order manager
export { OrderManager, getOrderManager } from './order.manager';

// Payment manager
export { PaymentManager, getPaymentManager } from './payment.manager';
