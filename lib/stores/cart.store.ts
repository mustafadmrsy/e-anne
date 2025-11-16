/**
 * Cart Store - Zustand State Management for Cart
 * SOLID: Single Responsibility - Only cart state management
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart, CartSummary, AddToCartPayload } from '@/lib/models';
import { getCartService } from '@/lib/services';

interface CartStore {
  // State
  cart: Cart | null;
  summary: CartSummary | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeCart: () => Promise<void>;
  addToCart: (payload: AddToCartPayload) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      cart: null,
      summary: null,
      isLoading: false,
      error: null,

      // Initialize cart (get or create)
      initializeCart: async () => {
        const state = get();
        
        // Skip if already initialized
        if (state.cart && !state.isLoading) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // Check for legacy cart in localStorage
          const legacyCart = typeof window !== 'undefined' 
            ? localStorage.getItem('e-anne:cart') 
            : null;

          if (legacyCart) {
            try {
              const legacyItems = JSON.parse(legacyCart) as Array<{
                slug: string;
                name: string;
                price: number;
                image: string;
                qty: number;
                sellerId?: string;
                productId?: string;
              }>;

              // Migrate legacy cart to new system
              if (legacyItems.length > 0) {
                // Create a simple cart object from legacy data
                const subtotal = legacyItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
                const itemCount = legacyItems.reduce((sum, item) => sum + item.qty, 0);

                const migratedCart: Cart = {
                  id: `legacy-${Date.now()}`,
                  userId: null,
                  sessionId: null,
                  items: legacyItems.map((item, index) => ({
                    id: `legacy-item-${index}`,
                    productId: item.productId || item.slug,
                    productName: item.name,
                    productSlug: item.slug,
                    productImage: item.image,
                    basePrice: item.price,
                    quantity: item.qty,
                    selectedVariations: [],
                    totalPrice: item.price * item.qty
                  })),
                  bundles: [],
                  subtotal,
                  discountTotal: 0,
                  taxTotal: 0,
                  shippingTotal: subtotal >= 300 ? 0 : 29.90,
                  grandTotal: subtotal + (subtotal >= 300 ? 0 : 29.90),
                  status: 'active',
                  lastActivityAt: new Date(),
                  createdAt: new Date(),
                  updatedAt: new Date()
                } as any;

                const migratedSummary: CartSummary = {
                  itemCount,
                  bundleCount: 0,
                  subtotal,
                  discountTotal: 0,
                  grandTotal: migratedCart.grandTotal,
                  hasItems: true
                };

                set({
                  cart: migratedCart,
                  summary: migratedSummary,
                  isLoading: false
                });

                // Clear legacy cart
                localStorage.removeItem('e-anne:cart');
                
                return;
              }
            } catch (legacyError) {
              console.error('Legacy cart migration error:', legacyError);
            }
          }

          const cartService = getCartService();
          const result = await cartService.getCart();

          if (result.success && result.data) {
            set({
              cart: result.data.cart,
              summary: result.data.summary,
              isLoading: false
            });
          } else {
            throw new Error(result.error || 'Failed to initialize cart');
          }
        } catch (error) {
          console.error('Initialize cart error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to initialize cart',
            isLoading: false
          });
        }
      },

      // Add item to cart
      addToCart: async (payload: AddToCartPayload) => {
        const state = get();
        
        if (!state.cart) {
          await state.initializeCart();
        }

        const cart = get().cart;
        if (!cart) {
          throw new Error('Cart not initialized');
        }

        set({ isLoading: true, error: null });

        try {
          const cartService = getCartService();
          const result = await cartService.addItem(cart.id, payload);

          if (result.success && result.data) {
            set({
              cart: result.data.cart,
              summary: result.data.summary,
              isLoading: false
            });
          } else {
            throw new Error(result.error || 'Failed to add item');
          }
        } catch (error) {
          console.error('Add to cart error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to add item',
            isLoading: false
          });
          throw error;
        }
      },

      // Update item quantity
      updateQuantity: async (cartItemId: string, quantity: number) => {
        const state = get();
        const cart = state.cart;

        if (!cart) {
          throw new Error('Cart not initialized');
        }

        set({ isLoading: true, error: null });

        try {
          const cartService = getCartService();
          const result = await cartService.updateItem(cart.id, {
            cartItemId,
            quantity
          });

          if (result.success && result.data) {
            set({
              cart: result.data.cart,
              summary: result.data.summary,
              isLoading: false
            });
          } else {
            throw new Error(result.error || 'Failed to update quantity');
          }
        } catch (error) {
          console.error('Update quantity error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to update quantity',
            isLoading: false
          });
          throw error;
        }
      },

      // Remove item from cart
      removeItem: async (cartItemId: string) => {
        const state = get();
        const cart = state.cart;

        if (!cart) {
          throw new Error('Cart not initialized');
        }

        set({ isLoading: true, error: null });

        try {
          const cartService = getCartService();
          const result = await cartService.removeItem(cart.id, cartItemId);

          if (result.success && result.data) {
            set({
              cart: result.data.cart,
              summary: result.data.summary,
              isLoading: false
            });
          } else {
            throw new Error(result.error || 'Failed to remove item');
          }
        } catch (error) {
          console.error('Remove item error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to remove item',
            isLoading: false
          });
          throw error;
        }
      },

      // Clear cart
      clearCart: async () => {
        const state = get();
        const cart = state.cart;

        if (!cart) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const cartService = getCartService();
          const result = await cartService.clearCart(cart.id);

          if (result.success) {
            set({
              cart: { ...cart, items: [], bundles: [] },
              summary: {
                itemCount: 0,
                bundleCount: 0,
                subtotal: 0,
                discountTotal: 0,
                grandTotal: 0,
                hasItems: false
              },
              isLoading: false
            });
          } else {
            throw new Error(result.error || 'Failed to clear cart');
          }
        } catch (error) {
          console.error('Clear cart error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to clear cart',
            isLoading: false
          });
          throw error;
        }
      },

      // Refresh cart data
      refreshCart: async () => {
        const state = get();
        
        if (!state.cart) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const cartService = getCartService();
          const result = await cartService.getCart();

          if (result.success && result.data) {
            set({
              cart: result.data.cart,
              summary: result.data.summary,
              isLoading: false
            });
          } else {
            throw new Error(result.error || 'Failed to refresh cart');
          }
        } catch (error) {
          console.error('Refresh cart error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to refresh cart',
            isLoading: false
          });
        }
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        cart: state.cart,
        summary: state.summary
      })
    }
  )
);
