/**
 * Clear Cart API - DELETE /api/cart/clear
 * Clear all items from cart
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCartManager } from '@/lib/managers';

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cartId = searchParams.get('cartId');

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'Cart ID is required' },
        { status: 400 }
      );
    }

    const cartManager = getCartManager();
    await cartManager.clearCart(cartId);

    return NextResponse.json({
      success: true,
      message: 'Cart cleared'
    });

  } catch (error) {
    console.error('Clear cart error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear cart'
      },
      { status: 500 }
    );
  }
}
