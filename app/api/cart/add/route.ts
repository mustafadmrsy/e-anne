/**
 * Add to Cart API - POST /api/cart/add
 * Add item to cart
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCartManager } from '@/lib/managers';
import type { AddToCartPayload } from '@/lib/models';

export async function POST(req: NextRequest) {
  try {
    const body: AddToCartPayload & { cartId: string } = await req.json();

    // Validate input
    if (!body.cartId) {
      return NextResponse.json(
        { success: false, error: 'Cart ID is required' },
        { status: 400 }
      );
    }

    if (!body.productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!body.quantity || body.quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Valid quantity is required' },
        { status: 400 }
      );
    }

    const cartManager = getCartManager();

    // Add item to cart
    const cart = await cartManager.addItem(body.cartId, {
      productId: body.productId,
      quantity: body.quantity,
      variationId: body.variationId
    });

    // Get updated summary
    const summary = cartManager.getCartSummary(cart);

    return NextResponse.json({
      success: true,
      data: {
        cart,
        summary
      },
      message: 'Item added to cart'
    });

  } catch (error) {
    console.error('Add to cart error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add item'
      },
      { status: 500 }
    );
  }
}
