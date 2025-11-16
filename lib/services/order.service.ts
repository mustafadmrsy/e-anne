/**
 * Order Service - Frontend API Client for Order Operations
 * SOLID: Single Responsibility - Only order API calls
 */

import type { Order, OrderListItem } from '@/lib/models';

export interface OrderResponse {
  success: boolean;
  data?: {
    order: Order;
  };
  error?: string;
}

export interface OrdersListResponse {
  success: boolean;
  data?: {
    orders: OrderListItem[];
    count: number;
  };
  error?: string;
}

class OrderService {
  private baseUrl = '/api/orders';

  /**
   * Get all user orders
   */
  async getOrders(): Promise<OrdersListResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        credentials: 'include'
      });

      return await response.json();
    } catch (error) {
      console.error('Get orders error:', error);
      return {
        success: false,
        error: 'Failed to get orders'
      };
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<OrderResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/${orderId}`, {
        method: 'GET',
        credentials: 'include'
      });

      return await response.json();
    } catch (error) {
      console.error('Get order error:', error);
      return {
        success: false,
        error: 'Failed to get order'
      };
    }
  }
}

// Singleton instance
let orderServiceInstance: OrderService | null = null;

export function getOrderService(): OrderService {
  if (!orderServiceInstance) {
    orderServiceInstance = new OrderService();
  }
  return orderServiceInstance;
}

export default OrderService;
