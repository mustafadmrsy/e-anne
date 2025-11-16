/**
 * Update Cart Item API - PATCH /api/cart/update
 * Update item quantity in cart
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCartManager } from '@/lib/managers';
import type { UpdateCartItemPayload } from '@/lib/models';

export async function PATCH(req: NextRequest) {
  try {
    const body: UpdateCartItemPayload & { cartId: string } = await req.json();

    // Validate input
    if (!body.cartId || !body.cartItemId) {
      return NextResponse.json(
        { success: false, error: 'Cart ID and item ID are required' },
        { status: 400 }
      );
    }

    if (body.quantity < 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity must be non-negative' },
        { status: 400 }
      );
    }

    const cartManager = getCartManager();

    // If quantity is 0, remove item
    if (body.quantity === 0) {
      const cart = await cartManager.removeItem(body.cartId, body.cartItemId);
      const summary = cartManager.getCartSummary(cart);

      return NextResponse.json({
        success: true,
        data: { cart, summary },
        message: 'Item removed from cart'
      });
    }

    // Update quantity
    const cart = await cartManager.updateItemQuantity(body.cartId, {
      cartItemId: body.cartItemId,
      quantity: body.quantity
    });

    const summary = cartManager.getCartSummary(cart);

    return NextResponse.json({
      success: true,
      data: { cart, summary },
      message: 'Cart updated'
    });

  } catch (error) {
    console.error('Update cart error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update cart'
      },
      { status: 500 }
    );
  }
}
