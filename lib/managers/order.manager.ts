/**
 * Order Manager - Order Operations
 * SOLID: Single Responsibility - Only order operations
 */

import { BaseManager, QueryOptions } from './base.manager';
import type {
  Order,
  OrderItem,
  OrderBundle,
  CreateOrderPayload,
  OrderListItem,
  UpdateOrderStatusPayload
} from '@/lib/models';
import { OrderStatus, PaymentStatus } from '@/lib/models';
import { getCartManager } from './cart.manager';
import { getProductManager } from './product.manager';

export class OrderManager extends BaseManager<Order> {
  private cartManager = getCartManager();
  private productManager = getProductManager();

  constructor() {
    super('orders');
  }

  /**
   * Create order from cart
   */
  async createOrder(payload: CreateOrderPayload): Promise<Order> {
    const cart = payload.cart;

    if (!cart) {
      throw new Error('Cart not found');
    }

    if (cart.items.length === 0 && cart.bundles.length === 0) {
      throw new Error('Cart is empty');
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Convert cart items to order items
    const orderItems: OrderItem[] = (cart.items || []).map((item) => {
      const orderItem: any = {
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productSlug: item.productSlug,
        productImage: typeof item.productImage === 'string' ? item.productImage : (item.productImage as any)?.url || '',
        unitPrice: (item as any).unitPrice || (item as any).basePrice || 0,
        totalPrice: item.totalPrice,
        quantity: item.quantity
      };
      
      // Only add optional fields if they have values
      if (item.sellerId) orderItem.sellerId = item.sellerId;
      if (item.sellerName) orderItem.sellerName = item.sellerName;
      if (item.variationId) orderItem.variationId = item.variationId;
      if (item.variationName) orderItem.variationName = item.variationName;
      if (item.variationValue) orderItem.variationValue = item.variationValue;
      
      return orderItem as OrderItem;
    });

    // Convert cart bundles to order bundles
    const orderBundles: OrderBundle[] = (cart.bundles || []).map((bundle) => ({
      id: bundle.id,
      bundleId: bundle.bundleId,
      bundleName: bundle.bundleName,
      items: bundle.items.map((item) => {
        const orderItem: any = {
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          productSlug: item.productSlug,
          productImage: typeof item.productImage === 'string' ? item.productImage : (item.productImage as any)?.url || '',
          unitPrice: (item as any).unitPrice || (item as any).basePrice || 0,
          totalPrice: item.totalPrice,
          quantity: item.quantity
        };
        
        // Only add optional fields if they have values
        if (item.sellerId) orderItem.sellerId = item.sellerId;
        if (item.sellerName) orderItem.sellerName = item.sellerName;
        
        return orderItem;
      }),
      originalPrice: bundle.originalPrice,
      discountedPrice: bundle.discountedPrice,
      discountAmount: bundle.discountAmount,
      quantity: bundle.quantity
    }));

    // Create order
    const orderId = `order_${Date.now()}`;
    
    const orderData: any = {
      orderNumber,
      customer: payload.customer,
      billingAddress: payload.billingAddress,
      shippingAddress: payload.shippingAddress,
      sameAsShipping: payload.sameAsShipping ?? true,
      items: orderItems,
      bundles: orderBundles,
      subtotal: cart.subtotal || 0,
      discountTotal: cart.discountTotal || 0,
      taxTotal: cart.taxTotal || 0,
      shippingCost: cart.shippingTotal || 0,
      grandTotal: cart.grandTotal || 0,
      paymentMethod: payload.paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      orderStatus: OrderStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Only add optional fields if they have values
    if (cart.appliedCoupons && cart.appliedCoupons.length > 0) {
      orderData.appliedCoupons = cart.appliedCoupons.map((c: { code: any; discountAmount: any; }) => ({
        code: c.code,
        discountAmount: c.discountAmount
      }));
    }

    if (payload.customerNote) {
      orderData.customerNote = payload.customerNote;
    }

    const order = await this.create(orderId, orderData);

    // Update cart status if it's a persistent cart (not legacy)
    const isLegacyCart = cart.id.startsWith('legacy-');
    if (!isLegacyCart) {
      try {
        await this.cartManager.update(cart.id, {
          status: 'converted'
        });
      } catch (error) {
        console.warn('Failed to update cart status:', error);
      }
    }

    // Decrement stock for all items
    await this.decrementStockForOrder(order);

    return order;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(payload: UpdateOrderStatusPayload): Promise<void> {
    const updateData: any = {};

    if (payload.orderStatus) {
      updateData.orderStatus = payload.orderStatus;

      // Update timestamps based on status
      if (payload.orderStatus === OrderStatus.SHIPPED) {
        updateData.shippedAt = new Date();
      } else if (payload.orderStatus === OrderStatus.DELIVERED) {
        updateData.deliveredAt = new Date();
      } else if (payload.orderStatus === OrderStatus.CANCELLED) {
        updateData.cancelledAt = new Date();
      }
    }

    if (payload.trackingNumber) {
      updateData.trackingNumber = payload.trackingNumber;
    }

    if (payload.shippingProvider) {
      updateData.shippingProvider = payload.shippingProvider;
    }

    if (payload.internalNote) {
      updateData.internalNote = payload.internalNote;
    }

    await this.update(payload.orderId, updateData);
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    orderId: string,
    status: PaymentStatus,
    transactionId?: string
  ): Promise<void> {
    const updateData: any = {
      paymentStatus: status
    };

    if (transactionId) {
      updateData.transactionId = transactionId;
    }

    if (status === PaymentStatus.COMPLETED) {
      updateData.paidAt = new Date();
      updateData.orderStatus = OrderStatus.CONFIRMED;
    } else if (status === PaymentStatus.FAILED) {
      updateData.orderStatus = OrderStatus.PAYMENT_FAILED;
    }

    await this.update(orderId, updateData);
  }

  /**
   * Get orders by customer
   */
  async getOrdersByCustomer(
    userId: string,
    options?: QueryOptions
  ): Promise<Order[]> {
    return this.query({
      ...options,
      filters: [
        ...(options?.filters || []),
        { field: 'customer.userId', operator: '==', value: userId }
      ],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  /**
   * Get order by number
   */
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const results = await this.query({
      filters: [{ field: 'orderNumber', operator: '==', value: orderNumber }],
      limit: 1
    });

    return results.length > 0 ? results[0] : null;
  }

  /**
   * Convert to list item
   */
  toListItem(order: Order): OrderListItem {
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      grandTotal: order.grandTotal,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      itemCount,
      createdAt: order.createdAt
    };
  }

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // Get today's order count
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOrders = await this.query({
      filters: [
        { field: 'createdAt', operator: '>=', value: todayStart }
      ]
    });

    const sequence = (todayOrders.length + 1).toString().padStart(4, '0');
    
    return `${year}${month}${day}-${sequence}`;
  }

  /**
   * Decrement stock for order items
   */
  private async decrementStockForOrder(order: Order): Promise<void> {
    // Regular items
    for (const item of order.items) {
      try {
        await this.productManager.decrementStock(
          item.productId,
          item.quantity
        );
      } catch (error) {
        console.error(`Failed to decrement stock for ${item.productId}:`, error);
      }
    }

    // Bundle items
    for (const bundle of order.bundles) {
      for (const item of bundle.items) {
        try {
          await this.productManager.decrementStock(
            item.productId,
            item.quantity * bundle.quantity
          );
        } catch (error) {
          console.error(`Failed to decrement stock for ${item.productId}:`, error);
        }
      }
    }
  }
}

// Singleton instance
let orderManagerInstance: OrderManager | null = null;

export function getOrderManager(): OrderManager {
  if (!orderManagerInstance) {
    orderManagerInstance = new OrderManager();
  }
  return orderManagerInstance;
}
