/**
 * Remove from Cart API - DELETE /api/cart/remove
 * Remove item from cart
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCartManager } from '@/lib/managers';

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cartId = searchParams.get('cartId');
    const cartItemId = searchParams.get('cartItemId');

    if (!cartId || !cartItemId) {
      return NextResponse.json(
        { success: false, error: 'Cart ID and item ID are required' },
        { status: 400 }
      );
    }

    const cartManager = getCartManager();
    const cart = await cartManager.removeItem(cartId, cartItemId);
    const summary = cartManager.getCartSummary(cart);

    return NextResponse.json({
      success: true,
      data: { cart, summary },
      message: 'Item removed from cart'
    });

  } catch (error) {
    console.error('Remove from cart error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove item'
      },
      { status: 500 }
    );
  }
}
