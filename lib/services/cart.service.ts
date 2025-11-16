/**
 * Cart Service - Frontend API Client for Cart Operations
 * SOLID: Single Responsibility - Only cart API calls
 */

import type {
  Cart,
  CartSummary,
  AddToCartPayload,
  UpdateCartItemPayload
} from '@/lib/models';

export interface CartResponse {
  success: boolean;
  data?: {
    cart: Cart;
    summary: CartSummary;
  };
  message?: string;
  error?: string;
}

class CartService {
  private baseUrl = '/api/cart';

  /**
   * Get or create cart
   */
  async getCart(): Promise<CartResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        credentials: 'include'
      });

      return await response.json();
    } catch (error) {
      console.error('Get cart error:', error);
      return {
        success: false,
        error: 'Failed to get cart'
      };
    }
  }

  /**
   * Add item to cart
   */
  async addItem(
    cartId: string,
    payload: AddToCartPayload
  ): Promise<CartResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cartId, ...payload })
      });

      return await response.json();
    } catch (error) {
      console.error('Add to cart error:', error);
      return {
        success: false,
        error: 'Failed to add item'
      };
    }
  }

  /**
   * Update item quantity
   */
  async updateItem(
    cartId: string,
    payload: UpdateCartItemPayload
  ): Promise<CartResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/update`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cartId, ...payload })
      });

      return await response.json();
    } catch (error) {
      console.error('Update cart error:', error);
      return {
        success: false,
        error: 'Failed to update cart'
      };
    }
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartId: string, cartItemId: string): Promise<CartResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/remove?cartId=${cartId}&cartItemId=${cartItemId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Remove from cart error:', error);
      return {
        success: false,
        error: 'Failed to remove item'
      };
    }
  }

  /**
   * Clear cart
   */
  async clearCart(cartId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(
        `${this.baseUrl}/clear?cartId=${cartId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      return await response.json();
    } catch (error) {
      console.error('Clear cart error:', error);
      return {
        success: false,
        error: 'Failed to clear cart'
      };
    }
  }

  /**
   * Add multiple items (bulk add)
   */
  async addMultipleItems(
    cartId: string,
    items: AddToCartPayload[]
  ): Promise<CartResponse> {
    try {
      // Add items sequentially (can be optimized with batch endpoint)
      let lastResponse: CartResponse = { success: false };

      for (const item of items) {
        lastResponse = await this.addItem(cartId, item);
        if (!lastResponse.success) {
          break;
        }
      }

      return lastResponse;
    } catch (error) {
      console.error('Bulk add error:', error);
      return {
        success: false,
        error: 'Failed to add items'
      };
    }
  }
}

// Singleton instance
let cartServiceInstance: CartService | null = null;

export function getCartService(): CartService {
  if (!cartServiceInstance) {
    cartServiceInstance = new CartService();
  }
  return cartServiceInstance;
}

export default CartService;
