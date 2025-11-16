/**
 * Cart Manager - Shopping Cart Operations
 * SOLID: Single Responsibility - Only cart operations
 */

import { BaseManager, QueryOptions } from './base.manager';
import type {
  Cart,
  CartItem,
  CartBundle,
  AddToCartPayload,
  AddBundleToCartPayload,
  UpdateCartItemPayload,
  CartSummary
} from '@/lib/models';
import { getProductManager } from './product.manager';

export class CartManager extends BaseManager<Cart> {
  private productManager = getProductManager();

  constructor() {
    super('carts');
  }

  /**
   * Create or get cart for user/session
   */
  async getOrCreateCart(
    userId?: string,
    sessionId?: string
  ): Promise<Cart> {
    // Find existing cart
    const filters = userId
      ? [{ field: 'userId', operator: '==' as const, value: userId }]
      : [{ field: 'sessionId', operator: '==' as const, value: sessionId }];

    const existingCarts = await this.query({
      filters: [
        ...filters,
        { field: 'status', operator: '==' as const, value: 'active' }
      ]
    });

    if (existingCarts.length > 0) {
      return existingCarts[0];
    }

    // Create new cart
    const cartId = `cart_${Date.now()}_${sessionId || 'guest'}`;
    
    const cartData: any = {
      sessionId,
      items: [],
      bundles: [],
      subtotal: 0,
      discountTotal: 0,
      taxTotal: 0,
      shippingTotal: 0,
      grandTotal: 0,
      status: 'active',
      lastActivityAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Only add userId if it exists
    if (userId) {
      cartData.userId = userId;
    }

    return this.create(cartId, cartData);
  }

  /**
   * Add item to cart
   */
  async addItem(
    cartId: string,
    payload: AddToCartPayload
  ): Promise<Cart> {
    const cart = await this.getById(cartId);
    if (!cart) throw new Error('Cart not found');

    const product = await this.productManager.getById(payload.productId);
    if (!product) throw new Error('Product not found');

    // Check stock
    if (product.trackInventory && product.stockQuantity < payload.quantity) {
      throw new Error('Insufficient stock');
    }

    // Check if item already exists
    const existingItemIndex = cart.items.findIndex(
      item =>
        item.productId === payload.productId &&
        item.variationId === payload.variationId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += payload.quantity;
      cart.items[existingItemIndex].totalPrice =
        cart.items[existingItemIndex].unitPrice *
        cart.items[existingItemIndex].quantity;
      cart.items[existingItemIndex].updatedAt = new Date();
    } else {
      // Add new item
      const price = product.salePrice || product.basePrice;
      const primaryImage = product.images.find(img => img.isPrimary) 
        || product.images[0];

      const newItem: CartItem = {
        id: `item_${Date.now()}_${Math.random()}`,
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: primaryImage,
        unitPrice: price,
        totalPrice: price * payload.quantity,
        quantity: payload.quantity,
        maxQuantity: product.stockQuantity,
        variationId: payload.variationId,
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        addedAt: new Date(),
        updatedAt: new Date()
      };

      cart.items.push(newItem);
    }

    // Recalculate totals
    await this.recalculateCart(cart);
    
    await this.update(cartId, {
      items: cart.items,
      subtotal: cart.subtotal,
      grandTotal: cart.grandTotal,
      lastActivityAt: new Date()
    });

    return cart;
  }

  /**
   * Update cart item quantity
   */
  async updateItemQuantity(
    cartId: string,
    payload: UpdateCartItemPayload
  ): Promise<Cart> {
    const cart = await this.getById(cartId);
    if (!cart) throw new Error('Cart not found');

    const itemIndex = cart.items.findIndex(
      item => item.id === payload.cartItemId
    );

    if (itemIndex === -1) {
      throw new Error('Cart item not found');
    }

    // Update quantity
    cart.items[itemIndex].quantity = payload.quantity;
    cart.items[itemIndex].totalPrice =
      cart.items[itemIndex].unitPrice * payload.quantity;
    cart.items[itemIndex].updatedAt = new Date();

    // Recalculate totals
    await this.recalculateCart(cart);

    await this.update(cartId, {
      items: cart.items,
      subtotal: cart.subtotal,
      grandTotal: cart.grandTotal,
      lastActivityAt: new Date()
    });

    return cart;
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartId: string, cartItemId: string): Promise<Cart> {
    const cart = await this.getById(cartId);
    if (!cart) throw new Error('Cart not found');

    cart.items = cart.items.filter(item => item.id !== cartItemId);

    // Recalculate totals
    await this.recalculateCart(cart);

    await this.update(cartId, {
      items: cart.items,
      subtotal: cart.subtotal,
      grandTotal: cart.grandTotal,
      lastActivityAt: new Date()
    });

    return cart;
  }

  /**
   * Clear cart
   */
  async clearCart(cartId: string): Promise<void> {
    await this.update(cartId, {
      items: [],
      bundles: [],
      subtotal: 0,
      discountTotal: 0,
      taxTotal: 0,
      shippingTotal: 0,
      grandTotal: 0,
      appliedCoupons: [],
      lastActivityAt: new Date()
    });
  }

  /**
   * Get cart summary
   */
  getCartSummary(cart: Cart): CartSummary {
    return {
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      bundleCount: cart.bundles.reduce((sum, bundle) => sum + bundle.quantity, 0),
      subtotal: cart.subtotal,
      discountTotal: cart.discountTotal,
      grandTotal: cart.grandTotal,
      hasItems: cart.items.length > 0 || cart.bundles.length > 0
    };
  }

  /**
   * Recalculate cart totals
   */
  private async recalculateCart(cart: Cart): Promise<void> {
    // Calculate subtotal
    const itemsSubtotal = cart.items.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );

    const bundlesSubtotal = cart.bundles.reduce(
      (sum, bundle) => sum + (bundle.discountedPrice * bundle.quantity),
      0
    );

    cart.subtotal = itemsSubtotal + bundlesSubtotal;

    // Calculate shipping (free shipping over 300 TRY)
    cart.shippingTotal = cart.subtotal >= 300 ? 0 : 29.90;

    // Apply discounts
    cart.discountTotal = cart.appliedCoupons?.reduce(
      (sum, coupon) => sum + coupon.discountAmount,
      0
    ) || 0;

    // Grand total
    cart.grandTotal = 
      cart.subtotal + 
      cart.shippingTotal + 
      cart.taxTotal - 
      cart.discountTotal;
  }
}

// Singleton instance
let cartManagerInstance: CartManager | null = null;

export function getCartManager(): CartManager {
  if (!cartManagerInstance) {
    cartManagerInstance = new CartManager();
  }
  return cartManagerInstance;
}
